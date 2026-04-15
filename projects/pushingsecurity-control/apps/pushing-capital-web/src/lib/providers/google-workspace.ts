import "server-only";

import { createPrivateKey } from "node:crypto";
import { google } from "googleapis";

import {
  normalizeListEnv,
  resolveProviderSecret,
  trimNullable,
  type ProviderSecretReader,
  type ProviderSecretSource,
} from "@/lib/providers/config";

const GOOGLE_WORKSPACE_PROVIDER = "google-workspace";
const GOOGLE_WORKSPACE_DEFAULT_PROJECT_ID = "pushingcapintegrations";
const GOOGLE_WORKSPACE_DEFAULT_PRIMARY_DOMAIN = "pushingcap.com";
const GOOGLE_WORKSPACE_DEFAULT_ORG_UNIT_PATH = "/";
const GOOGLE_WORKSPACE_DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.user",
];

type ResolvedGoogleWorkspaceConfig = {
  status: GoogleWorkspaceStatus;
  clientEmail: string | null;
  privateKey: string | null;
  scopes: string[];
  delegatedAdminEmail: string | null;
  projectId: string;
  primaryDomain: string;
  defaultOrgUnitPath: string;
};

export type GoogleWorkspaceStatus = {
  provider: "google-workspace";
  ready: boolean;
  authModel: "service-account-delegation";
  environment: "google-cloud";
  projectId: string;
  primaryDomain: string;
  defaultOrgUnitPath: string;
  delegatedAdminEmail: string | null;
  scopes: string[];
  sources: {
    GOOGLE_WORKSPACE_CLIENT_EMAIL: ProviderSecretSource;
    GOOGLE_WORKSPACE_PRIVATE_KEY: ProviderSecretSource;
  };
  warnings: string[];
};

export type GoogleWorkspaceUserRecord = {
  id: string | null;
  primaryEmail: string | null;
  givenName: string | null;
  familyName: string | null;
  fullName: string | null;
  orgUnitPath: string | null;
  suspended: boolean | null;
  phones: Array<{
    value: string | null;
    type: string | null;
    customType: string | null;
  }>;
  recoveryEmail: string | null;
};

export type GetGoogleWorkspaceUserResult = {
  found: boolean;
  user: GoogleWorkspaceUserRecord | null;
};

export type CreateGoogleWorkspaceUserInput = {
  readSecretValue: ProviderSecretReader;
  primaryEmail: string;
  givenName: string;
  familyName: string;
  password: string;
  recoveryEmail?: string | null;
  phone?: string | null;
  orgUnitPath?: string | null;
  changePasswordAtNextLogin?: boolean;
};

export type CreateGoogleWorkspaceUserResult = {
  created: boolean;
  user: GoogleWorkspaceUserRecord;
  primaryDomain: string;
  defaultOrgUnitPath: string;
};

function normalizeGooglePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function readGoogleWorkspaceErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = error as {
    code?: unknown;
    status?: unknown;
    response?: {
      status?: unknown;
    };
  };

  if (typeof candidate.code === "number") {
    return candidate.code;
  }

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }

  return null;
}

function normalizeGoogleWorkspaceUser(user: Record<string, unknown>) {
  const rawName =
    typeof user.name === "object" && user.name !== null
      ? (user.name as Record<string, unknown>)
      : null;
  const rawPhones = Array.isArray(user.phones)
    ? user.phones
    : [];

  return {
    id: trimNullable(
      typeof user.id === "string" ? user.id : typeof user.id === "number" ? String(user.id) : null,
    ),
    primaryEmail: trimNullable(
      typeof user.primaryEmail === "string" ? user.primaryEmail : null,
    ),
    givenName: trimNullable(
      rawName && typeof rawName.givenName === "string" ? rawName.givenName : null,
    ),
    familyName: trimNullable(
      rawName && typeof rawName.familyName === "string" ? rawName.familyName : null,
    ),
    fullName: trimNullable(
      rawName && typeof rawName.fullName === "string" ? rawName.fullName : null,
    ),
    orgUnitPath: trimNullable(
      typeof user.orgUnitPath === "string" ? user.orgUnitPath : null,
    ),
    suspended:
      typeof user.suspended === "boolean" ? user.suspended : null,
    phones: rawPhones.map((phone) => {
      const record =
        typeof phone === "object" && phone !== null
          ? (phone as Record<string, unknown>)
          : {};

      return {
        value: trimNullable(
          typeof record.value === "string"
            ? record.value
            : typeof record.value === "number"
              ? String(record.value)
              : null,
        ),
        type: trimNullable(typeof record.type === "string" ? record.type : null),
        customType: trimNullable(
          typeof record.customType === "string" ? record.customType : null,
        ),
      };
    }),
    recoveryEmail: trimNullable(
      typeof user.recoveryEmail === "string" ? user.recoveryEmail : null,
    ),
  } satisfies GoogleWorkspaceUserRecord;
}

export function createGoogleWorkspaceAdminClient(input: {
  clientEmail: string;
  privateKey: string;
  scopes: string[];
  delegatedAdminEmail: string;
}) {
  const auth = new google.auth.JWT({
    email: input.clientEmail,
    key: input.privateKey,
    scopes: input.scopes,
    subject: input.delegatedAdminEmail,
  });

  const directory = google.admin({
    version: "directory_v1",
    auth,
  });

  return {
    auth,
    directory,
  };
}

async function resolveGoogleWorkspaceConfig({
  readSecretValue,
}: {
  readSecretValue: ProviderSecretReader;
}): Promise<ResolvedGoogleWorkspaceConfig> {
  const clientEmail = await resolveProviderSecret({
    provider: GOOGLE_WORKSPACE_PROVIDER,
    keyName: "GOOGLE_WORKSPACE_CLIENT_EMAIL",
    envValue: process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL,
    warningPrefix: "Google Workspace",
    readSecretValue,
  });
  const privateKey = await resolveProviderSecret({
    provider: GOOGLE_WORKSPACE_PROVIDER,
    keyName: "GOOGLE_WORKSPACE_PRIVATE_KEY",
    envValue: process.env.GOOGLE_WORKSPACE_PRIVATE_KEY,
    warningPrefix: "Google Workspace",
    readSecretValue,
  });

  const warnings = [...clientEmail.warnings, ...privateKey.warnings];
  const projectId =
    trimNullable(process.env.GOOGLE_WORKSPACE_PROJECT_ID) ??
    GOOGLE_WORKSPACE_DEFAULT_PROJECT_ID;
  const delegatedAdminEmail = trimNullable(
    process.env.GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL,
  );
  const primaryDomain =
    trimNullable(process.env.GOOGLE_WORKSPACE_PRIMARY_DOMAIN) ??
    GOOGLE_WORKSPACE_DEFAULT_PRIMARY_DOMAIN;
  const defaultOrgUnitPath =
    trimNullable(process.env.GOOGLE_WORKSPACE_DEFAULT_ORG_UNIT_PATH) ??
    GOOGLE_WORKSPACE_DEFAULT_ORG_UNIT_PATH;
  const scopes = normalizeListEnv(
    process.env.GOOGLE_WORKSPACE_SCOPES,
    GOOGLE_WORKSPACE_DEFAULT_SCOPES,
  );

  if (!clientEmail.value) {
    warnings.push(
      "Google Workspace: missing GOOGLE_WORKSPACE_CLIENT_EMAIL. Store it in the google-workspace vault record or set the env fallback.",
    );
  }

  if (!privateKey.value) {
    warnings.push(
      "Google Workspace: missing GOOGLE_WORKSPACE_PRIVATE_KEY. Store it in the google-workspace vault record or set the env fallback.",
    );
  }

  if (!delegatedAdminEmail) {
    warnings.push(
      "Google Workspace: missing GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL for delegated Admin SDK calls.",
    );
  }

  let normalizedPrivateKey: string | null = null;

  if (privateKey.value) {
    normalizedPrivateKey = normalizeGooglePrivateKey(privateKey.value);

    try {
      createPrivateKey({
        key: normalizedPrivateKey,
        format: "pem",
      });
    } catch {
      normalizedPrivateKey = null;
      warnings.push(
        "Google Workspace: GOOGLE_WORKSPACE_PRIVATE_KEY is not valid PEM data.",
      );
    }
  }

  let ready = false;

  if (clientEmail.value && normalizedPrivateKey && delegatedAdminEmail) {
    try {
      createGoogleWorkspaceAdminClient({
        clientEmail: clientEmail.value,
        privateKey: normalizedPrivateKey,
        scopes,
        delegatedAdminEmail,
      });
      ready = true;
    } catch (error) {
      warnings.push(
        `Google Workspace: the Admin SDK client could not be initialized. ${
          error instanceof Error ? error.message : "Check the installed package and config."
        }`,
      );
    }
  }

  return {
    status: {
      provider: "google-workspace",
      ready,
      authModel: "service-account-delegation",
      environment: "google-cloud",
      projectId,
      primaryDomain,
      defaultOrgUnitPath,
      delegatedAdminEmail,
      scopes,
      sources: {
        GOOGLE_WORKSPACE_CLIENT_EMAIL: clientEmail.source,
        GOOGLE_WORKSPACE_PRIVATE_KEY: privateKey.source,
      },
      warnings: Array.from(new Set(warnings)),
    },
    clientEmail: clientEmail.value,
    privateKey: normalizedPrivateKey,
    scopes,
    delegatedAdminEmail,
    projectId,
    primaryDomain,
    defaultOrgUnitPath,
  };
}

async function createGoogleWorkspaceDirectoryService({
  readSecretValue,
}: {
  readSecretValue: ProviderSecretReader;
}) {
  const config = await resolveGoogleWorkspaceConfig({ readSecretValue });

  if (
    !config.status.ready ||
    !config.clientEmail ||
    !config.privateKey ||
    !config.delegatedAdminEmail
  ) {
    throw new Error(
      "Google Workspace is not configured well enough to provision users yet.",
    );
  }

  const { directory } = createGoogleWorkspaceAdminClient({
    clientEmail: config.clientEmail,
    privateKey: config.privateKey,
    scopes: config.scopes,
    delegatedAdminEmail: config.delegatedAdminEmail,
  });

  return {
    config,
    directory,
  };
}

export async function getGoogleWorkspaceStatus({
  readSecretValue,
}: {
  readSecretValue: ProviderSecretReader;
}): Promise<GoogleWorkspaceStatus> {
  return (await resolveGoogleWorkspaceConfig({ readSecretValue })).status;
}

export async function getGoogleWorkspaceUser({
  readSecretValue,
  primaryEmail,
}: {
  readSecretValue: ProviderSecretReader;
  primaryEmail: string;
}): Promise<GetGoogleWorkspaceUserResult> {
  const normalizedPrimaryEmail = trimNullable(primaryEmail)?.toLowerCase();

  if (!normalizedPrimaryEmail) {
    throw new Error("A Google Workspace primary email is required.");
  }

  const { directory } = await createGoogleWorkspaceDirectoryService({
    readSecretValue,
  });

  try {
    const response = await directory.users.get({
      userKey: normalizedPrimaryEmail,
      projection: "full",
    });

    return {
      found: true,
      user: normalizeGoogleWorkspaceUser(
        (response.data ?? {}) as Record<string, unknown>,
      ),
    };
  } catch (error) {
    if (readGoogleWorkspaceErrorStatus(error) === 404) {
      return {
        found: false,
        user: null,
      };
    }

    throw error;
  }
}

export async function createGoogleWorkspaceUser({
  readSecretValue,
  primaryEmail,
  givenName,
  familyName,
  password,
  recoveryEmail,
  phone,
  orgUnitPath,
  changePasswordAtNextLogin = true,
}: CreateGoogleWorkspaceUserInput): Promise<CreateGoogleWorkspaceUserResult> {
  const normalizedPrimaryEmail = trimNullable(primaryEmail)?.toLowerCase();
  const normalizedGivenName = trimNullable(givenName);
  const normalizedFamilyName = trimNullable(familyName);
  const normalizedPassword = trimNullable(password);

  if (
    !normalizedPrimaryEmail ||
    !normalizedGivenName ||
    !normalizedFamilyName ||
    !normalizedPassword
  ) {
    throw new Error(
      "Primary email, given name, family name, and password are required for Google Workspace provisioning.",
    );
  }

  const { config, directory } = await createGoogleWorkspaceDirectoryService({
    readSecretValue,
  });
  const normalizedOrgUnitPath =
    trimNullable(orgUnitPath) ?? config.defaultOrgUnitPath;
  const existing = await getGoogleWorkspaceUser({
    readSecretValue,
    primaryEmail: normalizedPrimaryEmail,
  });

  if (existing.found && existing.user) {
    return {
      created: false,
      user: existing.user,
      primaryDomain: config.primaryDomain,
      defaultOrgUnitPath: config.defaultOrgUnitPath,
    };
  }

  const response = await directory.users.insert({
    requestBody: {
      primaryEmail: normalizedPrimaryEmail,
      password: normalizedPassword,
      changePasswordAtNextLogin,
      suspended: false,
      orgUnitPath: normalizedOrgUnitPath,
      recoveryEmail: trimNullable(recoveryEmail) ?? undefined,
      name: {
        givenName: normalizedGivenName,
        familyName: normalizedFamilyName,
      },
      phones: trimNullable(phone)
        ? [
            {
              value: trimNullable(phone),
              type: "work",
            },
          ]
        : undefined,
    },
  });

  return {
    created: true,
    user: normalizeGoogleWorkspaceUser(
      (response.data ?? {}) as Record<string, unknown>,
    ),
    primaryDomain: config.primaryDomain,
    defaultOrgUnitPath: config.defaultOrgUnitPath,
  };
}
