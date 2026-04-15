import "server-only";

import type {
  OnboardingIntakeMetadata,
  OnboardingLaneClassification,
} from "@/lib/control/types";
import { classifyOnboardingLane } from "@/lib/service-request-routing";

export type PracticeTextMessage = {
  role: "assistant" | "user";
  content: string;
};

export type PracticeTextSnapshot = {
  laneClassification: OnboardingLaneClassification;
  capturedFields: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    companyName: string | null;
    vehicle: string | null;
    route: string | null;
    fundingGoal: string | null;
    useCase: string | null;
  };
  transcriptSummary: string;
  missingFields: string[];
  readyForRouting: boolean;
};

export type PracticeTextTurnResult = {
  reply: string;
  snapshot: PracticeTextSnapshot;
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN =
  /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}\b/;
const FUNDING_PATTERN = /\$\s?(\d[\d,]*(?:\.\d{2})?)/i;

function isoNow() {
  return new Date().toISOString();
}

function trimOrNull(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function transcriptText(messages: PracticeTextMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join(" ");
}

function inferAudience(text: string) {
  if (/\b(subcontractor|carrier|driver|tow|dispatcher|inspector network)\b/i.test(text)) {
    return "subcontractor" as const;
  }

  if (/\b(employee|work for you|join the team|hiring|operator role)\b/i.test(text)) {
    return "employee" as const;
  }

  if (
    /\b(software|application|app|crm|platform|api|automation build|developer|programmer|website|database|marketing|campaign)\b/i.test(
      text,
    )
  ) {
    return "software-buyer" as const;
  }

  return "service-buyer" as const;
}

function inferServiceFamily(text: string) {
  if (
    /\b(fico|credit|funding|loan|lender|underwriting|bookkeeping|tax|ein|business formation|finance)\b/i.test(
      text,
    )
  ) {
    return "finance" as const;
  }

  return "automotive" as const;
}

function inferServiceSlug(text: string) {
  if (/\b(transport|shipping|dispatch|carrier|tow|pickup|delivery)\b/i.test(text)) {
    return "auto-transport";
  }

  if (/\b(dmv|registration|title|plate|license recovery)\b/i.test(text)) {
    return "dmv-concierge";
  }

  if (/\b(parts|parting out|sourcing|inventory)\b/i.test(text)) {
    return "expert-parts-acquisition-and-sourcing";
  }

  if (/\b(bookkeeping|accounting|reconciliation|balance sheet)\b/i.test(text)) {
    return "accounting-book-keeping";
  }

  if (/\b(business formation|llc|corp|ein)\b/i.test(text)) {
    return "business-formation-launch-support";
  }

  if (/\b(fico|credit|funding|loan|lender|underwriting|finance)\b/i.test(text)) {
    return "financial-preparation-lender-matching";
  }

  if (
    /\b(software|application|app|crm|platform|api|automation|developer|programmer|website|database|marketing|campaign)\b/i.test(
      text,
    )
  ) {
    return "client-onboarding";
  }

  return null;
}

function extractFullName(text: string) {
  const match = text.match(
    /\b(?:my name is|i am|i'm|this is)\s+([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+){0,2})/i,
  );
  return match ? titleCase(match[1]) : null;
}

function extractEmail(text: string) {
  return trimOrNull(text.match(EMAIL_PATTERN)?.[0] ?? null);
}

function extractPhone(text: string) {
  const raw = text.match(PHONE_PATTERN)?.[0] ?? null;
  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return trimOrNull(raw);
}

function extractCompany(text: string) {
  const match = text.match(
    /\b(?:company is|business is|company name is|for company)\s+([a-z0-9&.\- ]{3,48})/i,
  );
  return match ? titleCase(match[1].replace(/[.,]$/, "").trim()) : null;
}

function extractVehicle(text: string) {
  const match = text.match(/\b((?:19|20)\d{2}\s+[a-z0-9-]+\s+[a-z0-9-]+)\b/i);
  return match ? titleCase(match[1]) : null;
}

function extractRoute(text: string) {
  const match = text.match(/\bfrom\s+([a-z ,]+?)\s+to\s+([a-z ,]+?)(?:[.?!]|$)/i);
  if (!match) {
    return null;
  }

  return `${titleCase(match[1].trim())} -> ${titleCase(match[2].trim())}`;
}

function extractFundingGoal(text: string) {
  const match = text.match(FUNDING_PATTERN);
  return match ? `$${match[1]}` : null;
}

function buildTranscriptSummary(text: string, classification: OnboardingLaneClassification) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return `Practice conversation started for ${classification.routedServiceSlug}.`;
  }

  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
}

function buildPracticeMetadata(input: {
  audience: "employee" | "subcontractor" | "service-buyer" | "software-buyer";
  family: "finance" | "automotive";
  serviceSlug: string | null;
  text: string;
}): OnboardingIntakeMetadata {
  const url = new URL("https://pushingsecurity-control-preview.pushingcap.com/practice-text");
  url.searchParams.set("audience", input.audience);
  url.searchParams.set("family", input.family);
  if (input.serviceSlug) {
    url.searchParams.set("service", input.serviceSlug);
  }

  return {
    submittedAt: isoNow(),
    sourceLabel: "practice-text",
    pageUrl: url.toString(),
    pagePath: "/practice-text",
    referrer: "https://pushingcapital.com",
    userAgent: null,
    ipAddress: null,
    requestId: null,
    browserLanguage: null,
    browserTimeZone: null,
    screenWidth: null,
    screenHeight: null,
    viewportWidth: null,
    viewportHeight: null,
    country: null,
    region: null,
    city: null,
    utmSource: "practice-text",
    utmMedium: "chat",
    utmCampaign: "pushing-p-practice",
    utmTerm: null,
    utmContent: input.text,
    gclid: null,
    fbclid: null,
  };
}

function buildMissingFields(input: {
  classification: OnboardingLaneClassification;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  vehicle: string | null;
  route: string | null;
  fundingGoal: string | null;
}) {
  const missing: string[] = [];

  if (!input.fullName) {
    missing.push("full_name");
  }

  if (!input.phone && !input.email) {
    missing.push("contact_method");
  }

  if (
    input.classification.intakeAudience === "software-buyer" &&
    !input.companyName
  ) {
    missing.push("company_name");
  }

  if (
    input.classification.intakeAudience === "subcontractor" &&
    !input.route
  ) {
    missing.push("coverage_area");
  }

  if (input.classification.routedServiceSlug === "auto-transport") {
    if (!input.vehicle) {
      missing.push("vehicle");
    }
    if (!input.route) {
      missing.push("route");
    }
  }

  if (
    input.classification.routedServiceSlug === "financial-preparation-lender-matching" &&
    !input.fundingGoal
  ) {
    missing.push("funding_goal");
  }

  return missing;
}

function nextQuestion(input: {
  missingFields: string[];
  classification: OnboardingLaneClassification;
}) {
  const firstMissing = input.missingFields[0] ?? null;

  switch (firstMissing) {
    case "full_name":
      return "What name should I place on the request?";
    case "contact_method":
      return "What is the best mobile number or email for updates?";
    case "company_name":
      return "What company should I tie this software request to?";
    case "vehicle":
      return "What vehicle should I place on the transport request?";
    case "route":
      return "What is the route, pickup city to delivery city?";
    case "funding_goal":
      return "About how much financing are you trying to line up?";
    case "coverage_area":
      return "What service area or territory should I place on your subcontractor profile?";
    default:
      if (input.classification.serviceFamily === "finance") {
        return "I have enough to route the finance lane. Do you want me to prepare the underwriting-ready intake next?";
      }

      return "I have enough to route the automotive lane. Do you want me to prepare the onboarding shell next?";
  }
}

function buildReply(input: {
  classification: OnboardingLaneClassification;
  missingFields: string[];
}) {
  const laneLabel = input.classification.serviceFamily === "finance" ? "finance" : "automotive";
  const next = nextQuestion(input);

  if (input.missingFields.length) {
    return `I can route this into the ${laneLabel} lane and start the ${input.classification.routedServiceSlug} shell. ${next}`;
  }

  return `Perfect. I can route this into ${input.classification.routedServiceSlug}, hand it to ${input.classification.recommendedWorkflowKey}, and send the user toward ${input.classification.recommendedLoginPath}. ${next}`;
}

export function runPracticeTextAgent(messages: PracticeTextMessage[]): PracticeTextTurnResult {
  const text = transcriptText(messages);
  const audience = inferAudience(text);
  const family = inferServiceFamily(text);
  const serviceSlug = inferServiceSlug(text);
  const metadata = buildPracticeMetadata({
    audience,
    family,
    serviceSlug,
    text,
  });
  const laneClassification = classifyOnboardingLane({
    intakeAudience: audience,
    serviceFamily: family,
    metadata,
  });

  const capturedFields = {
    fullName: extractFullName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    companyName: extractCompany(text),
    vehicle: extractVehicle(text),
    route: extractRoute(text),
    fundingGoal: extractFundingGoal(text),
    useCase: trimOrNull(text),
  };

  const missingFields = buildMissingFields({
    classification: laneClassification,
    ...capturedFields,
  });

  const snapshot: PracticeTextSnapshot = {
    laneClassification,
    capturedFields,
    transcriptSummary: buildTranscriptSummary(text, laneClassification),
    missingFields,
    readyForRouting: missingFields.length === 0,
  };

  return {
    reply: buildReply({
      classification: laneClassification,
      missingFields,
    }),
    snapshot,
  };
}
