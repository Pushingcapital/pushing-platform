import "server-only";

import type {
  DriverLicenseParseResult,
  OnboardingIntakeMetadata,
  OnboardingLaneClassification,
} from "@/lib/control/types";

const DEFAULT_SERVICE_SLUG = "service-request-pipeline";

const SERVICE_DEAL_ROUTING = {
  "accounting-book-keeping": {
    pipelineId: "1087813364",
    stageId: "1704130278",
    category: "business",
  },
  "auto-consignment-services": {
    pipelineId: "1078181566",
    stageId: "1689443011",
    category: "automotive",
  },
  "auto-insurance-claim": {
    pipelineId: "1412521672",
    stageId: "2297900790",
    category: "automotive",
  },
  "auto-purchase": {
    pipelineId: "1078181568",
    stageId: "1689443025",
    category: "automotive",
  },
  "auto-repair": {
    pipelineId: "1078179518",
    stageId: "1684571881",
    category: "automotive",
  },
  "auto-transport": {
    pipelineId: "1010023152",
    stageId: "1560258245",
    category: "automotive",
  },
  "business-formation-launch-support": {
    pipelineId: "1080110824",
    stageId: "1690734307",
    category: "business",
  },
  "client-onboarding": {
    pipelineId: "t_f5b6ba3f1d0fa065d860b3972ad5264d",
    stageId: "2152176337",
    category: "operations",
  },
  "course-discovery-enrollment": {
    pipelineId: "1504342776",
    stageId: "2423496405",
    category: "education",
  },
  "dmv-concierge": {
    pipelineId: "1078181570",
    stageId: "1690771147",
    category: "automotive",
  },
  "expert-parts-acquisition-and-sourcing": {
    pipelineId: "1078181571",
    stageId: "1690771159",
    category: "automotive",
  },
  "financial-preparation-lender-matching": {
    pipelineId: "1080110825",
    stageId: "1941502683",
    category: "finance",
  },
  "onboarding-deal-architect": {
    pipelineId: "1504540394",
    stageId: "2425253623",
    category: "operations",
  },
  "service-request-pipeline": {
    pipelineId: "1244566256",
    stageId: "2008799971",
    category: "operations",
  },
} as const;

const SERVICE_TICKET_ROUTING = {
  "auto-repair": {
    pipelineId: "1428504282",
    stageId: "2299683529",
  },
  "auto-transport": {
    pipelineId: "1427939004",
    stageId: "2300136158",
  },
  "business-formation-launch-support": {
    pipelineId: "1427939011",
    stageId: "2300137192",
  },
  "client-onboarding": {
    pipelineId: "1428504280",
    stageId: "2299682550",
  },
  "course-discovery-enrollment": {
    pipelineId: "1504342776",
    stageId: "2423496405",
  },
  "dmv-concierge": {
    pipelineId: "1427939014",
    stageId: "2300138203",
  },
  "expert-parts-acquisition-and-sourcing": {
    pipelineId: "1427939015",
    stageId: "2300138218",
  },
  "financial-preparation-lender-matching": {
    pipelineId: "1427939013",
    stageId: "2300138180",
  },
  "service-request-pipeline": {
    pipelineId: "1427939018",
    stageId: "2300139210",
  },
} as const;

const KNOWN_SERVICE_SLUGS = new Set(Object.keys(SERVICE_DEAL_ROUTING));

type IntakeAudience =
  | "employee"
  | "subcontractor"
  | "service-buyer"
  | "software-buyer";

type ServiceFamily = "finance" | "automotive";

type ClassificationInput = {
  intakeAudience: IntakeAudience;
  serviceFamily: ServiceFamily;
  metadata: OnboardingIntakeMetadata;
  licenseParse?: DriverLicenseParseResult | null;
};

function isoNow() {
  return new Date().toISOString();
}

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractQueryValue(pageUrl: string | null, key: string) {
  if (!pageUrl) {
    return null;
  }

  try {
    const url = new URL(pageUrl);
    return trimNullable(url.searchParams.get(key));
  } catch {
    return null;
  }
}

function normalizeAudience(value: string | null | undefined): IntakeAudience | null {
  switch (String(value ?? "").trim().toLowerCase()) {
    case "employee":
      return "employee";
    case "subcontractor":
      return "subcontractor";
    case "service-buyer":
    case "service_buyer":
    case "servicebuyer":
      return "service-buyer";
    case "software-buyer":
    case "software_buyer":
    case "softwarebuyer":
    case "application-buyer":
    case "application_buyer":
      return "software-buyer";
    default:
      return null;
  }
}

function normalizeServiceFamily(
  value: string | null | undefined,
): ServiceFamily | null {
  switch (String(value ?? "").trim().toLowerCase()) {
    case "finance":
      return "finance";
    case "automotive":
      return "automotive";
    default:
      return null;
  }
}

function normalizeServiceSlug(value: string | null | undefined) {
  const slug = trimNullable(value);

  if (!slug || !KNOWN_SERVICE_SLUGS.has(slug)) {
    return null;
  }

  return slug;
}

function buildSignalText(metadata: OnboardingIntakeMetadata) {
  return [
    metadata.pageUrl,
    metadata.pagePath,
    metadata.referrer,
    metadata.utmSource,
    metadata.utmMedium,
    metadata.utmCampaign,
    metadata.utmTerm,
    metadata.utmContent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function resolveServiceBySignals({
  serviceFamily,
  metadata,
}: {
  serviceFamily: ServiceFamily;
  metadata: OnboardingIntakeMetadata;
}) {
  const signalText = buildSignalText(metadata);

  if (signalText.includes("transport") || signalText.includes("dispatch")) {
    return {
      slug: "auto-transport",
      reason: "Routing inferred from transport/dispatch intake signals.",
      confidence: 0.89,
    };
  }

  if (
    signalText.includes("dmv") ||
    signalText.includes("registration") ||
    signalText.includes("title") ||
    signalText.includes("plate") ||
    signalText.includes("license-recovery")
  ) {
    return {
      slug: "dmv-concierge",
      reason: "Routing inferred from DMV/title/registration intake signals.",
      confidence: 0.9,
    };
  }

  if (
    signalText.includes("part") ||
    signalText.includes("sourcing") ||
    signalText.includes("inventory")
  ) {
    return {
      slug: "expert-parts-acquisition-and-sourcing",
      reason: "Routing inferred from parts and sourcing intake signals.",
      confidence: 0.88,
    };
  }

  if (
    signalText.includes("inspection") ||
    signalText.includes("repair") ||
    signalText.includes("diagnostic") ||
    signalText.includes("mechanic")
  ) {
    return {
      slug: "auto-repair",
      reason: "Routing inferred from inspection/repair intake signals.",
      confidence: 0.84,
    };
  }

  if (
    signalText.includes("finance") ||
    signalText.includes("credit") ||
    signalText.includes("fico") ||
    signalText.includes("lender") ||
    signalText.includes("underwriting") ||
    signalText.includes("loan")
  ) {
    return {
      slug: "financial-preparation-lender-matching",
      reason: "Routing inferred from finance/lender intake signals.",
      confidence: 0.9,
    };
  }

  if (
    signalText.includes("course") ||
    signalText.includes("dealer") ||
    signalText.includes("training")
  ) {
    return {
      slug: "course-discovery-enrollment",
      reason: "Routing inferred from course/training intake signals.",
      confidence: 0.85,
    };
  }

  if (
    signalText.includes("business") ||
    signalText.includes("formation") ||
    signalText.includes("ein") ||
    signalText.includes("llc") ||
    signalText.includes("corp")
  ) {
    return {
      slug: "business-formation-launch-support",
      reason: "Routing inferred from business-formation intake signals.",
      confidence: 0.86,
    };
  }

  if (serviceFamily === "finance") {
    return {
      slug: "financial-preparation-lender-matching",
      reason: "Finance intake defaults into the lender-readiness and matching workflow.",
      confidence: 0.72,
    };
  }

  return {
    slug: "service-request-pipeline",
    reason: "Automotive intake defaults into the general automotive service-request workflow until a narrower route is declared.",
    confidence: 0.66,
  };
}

function resolveLoginAndWorkflow(input: {
  intakeAudience: IntakeAudience;
  serviceFamily: ServiceFamily;
  routedServiceSlug: string;
}) {
  if (input.intakeAudience === "employee") {
    return {
      recommendedLoginPath: "/login?portal=employee",
      recommendedWorkflowKey: "employee-onboarding",
    };
  }

  if (input.intakeAudience === "subcontractor") {
    return {
      recommendedLoginPath: "/subcontractor",
      recommendedWorkflowKey: "subcontractor-onboarding",
    };
  }

  if (input.intakeAudience === "software-buyer") {
    return {
      recommendedLoginPath: "/login?portal=platform",
      recommendedWorkflowKey: "software-sales-onboarding",
    };
  }

  if (input.serviceFamily === "finance") {
    return {
      recommendedLoginPath: "/login?portal=finance",
      recommendedWorkflowKey: "finance-readiness-and-lender-match",
    };
  }

  return {
    recommendedLoginPath: "/login?portal=automotive",
    recommendedWorkflowKey:
      input.routedServiceSlug === "service-request-pipeline"
        ? "automotive-service-request-routing"
        : `automotive-${input.routedServiceSlug}`,
  };
}

export function classifyOnboardingLane(
  input: ClassificationInput,
): OnboardingLaneClassification {
  const explicitServiceSlug =
    normalizeServiceSlug(extractQueryValue(input.metadata.pageUrl, "service")) ??
    normalizeServiceSlug(extractQueryValue(input.metadata.pageUrl, "serviceSlug")) ??
    normalizeServiceSlug(extractQueryValue(input.metadata.pageUrl, "lane"));
  const explicitAudience =
    normalizeAudience(extractQueryValue(input.metadata.pageUrl, "audience")) ??
    input.intakeAudience;
  const explicitFamily =
    normalizeServiceFamily(extractQueryValue(input.metadata.pageUrl, "family")) ??
    input.serviceFamily;

  const resolved =
    explicitServiceSlug
      ? {
          slug: explicitServiceSlug,
          reason: "Routing was explicitly declared on the onboarding URL.",
          confidence: 0.98,
        }
      : resolveServiceBySignals({
          serviceFamily: explicitFamily,
          metadata: input.metadata,
        });
  const dealRouting =
    SERVICE_DEAL_ROUTING[
      (resolved.slug in SERVICE_DEAL_ROUTING
        ? resolved.slug
        : DEFAULT_SERVICE_SLUG) as keyof typeof SERVICE_DEAL_ROUTING
    ];
  const ticketRouting =
    SERVICE_TICKET_ROUTING[
      (resolved.slug in SERVICE_TICKET_ROUTING
        ? resolved.slug
        : DEFAULT_SERVICE_SLUG) as keyof typeof SERVICE_TICKET_ROUTING
    ] ?? null;
  const followOn = resolveLoginAndWorkflow({
    intakeAudience: explicitAudience,
    serviceFamily: explicitFamily,
    routedServiceSlug: resolved.slug,
  });

  return {
    intakeAudience: explicitAudience,
    serviceFamily: explicitFamily,
    requestedServiceSlug: explicitServiceSlug ?? resolved.slug,
    routedServiceSlug: resolved.slug,
    category: dealRouting.category,
    confidence: resolved.confidence,
    reason: resolved.reason,
    recommendedLoginPath: followOn.recommendedLoginPath,
    recommendedWorkflowKey: followOn.recommendedWorkflowKey,
    notaryFallbackEnabled: true,
    dealPipelineId: dealRouting.pipelineId,
    dealStageId: dealRouting.stageId,
    ticketPipelineId: ticketRouting?.pipelineId ?? null,
    ticketStageId: ticketRouting?.stageId ?? null,
    classifiedAt: isoNow(),
  };
}
