import "server-only";

import type {
  DriverLicenseParseResult,
  OnboardingIntakeMetadata,
  OnboardingLaneClassification,
  OnboardingServiceRequestSync,
} from "@/lib/control/types";

const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";
const DEFAULT_PLATFORM_SERVICE_REQUEST_DESTINATION_LABEL =
  "Pushing Capital Platform Service Requests";
const DEFAULT_HUBSPOT_SERVICE_REQUEST_DESTINATION_LABEL =
  "HubSpot service-request shell";

type SyncOnboardingServiceRequestInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  onboardingJobId: string;
  metadata: OnboardingIntakeMetadata;
  laneClassification: OnboardingLaneClassification;
  licenseParse?: DriverLicenseParseResult | null;
};

type HubSpotRequestResult = {
  ok: boolean;
  status: number;
  value?: Record<string, unknown> | null;
  error?: string;
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

function compactRecord(
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!value) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, candidate]) => {
      if (candidate === null || candidate === undefined) {
        return false;
      }

      if (typeof candidate === "string") {
        return candidate.trim().length > 0;
      }

      if (Array.isArray(candidate)) {
        return candidate.length > 0;
      }

      return true;
    }),
  );
}

function getPlatformServiceRequestSyncConfig() {
  const url = trimNullable(process.env.PUSHINGCAP_PLATFORM_SERVICE_REQUEST_SYNC_URL);
  const bearerToken =
    trimNullable(process.env.PUSHINGCAP_PLATFORM_SERVICE_REQUEST_SYNC_BEARER_TOKEN) ??
    trimNullable(process.env.PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN);

  return {
    url,
    bearerToken,
  };
}

function getHubSpotToken() {
  return (
    trimNullable(process.env.HUBSPOT_PRIVATE_APP_TOKEN) ??
    trimNullable(process.env.HUBSPOT_ACCESS_TOKEN) ??
    trimNullable(process.env.HUBSPOT_API_KEY)
  );
}

function buildApplicantName(input: {
  firstName: string;
  lastName: string;
  licenseParse?: DriverLicenseParseResult | null;
}) {
  return (
    trimNullable(input.licenseParse?.fields.fullName) ??
    [input.firstName.trim(), input.lastName.trim()].filter(Boolean).join(" ")
  );
}

function buildServiceRequestTitle(input: SyncOnboardingServiceRequestInput) {
  const applicantName = buildApplicantName(input);
  const title = [
    input.laneClassification.serviceFamily === "finance"
      ? "Finance Onboarding"
      : "Automotive Onboarding",
    applicantName,
  ]
    .filter(Boolean)
    .join(" — ");

  return title.slice(0, 140);
}

function buildServiceRequestDescription(input: SyncOnboardingServiceRequestInput) {
  return [
    `Created from pushingsecurity onboarding.`,
    `Lifecycle state: pending identity review.`,
    `Onboarding job: ${input.onboardingJobId}`,
    `Audience: ${input.laneClassification.intakeAudience}`,
    `Service family: ${input.laneClassification.serviceFamily}`,
    `Requested lane: ${input.laneClassification.requestedServiceSlug}`,
    `Routed lane: ${input.laneClassification.routedServiceSlug}`,
    `Workflow: ${input.laneClassification.recommendedWorkflowKey}`,
    `Login: ${input.laneClassification.recommendedLoginPath}`,
    `Source: ${input.metadata.sourceLabel}`,
    input.metadata.pageUrl ? `Page URL: ${input.metadata.pageUrl}` : null,
    input.phone ? `Phone: ${input.phone}` : null,
    input.licenseParse?.fields.licenseNumber
      ? `License number: ${input.licenseParse.fields.licenseNumber}`
      : null,
    input.licenseParse?.documentSignals.faceDetectionStatus
      ? `Face check: ${input.licenseParse.documentSignals.faceDetectionStatus}`
      : null,
    input.licenseParse?.warnings.length
      ? `Parse warnings: ${input.licenseParse.warnings.join(" | ")}`
      : null,
    input.laneClassification.notaryFallbackEnabled
      ? `DocuSign Notary fallback: enabled`
      : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4000);
}

async function hubspotRequest(
  token: string,
  path: string,
  init: {
    method: "GET" | "POST" | "PUT";
    body?: Record<string, unknown>;
  },
): Promise<HubSpotRequestResult> {
  const response = await fetch(`${HUBSPOT_API_BASE_URL}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        trimNullable(String(payload?.message ?? "")) ??
        trimNullable(String(payload?.error ?? "")) ??
        `HubSpot request failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
    status: response.status,
    value: payload,
  };
}

async function ensureHubSpotContact(
  token: string,
  input: SyncOnboardingServiceRequestInput,
) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const search = await hubspotRequest(token, "/crm/v3/objects/contacts/search", {
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: normalizedEmail,
            },
          ],
        },
      ],
      properties: ["email", "firstname", "lastname"],
      limit: 1,
    },
  });

  if (!search.ok) {
    throw new Error(search.error);
  }

  const existing = Array.isArray(search.value?.results)
    ? (search.value?.results?.[0] as { id?: unknown } | undefined)
    : undefined;
  const existingId = trimNullable(String(existing?.id ?? ""));

  if (existingId) {
    return existingId;
  }

  const created = await hubspotRequest(token, "/crm/v3/objects/contacts", {
    method: "POST",
    body: {
      properties: compactRecord({
        email: normalizedEmail,
        firstname: trimNullable(input.firstName),
        lastname: trimNullable(input.lastName),
        phone: trimNullable(input.phone),
      }),
    },
  });

  if (!created.ok) {
    throw new Error(created.error);
  }

  const createdId = trimNullable(String(created.value?.id ?? ""));

  if (!createdId) {
    throw new Error("HubSpot contact create returned without an id.");
  }

  return createdId;
}

async function createHubSpotDealShell(
  token: string,
  input: SyncOnboardingServiceRequestInput,
) {
  const created = await hubspotRequest(token, "/crm/v3/objects/deals", {
    method: "POST",
    body: {
      properties: {
        dealname: buildServiceRequestTitle(input),
        pipeline: input.laneClassification.dealPipelineId,
        dealstage: input.laneClassification.dealStageId,
        description: buildServiceRequestDescription(input),
      },
    },
  });

  if (!created.ok) {
    throw new Error(created.error);
  }

  const dealId = trimNullable(String(created.value?.id ?? ""));

  if (!dealId) {
    throw new Error("HubSpot deal create returned without an id.");
  }

  return dealId;
}

async function associateContactToDeal(
  token: string,
  contactId: string,
  dealId: string,
) {
  const response = await fetch(
    `${HUBSPOT_API_BASE_URL}/crm/v4/objects/contacts/${encodeURIComponent(contactId)}/associations/deals/${encodeURIComponent(dealId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([]),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    throw new Error(
      trimNullable(String(payload?.message ?? "")) ??
        `HubSpot contact/deal association failed with status ${response.status}.`,
    );
  }
}

function buildPlatformServiceRequestPayload(input: SyncOnboardingServiceRequestInput) {
  return {
    onboardingJobId: input.onboardingJobId,
    intakeAudience: input.laneClassification.intakeAudience,
    serviceFamily: input.laneClassification.serviceFamily,
    requestedServiceSlug: input.laneClassification.requestedServiceSlug,
    routedServiceSlug: input.laneClassification.routedServiceSlug,
    routing: {
      category: input.laneClassification.category,
      dealPipelineId: input.laneClassification.dealPipelineId,
      dealStageId: input.laneClassification.dealStageId,
      ticketPipelineId: input.laneClassification.ticketPipelineId,
      ticketStageId: input.laneClassification.ticketStageId,
      recommendedLoginPath: input.laneClassification.recommendedLoginPath,
      recommendedWorkflowKey: input.laneClassification.recommendedWorkflowKey,
      notaryFallbackEnabled: input.laneClassification.notaryFallbackEnabled,
      confidence: input.laneClassification.confidence,
      reason: input.laneClassification.reason,
    },
    applicant: {
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: buildApplicantName(input),
      phone: input.phone,
      email: input.email.trim().toLowerCase(),
    },
    intakeMetadata: input.metadata,
    licenseParse: input.licenseParse
      ? {
          status: input.licenseParse.status,
          confidence: input.licenseParse.confidence,
          fields: input.licenseParse.fields,
          documentSignals: input.licenseParse.documentSignals,
          warnings: input.licenseParse.warnings,
        }
      : null,
  };
}

async function syncThroughPlatformEndpoint(
  input: SyncOnboardingServiceRequestInput,
): Promise<OnboardingServiceRequestSync> {
  const config = getPlatformServiceRequestSyncConfig();
  const syncedAt = isoNow();

  if (!config.url || !config.bearerToken) {
    throw new Error("Platform service-request sync is not configured.");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.bearerToken}`,
    },
    body: JSON.stringify(buildPlatformServiceRequestPayload(input)),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    serviceRequestId?: string;
    dealId?: string;
    contactId?: string;
    detail?: string;
    error?: string;
    created?: boolean;
  };

  if (!response.ok || payload.ok === false) {
    throw new Error(
      trimNullable(payload.detail) ??
        trimNullable(payload.error) ??
        `Platform service-request sync returned status ${response.status}.`,
    );
  }

  const externalId =
    trimNullable(payload.id) ??
    trimNullable(payload.serviceRequestId) ??
    trimNullable(payload.dealId);

  return {
    provider: "pushing-capital-platform",
    status: payload.created === false ? "updated" : "created",
    destinationLabel: DEFAULT_PLATFORM_SERVICE_REQUEST_DESTINATION_LABEL,
    detail:
      trimNullable(payload.detail) ??
      "Created the first platform service-request shell from onboarding.",
    externalId,
    contactId: trimNullable(payload.contactId),
    requestedServiceSlug: input.laneClassification.requestedServiceSlug,
    routedServiceSlug: input.laneClassification.routedServiceSlug,
    dealPipelineId: input.laneClassification.dealPipelineId,
    dealStageId: input.laneClassification.dealStageId,
    ticketPipelineId: input.laneClassification.ticketPipelineId,
    ticketStageId: input.laneClassification.ticketStageId,
    syncedAt,
  };
}

async function syncThroughHubSpotShell(
  input: SyncOnboardingServiceRequestInput,
): Promise<OnboardingServiceRequestSync> {
  const token = getHubSpotToken();
  const syncedAt = isoNow();

  if (!token) {
    return {
      provider: "hubspot",
      status: "disabled",
      destinationLabel: DEFAULT_HUBSPOT_SERVICE_REQUEST_DESTINATION_LABEL,
      detail:
        "Service-request sync is ready, but neither the platform endpoint nor HubSpot private app token is configured yet.",
      externalId: null,
      contactId: null,
      requestedServiceSlug: input.laneClassification.requestedServiceSlug,
      routedServiceSlug: input.laneClassification.routedServiceSlug,
      dealPipelineId: input.laneClassification.dealPipelineId,
      dealStageId: input.laneClassification.dealStageId,
      ticketPipelineId: input.laneClassification.ticketPipelineId,
      ticketStageId: input.laneClassification.ticketStageId,
      syncedAt,
    };
  }

  try {
    const contactId = await ensureHubSpotContact(token, input);
    const dealId = await createHubSpotDealShell(token, input);
    await associateContactToDeal(token, contactId, dealId);

    return {
      provider: "hubspot",
      status: "created",
      destinationLabel: DEFAULT_HUBSPOT_SERVICE_REQUEST_DESTINATION_LABEL,
      detail:
        "Created the first HubSpot service-request deal shell, marked it pending identity review, and associated it to the applicant contact.",
      externalId: dealId,
      contactId,
      requestedServiceSlug: input.laneClassification.requestedServiceSlug,
      routedServiceSlug: input.laneClassification.routedServiceSlug,
      dealPipelineId: input.laneClassification.dealPipelineId,
      dealStageId: input.laneClassification.dealStageId,
      ticketPipelineId: input.laneClassification.ticketPipelineId,
      ticketStageId: input.laneClassification.ticketStageId,
      syncedAt,
    };
  } catch (error) {
    return {
      provider: "hubspot",
      status: "failed",
      destinationLabel: DEFAULT_HUBSPOT_SERVICE_REQUEST_DESTINATION_LABEL,
      detail:
        error instanceof Error
          ? error.message
          : "HubSpot service-request sync failed for an unknown reason.",
      externalId: null,
      contactId: null,
      requestedServiceSlug: input.laneClassification.requestedServiceSlug,
      routedServiceSlug: input.laneClassification.routedServiceSlug,
      dealPipelineId: input.laneClassification.dealPipelineId,
      dealStageId: input.laneClassification.dealStageId,
      ticketPipelineId: input.laneClassification.ticketPipelineId,
      ticketStageId: input.laneClassification.ticketStageId,
      syncedAt,
    };
  }
}

export async function syncOnboardingServiceRequest(
  input: SyncOnboardingServiceRequestInput,
): Promise<OnboardingServiceRequestSync> {
  const config = getPlatformServiceRequestSyncConfig();

  if (config.url && config.bearerToken) {
    try {
      return await syncThroughPlatformEndpoint(input);
    } catch (error) {
      return {
        provider: "pushing-capital-platform",
        status: "failed",
        destinationLabel: DEFAULT_PLATFORM_SERVICE_REQUEST_DESTINATION_LABEL,
        detail:
          error instanceof Error
            ? error.message
            : "Platform service-request sync failed for an unknown reason.",
        externalId: null,
        contactId: null,
        requestedServiceSlug: input.laneClassification.requestedServiceSlug,
        routedServiceSlug: input.laneClassification.routedServiceSlug,
        dealPipelineId: input.laneClassification.dealPipelineId,
        dealStageId: input.laneClassification.dealStageId,
        ticketPipelineId: input.laneClassification.ticketPipelineId,
        ticketStageId: input.laneClassification.ticketStageId,
        syncedAt: isoNow(),
      };
    }
  }

  return await syncThroughHubSpotShell(input);
}
