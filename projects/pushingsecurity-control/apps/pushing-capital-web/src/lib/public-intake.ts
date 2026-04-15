import "server-only";

import type {
  DocuSignEnvelopeDispatchReceipt,
  DriverLicenseParseResult,
  OnboardingContactSync,
  OnboardingIntakeMetadata,
  OnboardingLaneClassification,
  OnboardingServiceRequestSync,
} from "@/lib/control/types";
import {
  getPushingCapitalPlatformContactSyncConfig,
  upsertPushingCapitalPlatformContact,
} from "@/lib/platform-contacts";

type MetadataOption = {
  id: keyof OnboardingIntakeMetadata;
  label: string;
  description: string;
};

type BrowserIntakeMetadataInput = {
  pageUrl?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  browserLanguage?: string | null;
  browserTimeZone?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
};

type BuildPublicIntakeMetadataInput = {
  request: Request;
  browserMetadata?: BrowserIntakeMetadataInput;
};

type SyncPublicIntakeContactInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  metadata: OnboardingIntakeMetadata;
  laneClassification?: OnboardingLaneClassification | null;
  serviceRequestSync?: OnboardingServiceRequestSync | null;
  licenseParse?: DriverLicenseParseResult | null;
  onboardingJobId?: string | null;
  docuSignEnvelope?: DocuSignEnvelopeDispatchReceipt | null;
};

const DEFAULT_SOURCE_LABEL = "pushingsecurity.pushingcap.com lead intake";
const DEFAULT_CONTACT_DESTINATION_LABEL = "Pushing Capital Platform Contacts";

export const PUBLIC_INTAKE_METADATA_OPTIONS: MetadataOption[] = [
  {
    id: "submittedAt",
    label: "Submitted At",
    description: "Exact server timestamp when the lead hit submit.",
  },
  {
    id: "sourceLabel",
    label: "Source Label",
    description: "Human-readable source marker for the intake surface.",
  },
  {
    id: "pageUrl",
    label: "Page URL",
    description: "The full landing page URL the visitor submitted from.",
  },
  {
    id: "pagePath",
    label: "Page Path",
    description: "The pathname used for this intake, such as /onboard.",
  },
  {
    id: "referrer",
    label: "Referrer",
    description: "The previous page or site that sent the visitor here.",
  },
  {
    id: "userAgent",
    label: "User Agent",
    description: "Browser/device signature for debugging and fraud review.",
  },
  {
    id: "ipAddress",
    label: "IP Address",
    description: "Best-available client IP from the request headers.",
  },
  {
    id: "requestId",
    label: "Request ID",
    description: "Edge or platform request identifier for tracing a submission.",
  },
  {
    id: "browserLanguage",
    label: "Browser Language",
    description: "The lead's preferred browser locale.",
  },
  {
    id: "browserTimeZone",
    label: "Browser Time Zone",
    description: "The lead's browser-reported time zone.",
  },
  {
    id: "screenWidth",
    label: "Screen Width",
    description: "Physical screen width reported by the browser.",
  },
  {
    id: "screenHeight",
    label: "Screen Height",
    description: "Physical screen height reported by the browser.",
  },
  {
    id: "viewportWidth",
    label: "Viewport Width",
    description: "Current browser viewport width at submit time.",
  },
  {
    id: "viewportHeight",
    label: "Viewport Height",
    description: "Current browser viewport height at submit time.",
  },
  {
    id: "country",
    label: "Country",
    description: "Best-available geo country derived from edge headers.",
  },
  {
    id: "region",
    label: "Region",
    description: "Best-available region or state derived from edge headers.",
  },
  {
    id: "city",
    label: "City",
    description: "Best-available city derived from edge headers.",
  },
  {
    id: "utmSource",
    label: "UTM Source",
    description: "Marketing source tag from the landing URL.",
  },
  {
    id: "utmMedium",
    label: "UTM Medium",
    description: "Marketing medium tag from the landing URL.",
  },
  {
    id: "utmCampaign",
    label: "UTM Campaign",
    description: "Marketing campaign tag from the landing URL.",
  },
  {
    id: "utmTerm",
    label: "UTM Term",
    description: "Paid search term captured from the landing URL.",
  },
  {
    id: "utmContent",
    label: "UTM Content",
    description: "Creative or content variant captured from the landing URL.",
  },
  {
    id: "gclid",
    label: "Google Click ID",
    description: "Google Ads click identifier, when present.",
  },
  {
    id: "fbclid",
    label: "Facebook Click ID",
    description: "Meta click identifier, when present.",
  },
];

function isoNow() {
  return new Date().toISOString();
}

function trimNullable(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildFullName(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => trimNullable(part))
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function buildPublicIntakeContactProfile(input: SyncPublicIntakeContactInput) {
  const legalFields = input.licenseParse?.fields;
  const firstName =
    trimNullable(legalFields?.firstName) ?? trimNullable(input.firstName);
  const middleName = trimNullable(legalFields?.middleName);
  const lastName =
    trimNullable(legalFields?.lastName) ?? trimNullable(input.lastName);
  const fullName =
    trimNullable(legalFields?.fullName) ??
    trimNullable(buildFullName([firstName, middleName, lastName]));
  const addressLine1 = trimNullable(legalFields?.addressLine1);
  const addressLine2 = trimNullable(legalFields?.addressLine2);
  const city = trimNullable(legalFields?.city);
  const state = trimNullable(legalFields?.state);
  const postalCode = trimNullable(legalFields?.postalCode);
  const licenseNumber = trimNullable(legalFields?.licenseNumber);
  const dateOfBirth = trimNullable(legalFields?.dateOfBirth);
  const issueDate = trimNullable(legalFields?.issueDate);
  const expirationDate = trimNullable(legalFields?.expirationDate);
  const mailingAddress = trimNullable(
    [addressLine1, addressLine2].filter(Boolean).join(", "),
  );

  return {
    firstName,
    middleName,
    lastName,
    fullName,
    fields: {
      submittedfirstname: trimNullable(input.firstName),
      submittedlastname: trimNullable(input.lastName),
      submittedphone: trimNullable(input.phone),
      legalfirstname: firstName,
      legalmiddlename: middleName,
      legallastname: lastName,
      legalfullname: fullName,
      driverslicensefullname: fullName,
      dateofbirth: dateOfBirth,
      birthdate: dateOfBirth,
      driverslicensenumber: licenseNumber,
      license_number: licenseNumber,
      driver_license_number: licenseNumber,
      driverlicensestate: state,
      driverslicenseissuedate: issueDate,
      driverslicenseexpirationdate: expirationDate,
      address: mailingAddress,
      addressline1: addressLine1,
      addressline2: addressLine2,
      city,
      state,
      postalcode: postalCode,
      zip: postalCode,
      driverslicensefilename: trimNullable(input.licenseParse?.fileName),
      driverslicensemimetype: trimNullable(input.licenseParse?.mimeType),
      driverslicenseparsestatus: trimNullable(input.licenseParse?.status),
      driverslicenseconfidence:
        input.licenseParse?.confidence ?? undefined,
      onboardingjobid: trimNullable(input.onboardingJobId),
      docusignstatus: trimNullable(input.docuSignEnvelope?.status),
      docusigntemplatekey: trimNullable(input.docuSignEnvelope?.templateKey),
      docusigntemplateid: trimNullable(input.docuSignEnvelope?.templateId),
      docusigntemplatename: trimNullable(input.docuSignEnvelope?.templateName),
      docusignaccountid: trimNullable(process.env.DOCUSIGN_ACCOUNT_ID),
      docusignenvelopeid: trimNullable(input.docuSignEnvelope?.envelopeId),
      docusignworkflowkey: input.docuSignEnvelope ? "pushing-capital-onboarding" : null,
      docusignrecipientrolesjson:
        input.docuSignEnvelope && input.docuSignEnvelope.recipientRoles.length > 0
          ? JSON.stringify(input.docuSignEnvelope.recipientRoles)
          : undefined,
      docusignfieldcontractsjson:
        input.docuSignEnvelope && input.docuSignEnvelope.fieldContracts.length > 0
          ? JSON.stringify(input.docuSignEnvelope.fieldContracts)
          : undefined,
      docusigntabidsjson:
        input.docuSignEnvelope &&
        input.docuSignEnvelope.fieldContracts.some((field) => field.tabId)
          ? JSON.stringify(
              input.docuSignEnvelope.fieldContracts
                .map((field) => trimNullable(field.tabId))
                .filter((value): value is string => Boolean(value)),
            )
          : undefined,
      docusignrequiredfieldidsjson:
        input.docuSignEnvelope &&
        input.docuSignEnvelope.fieldContracts.some((field) => field.required)
          ? JSON.stringify(
              input.docuSignEnvelope.fieldContracts
                .filter((field) => field.required)
                .map((field) => field.id),
            )
          : undefined,
      docusigncustomfieldnamesjson:
        input.docuSignEnvelope && input.docuSignEnvelope.customFieldNames.length > 0
          ? JSON.stringify(input.docuSignEnvelope.customFieldNames)
          : undefined,
      docusignrecipientemail: trimNullable(
        input.docuSignEnvelope?.recipientEmail,
      ),
      docusigncompanysigneremail: trimNullable(
        input.docuSignEnvelope?.companySignerEmail,
      ),
      docusigndispatchedat: trimNullable(
        input.docuSignEnvelope?.dispatchedAt,
      ),
    } satisfies Record<string, unknown>,
  };
}

function buildPlatformContactMetadata(input: SyncPublicIntakeContactInput) {
  const legalFields = input.licenseParse?.fields;

  return {
    ...input.metadata,
    legalIdentity: {
      fullName: trimNullable(legalFields?.fullName),
      firstName: trimNullable(legalFields?.firstName),
      middleName: trimNullable(legalFields?.middleName),
      lastName: trimNullable(legalFields?.lastName),
      licenseNumber: trimNullable(legalFields?.licenseNumber),
      dateOfBirth: trimNullable(legalFields?.dateOfBirth),
      issueDate: trimNullable(legalFields?.issueDate),
      expirationDate: trimNullable(legalFields?.expirationDate),
      addressLine1: trimNullable(legalFields?.addressLine1),
      addressLine2: trimNullable(legalFields?.addressLine2),
      city: trimNullable(legalFields?.city),
      state: trimNullable(legalFields?.state),
      postalCode: trimNullable(legalFields?.postalCode),
    },
    intakeRouting: input.laneClassification
      ? {
          intakeAudience: input.laneClassification.intakeAudience,
          serviceFamily: input.laneClassification.serviceFamily,
          requestedServiceSlug: input.laneClassification.requestedServiceSlug,
          routedServiceSlug: input.laneClassification.routedServiceSlug,
          category: input.laneClassification.category,
          confidence: input.laneClassification.confidence,
          reason: input.laneClassification.reason,
          recommendedLoginPath: input.laneClassification.recommendedLoginPath,
          recommendedWorkflowKey:
            input.laneClassification.recommendedWorkflowKey,
          dealPipelineId: input.laneClassification.dealPipelineId,
          dealStageId: input.laneClassification.dealStageId,
          ticketPipelineId: input.laneClassification.ticketPipelineId,
          ticketStageId: input.laneClassification.ticketStageId,
          notaryFallbackEnabled:
            input.laneClassification.notaryFallbackEnabled,
        }
      : null,
    serviceRequest: input.serviceRequestSync
      ? {
          provider: input.serviceRequestSync.provider,
          status: input.serviceRequestSync.status,
          destinationLabel: input.serviceRequestSync.destinationLabel,
          detail: input.serviceRequestSync.detail,
          externalId: input.serviceRequestSync.externalId,
          contactId: input.serviceRequestSync.contactId,
          requestedServiceSlug: input.serviceRequestSync.requestedServiceSlug,
          routedServiceSlug: input.serviceRequestSync.routedServiceSlug,
          dealPipelineId: input.serviceRequestSync.dealPipelineId,
          dealStageId: input.serviceRequestSync.dealStageId,
          ticketPipelineId: input.serviceRequestSync.ticketPipelineId,
          ticketStageId: input.serviceRequestSync.ticketStageId,
          syncedAt: input.serviceRequestSync.syncedAt,
        }
      : null,
    licenseDocumentSignals: input.licenseParse
      ? input.licenseParse.documentSignals
      : null,
    docusign: input.docuSignEnvelope
      ? {
          status: trimNullable(input.docuSignEnvelope.status),
          templateKey: trimNullable(input.docuSignEnvelope.templateKey),
          templateId: trimNullable(input.docuSignEnvelope.templateId),
          templateName: trimNullable(input.docuSignEnvelope.templateName),
          envelopeId: trimNullable(input.docuSignEnvelope.envelopeId),
          envelopeStatus: trimNullable(input.docuSignEnvelope.envelopeStatus),
          recipientEmail: trimNullable(input.docuSignEnvelope.recipientEmail),
          companySignerEmail: trimNullable(
            input.docuSignEnvelope.companySignerEmail,
          ),
          dispatchedAt: trimNullable(input.docuSignEnvelope.dispatchedAt),
          recipientRoles: input.docuSignEnvelope.recipientRoles,
          fieldContracts: input.docuSignEnvelope.fieldContracts,
          customFieldNames: input.docuSignEnvelope.customFieldNames,
        }
      : null,
  } satisfies Record<string, unknown>;
}

function readFirstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = trimNullable(headers.get(name));
    if (value) {
      return value;
    }
  }

  return null;
}

function readForwardedIp(headers: Headers) {
  const forwarded = readFirstHeader(headers, [
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
    "true-client-ip",
  ]);

  if (!forwarded) {
    return null;
  }

  return trimNullable(forwarded.split(",")[0]);
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

async function syncPushingCapitalPlatformContact({
  firstName,
  lastName,
  phone,
  email,
  metadata,
  laneClassification,
  serviceRequestSync,
  licenseParse,
  onboardingJobId,
  docuSignEnvelope,
}: SyncPublicIntakeContactInput): Promise<OnboardingContactSync> {
  const config = getPushingCapitalPlatformContactSyncConfig();
  const syncedAt = isoNow();

  if (!config.bearerToken) {
    return {
      provider: "pushing-capital-platform",
      status: "disabled",
      destinationLabel: DEFAULT_CONTACT_DESTINATION_LABEL,
      detail:
        "Platform contact sync is ready, but PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN is not configured yet.",
      externalId: null,
      syncedAt,
    };
  }

  try {
    const contactProfile = buildPublicIntakeContactProfile({
      firstName,
      lastName,
      phone,
      email,
      metadata,
      laneClassification,
      serviceRequestSync,
      licenseParse,
      onboardingJobId,
      docuSignEnvelope,
    });
    const result = await upsertPushingCapitalPlatformContact({
      firstName: contactProfile.firstName ?? firstName,
      middleName: contactProfile.middleName,
      lastName: contactProfile.lastName ?? lastName,
      fullName: contactProfile.fullName,
      phone,
      email,
      company: "Pushing Capital LLC",
      role: "lead",
      metadata: buildPlatformContactMetadata({
        firstName,
        lastName,
        phone,
        email,
        metadata,
        laneClassification,
        serviceRequestSync,
        licenseParse,
        onboardingJobId,
        docuSignEnvelope,
      }),
      fields: contactProfile.fields,
    });

    const syncedDetail = docuSignEnvelope?.envelopeId
      ? `Lead, driver-license identity, and DocuSign identifiers sent to ${config.url}.`
      : licenseParse
        ? `Lead and driver-license identity sent to ${config.url}.`
        : `Lead payload sent to ${config.url}.`;

    return {
      provider: "pushing-capital-platform",
      status: result.created ? "created" : "updated",
      destinationLabel: DEFAULT_CONTACT_DESTINATION_LABEL,
      detail: syncedDetail,
      externalId: result.id,
      syncedAt,
    };
  } catch (error) {
    return {
      provider: "pushing-capital-platform",
      status: "failed",
      destinationLabel: DEFAULT_CONTACT_DESTINATION_LABEL,
      detail:
        error instanceof Error
          ? error.message
          : "Platform contact sync failed for an unknown reason.",
      externalId: null,
      syncedAt,
    };
  }
}

export function buildPublicIntakeMetadata({
  request,
  browserMetadata,
}: BuildPublicIntakeMetadataInput): OnboardingIntakeMetadata {
  const headers = request.headers;
  const pageUrl = trimNullable(browserMetadata?.pageUrl);
  const pagePath =
    trimNullable(browserMetadata?.pagePath) ??
    (() => {
      if (!pageUrl) {
        return null;
      }

      try {
        return trimNullable(new URL(pageUrl).pathname);
      } catch {
        return null;
      }
    })();

  return {
    submittedAt: isoNow(),
    sourceLabel: DEFAULT_SOURCE_LABEL,
    pageUrl,
    pagePath,
    referrer:
      trimNullable(browserMetadata?.referrer) ??
      readFirstHeader(headers, ["referer", "referrer"]),
    userAgent: readFirstHeader(headers, ["user-agent"]),
    ipAddress: readForwardedIp(headers),
    requestId: readFirstHeader(headers, ["cf-ray", "x-vercel-id", "x-request-id"]),
    browserLanguage:
      trimNullable(browserMetadata?.browserLanguage) ??
      readFirstHeader(headers, ["accept-language"]),
    browserTimeZone: trimNullable(browserMetadata?.browserTimeZone),
    screenWidth: normalizeNumber(browserMetadata?.screenWidth),
    screenHeight: normalizeNumber(browserMetadata?.screenHeight),
    viewportWidth: normalizeNumber(browserMetadata?.viewportWidth),
    viewportHeight: normalizeNumber(browserMetadata?.viewportHeight),
    country: readFirstHeader(headers, ["x-vercel-ip-country", "cf-ipcountry"]),
    region: readFirstHeader(headers, [
      "x-vercel-ip-country-region",
      "x-appengine-region",
    ]),
    city: readFirstHeader(headers, ["x-vercel-ip-city"]),
    utmSource:
      trimNullable(browserMetadata?.utmSource) ?? extractQueryValue(pageUrl, "utm_source"),
    utmMedium:
      trimNullable(browserMetadata?.utmMedium) ?? extractQueryValue(pageUrl, "utm_medium"),
    utmCampaign:
      trimNullable(browserMetadata?.utmCampaign) ??
      extractQueryValue(pageUrl, "utm_campaign"),
    utmTerm:
      trimNullable(browserMetadata?.utmTerm) ?? extractQueryValue(pageUrl, "utm_term"),
    utmContent:
      trimNullable(browserMetadata?.utmContent) ??
      extractQueryValue(pageUrl, "utm_content"),
    gclid: trimNullable(browserMetadata?.gclid) ?? extractQueryValue(pageUrl, "gclid"),
    fbclid: trimNullable(browserMetadata?.fbclid) ?? extractQueryValue(pageUrl, "fbclid"),
  };
}

export async function syncPublicIntakeContact(
  input: SyncPublicIntakeContactInput,
): Promise<OnboardingContactSync> {
  try {
    return await syncPushingCapitalPlatformContact(input);
  } catch (error) {
    return {
      provider: "pushing-capital-platform",
      status: "failed",
      destinationLabel: DEFAULT_CONTACT_DESTINATION_LABEL,
      detail:
        error instanceof Error
          ? error.message
          : "Contact sync failed for an unknown reason.",
      externalId: null,
      syncedAt: isoNow(),
    };
  }
}
