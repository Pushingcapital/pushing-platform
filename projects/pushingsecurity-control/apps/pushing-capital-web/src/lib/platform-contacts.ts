const DEFAULT_PLATFORM_CONTACT_UPSERT_URL =
  "https://platform.pushingcap.com/integrations/chat/contacts/upsert";

export type PushingCapitalContactUpsertInput = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName?: string | null;
  email: string;
  phone?: string | null;
  title?: string | null;
  company?: string | null;
  role?: string | null;
  metadata?: Record<string, unknown> | null;
  fields?: Record<string, unknown> | null;
};

export type PushingCapitalContactUpsertResult = {
  id: string;
  created: boolean;
  record: Record<string, unknown>;
};

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPushingCapitalPlatformContactSyncConfig() {
  return {
    url:
      trimNullable(process.env.PUSHINGCAP_PLATFORM_CONTACT_SYNC_URL) ??
      DEFAULT_PLATFORM_CONTACT_UPSERT_URL,
    bearerToken: trimNullable(
      process.env.PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN,
    ),
  };
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

      return true;
    }),
  );
}

export async function upsertPushingCapitalPlatformContact(
  input: PushingCapitalContactUpsertInput,
) {
  if (!input.firstName || !input.lastName || !input.email) {
    throw new Error(
      "First name, last name, and email are required for platform contact upserts.",
    );
  }

  const config = getPushingCapitalPlatformContactSyncConfig();

  if (!config.bearerToken) {
    throw new Error(
      "PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN is required before syncing Pushing Capital contacts.",
    );
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.bearerToken}`,
  });

  const requestPayload = {
    email: input.email.trim().toLowerCase(),
    firstname: input.firstName.trim(),
    lastname: input.lastName.trim(),
    phone: trimNullable(input.phone),
    middlename: trimNullable(input.middleName),
    fullname: trimNullable(input.fullName),
    title: trimNullable(input.title),
    company: trimNullable(input.company),
    role: trimNullable(input.role),
    metadata: input.metadata ?? undefined,
    ...compactRecord(input.fields),
  };

  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestPayload),
    cache: "no-store",
  });

  const responsePayload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    created?: boolean;
    record?: Record<string, unknown>;
    error?: string;
    detail?: string;
  };

  if (
    !response.ok ||
    responsePayload.ok !== true ||
    !trimNullable(responsePayload.id)
  ) {
    throw new Error(
      trimNullable(responsePayload.detail) ??
        trimNullable(responsePayload.error) ??
        `Platform contact upsert returned status ${response.status}.`,
    );
  }

  return {
    id: responsePayload.id!.trim(),
    created: responsePayload.created === true,
    record: responsePayload.record ?? {},
  } satisfies PushingCapitalContactUpsertResult;
}
