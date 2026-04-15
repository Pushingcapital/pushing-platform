import "server-only";

import type { OnboardingJob } from "@/lib/control/types";

export type WebhookHubSyncResult = {
  provider: "cloudflare-webhook-hub";
  status: "disabled" | "mirrored" | "failed";
  endpoint: string | null;
  detail: string;
  mirroredAt: string;
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

export function getWebhookHubOnboardingSyncConfig() {
  const baseUrl =
    trimNullable(process.env.PUSHINGCAP_WEBHOOK_HUB_BASE_URL) ??
    "https://webhooks.pushingcap.com";
  const bearerToken = trimNullable(
    process.env.PUSHINGCAP_WEBHOOK_HUB_ONBOARDING_TOKEN,
  );

  return {
    baseUrl,
    endpoint: `${baseUrl.replace(/\/+$/, "")}/api/onboarding/jobs`,
    bearerToken,
  };
}

function buildMirroredJob(job: OnboardingJob) {
  return {
    id: job.id,
    firstName: job.firstName,
    lastName: job.lastName,
    phone: job.phone,
    email: job.email,
    stage: job.stage,
    requestedBundleId: job.requestedBundleId,
    operatorNotes: job.operatorNotes,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    intakeMetadata: job.intakeMetadata,
    laneClassification: job.laneClassification,
    contactSync: job.contactSync,
    serviceRequestSync: job.serviceRequestSync,
    licenseParse: job.licenseParse,
    docuSignEnvelope: job.docuSignEnvelope,
    docuSignCompletion: job.docuSignCompletion,
    workspaceProvisioning: job.workspaceProvisioning,
    browserBootstrap: job.browserBootstrap,
    timeline: job.timeline,
  };
}

export async function syncOnboardingJobToWebhookHub({
  job,
}: {
  job: OnboardingJob;
}): Promise<WebhookHubSyncResult> {
  const config = getWebhookHubOnboardingSyncConfig();
  const mirroredAt = isoNow();

  if (!config.bearerToken) {
    return {
      provider: "cloudflare-webhook-hub",
      status: "disabled",
      endpoint: config.endpoint,
      mirroredAt,
      detail:
        "Webhook hub sync is ready, but PUSHINGCAP_WEBHOOK_HUB_ONBOARDING_TOKEN is not configured yet.",
    };
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.bearerToken}`,
      },
      body: JSON.stringify({
        job: buildMirroredJob(job),
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          mirrored?: boolean;
        }
      | null;

    if (!response.ok) {
      return {
        provider: "cloudflare-webhook-hub",
        status: "failed",
        endpoint: config.endpoint,
        mirroredAt,
        detail:
          payload?.error ??
          `Webhook hub sync failed with status ${response.status}.`,
      };
    }

    return {
      provider: "cloudflare-webhook-hub",
      status: payload?.mirrored ? "mirrored" : "failed",
      endpoint: config.endpoint,
      mirroredAt,
      detail: payload?.mirrored
        ? "Mirrored the onboarding job into the Cloudflare webhook hub."
        : "Webhook hub sync returned without confirming the mirrored job.",
    };
  } catch (error) {
    return {
      provider: "cloudflare-webhook-hub",
      status: "failed",
      endpoint: config.endpoint,
      mirroredAt,
      detail:
        error instanceof Error
          ? error.message
          : "Unable to mirror the onboarding job to the Cloudflare webhook hub.",
    };
  }
}
