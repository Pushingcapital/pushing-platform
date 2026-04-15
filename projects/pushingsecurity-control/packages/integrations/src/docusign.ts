import { createPrivateKey } from "node:crypto";
import { createRequire } from "node:module";

import {
  normalizeListEnv,
  resolveProviderSecret,
  trimNullable,
  type ProviderSecretReader,
  type ProviderSecretSource,
} from "./provider-secrets.ts";

const DOCUSIGN_PROVIDER = "docusign";
const DOCUSIGN_DEFAULT_OAUTH_BASE_PATH = "account-d.docusign.com";
const DOCUSIGN_DEFAULT_AUTH_CODE_SCOPES = ["signature"];
const DOCUSIGN_DEFAULT_JWT_SCOPES = ["signature", "impersonation"];
const DOCUSIGN_PACKAGE_NAME = ["docusign", "esign"].join("-");
const DEFAULT_TEMPLATE_PAGE_SIZE = 25;
const MAX_TEMPLATE_PAGE_SIZE = 100;
const require = createRequire(import.meta.url);

type StringEnv = Record<string, string | undefined>;
type DocuSignEnvironment = "demo" | "production" | "custom";

type DocuSignSdk = {
  ApiClient: new () => {
    setOAuthBasePath(value: string): void;
    requestJWTUserToken(
      clientId: string,
      userId: string,
      scopes: string[],
      privateKey: string,
      expiresIn: number,
    ): Promise<{
      body: {
        access_token: string;
        expires_in?: number;
        scope?: string;
      };
    }>;
    getUserInfo(accessToken: string): Promise<Record<string, unknown>>;
    setBasePath(value: string): void;
    addDefaultHeader(name: string, value: string): void;
  };
  TemplatesApi: new (apiClient: {
    setBasePath(value: string): void;
    addDefaultHeader(name: string, value: string): void;
  }) => {
    createTemplate(
      accountId: string,
      options?: {
        envelopeTemplate?: Record<string, unknown>;
      },
    ): Promise<Record<string, unknown>>;
    listTemplates(
      accountId: string,
      options?: Record<string, string | undefined>,
    ): Promise<Record<string, unknown>>;
    get(
      accountId: string,
      templateId: string,
      options?: Record<string, string | undefined>,
    ): Promise<Record<string, unknown>>;
    update(
      accountId: string,
      templateId: string,
      options?: {
        envelopeTemplate?: Record<string, unknown>;
      },
    ): Promise<Record<string, unknown>>;
    listRecipients(
      accountId: string,
      templateId: string,
      options?: Record<string, string | undefined>,
    ): Promise<Record<string, unknown>>;
  };
  EnvelopesApi: new (apiClient: {
    setBasePath(value: string): void;
    addDefaultHeader(name: string, value: string): void;
  }) => {
    createEnvelope(
      accountId: string,
      options?: {
        envelopeDefinition?: Record<string, unknown>;
        mergeRolesOnDraft?: string;
      },
    ): Promise<Record<string, unknown>>;
  };
};

type ResolvedDocuSignConfig = {
  status: DocuSignStatus;
  authModel: DocuSignAuthModel;
  clientId: string | null;
  clientSecret: string | null;
  privateKey: string | null;
  oauthBasePath: string;
  scopes: string[];
  userId: string | null;
  configuredAccountId: string | null;
};

export type DocuSignAuthModel = "authorization-code" | "jwt";

export type DocuSignStatus = {
  provider: "docusign";
  ready: boolean;
  authModel: DocuSignAuthModel;
  environment: DocuSignEnvironment;
  oauthBasePath: string;
  userIdConfigured: boolean;
  keypairIdConfigured: boolean;
  accountIdConfigured: boolean;
  configuredAccountId: string | null;
  scopes: string[];
  sources: Record<string, ProviderSecretSource>;
  warnings: string[];
};

export type DocuSignAccount = {
  accountId: string;
  accountName: string | null;
  baseUri: string;
  isDefault: boolean;
  selection: "configured" | "default" | "first-available";
};

export type DocuSignTemplateRoleSummary = {
  recipientId: string | null;
  recipientIdGuid: string | null;
  recipientType: string;
  roleName: string | null;
  name: string | null;
  email: string | null;
  routingOrder: string | null;
  status: string | null;
};

export type DocuSignTemplateField = {
  tabId: string | null;
  tabType: string;
  collection: string;
  label: string | null;
  name: string | null;
  value: string | null;
  documentId: string | null;
  pageNumber: string | null;
  recipientId: string | null;
  recipientType: string;
  roleName: string | null;
  required: boolean | null;
  locked: boolean | null;
  shared: boolean | null;
  xPosition: string | null;
  yPosition: string | null;
  anchorString: string | null;
  conditionalParentLabel: string | null;
  conditionalParentValue: string | null;
};

export type DocuSignTemplateRole = DocuSignTemplateRoleSummary & {
  totalTabCount: number | null;
  tabs: DocuSignTemplateField[];
};

export type DocuSignTemplateDocument = {
  documentId: string | null;
  name: string | null;
  order: string | null;
  pages: number | null;
  includeInDownload: boolean | null;
  signerMustAcknowledge: string | null;
  templateRequired: boolean | null;
  templateLocked: boolean | null;
};

export type DocuSignTemplateSummary = {
  templateId: string;
  name: string;
  description: string | null;
  folderId: string | null;
  folderName: string | null;
  createdAt: string | null;
  lastModifiedAt: string | null;
  lastUsedAt: string | null;
  pageCount: number | null;
  documentCount: number;
  recipientCount: number;
  shared: boolean | null;
  emailSubject: string | null;
  roles: DocuSignTemplateRoleSummary[];
};

export type DocuSignTemplateDetails = {
  templateId: string;
  name: string;
  description: string | null;
  folderId: string | null;
  folderName: string | null;
  createdAt: string | null;
  lastModifiedAt: string | null;
  lastUsedAt: string | null;
  pageCount: number | null;
  documentCount: number;
  recipientCount: number;
  shared: boolean | null;
  emailSubject: string | null;
  emailBlurb: string | null;
  roles: DocuSignTemplateRole[];
  documents: DocuSignTemplateDocument[];
  fields: DocuSignTemplateField[];
  fieldCatalog: {
    total: number;
    required: number;
    byType: Record<string, number>;
  };
};

export type ListDocuSignTemplatesResult = {
  account: DocuSignAccount;
  templates: DocuSignTemplateSummary[];
  meta: {
    countRequested: number;
    resultSetSize: number;
    searchText: string | null;
  };
};

export type GetDocuSignTemplateResult = {
  account: DocuSignAccount;
  template: DocuSignTemplateDetails;
};

export type DocuSignCreateTemplateDocumentInput = {
  documentId: string;
  name: string;
  documentBase64: string;
  fileExtension?: string;
  order?: string | number | null;
};

export type DocuSignCreateTemplateRecipientInput = {
  recipientType: "signer" | "notary";
  recipientId: string;
  roleName: string;
  name?: string | null;
  email?: string | null;
  routingOrder: string | number;
  defaultRecipient?: boolean;
  tabs?: Record<string, Array<Record<string, unknown>>>;
};

export type CreateDocuSignTemplateInput = {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
  name: string;
  description?: string | null;
  emailSubject?: string | null;
  emailBlurb?: string | null;
  documents: DocuSignCreateTemplateDocumentInput[];
  recipients: DocuSignCreateTemplateRecipientInput[];
  shared?: boolean;
  searchExistingByName?: boolean;
};

export type CreateDocuSignTemplateResult = {
  account: DocuSignAccount;
  template: DocuSignTemplateSummary;
  created: boolean;
};

export type DocuSignEnvelopeCustomFieldInput = {
  name: string;
  value: string;
  show?: boolean;
  required?: boolean;
};

export type DocuSignEnvelopeTemplateRoleInput = {
  roleName: string;
  name: string;
  email: string;
  routingOrder?: string | number | null;
  tabs?: Record<string, Array<Record<string, unknown>>>;
};

export type SendDocuSignTemplateEnvelopeInput = {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
  templateId: string;
  status?: "sent" | "created";
  emailSubject?: string | null;
  emailBlurb?: string | null;
  templateRoles: DocuSignEnvelopeTemplateRoleInput[];
  customFields?: DocuSignEnvelopeCustomFieldInput[];
  mergeRolesOnDraft?: boolean;
};

export type SendDocuSignTemplateEnvelopeResult = {
  account: DocuSignAccount;
  templateId: string;
  envelopeId: string;
  status: string | null;
  uri: string | null;
};

export type GetDocuSignTemplateDocumentInput = {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
  templateId: string;
  documentId: string;
  fileType?: string | null;
};

export type GetDocuSignTemplateDocumentResult = {
  account: DocuSignAccount;
  templateId: string;
  documentId: string;
  fileType: string;
  contentType: string | null;
  documentBase64: string;
};

function normalizeDocuSignOAuthBasePath(value: string) {
  const trimmedValue = value.trim();

  try {
    const normalizedUrl = trimmedValue.includes("://")
      ? new URL(trimmedValue)
      : new URL(`https://${trimmedValue}`);

    return normalizedUrl.host;
  } catch {
    return null;
  }
}

function getDocuSignEnvironment(oauthBasePath: string): DocuSignEnvironment {
  if (oauthBasePath.startsWith("account-d.")) {
    return "demo";
  }

  if (oauthBasePath.startsWith("account.")) {
    return "production";
  }

  return "custom";
}

function normalizeDocuSignAuthModel(
  value: string | null | undefined,
): DocuSignAuthModel | null {
  const normalized = trimNullable(value)?.toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === "authorization-code" || normalized === "auth-code") {
    return "authorization-code";
  }

  if (normalized === "jwt") {
    return "jwt";
  }

  return null;
}

function normalizeDocuSignPrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function hasRequiredJwtScopes(scopes: string[]) {
  return scopes.includes("signature") && scopes.includes("impersonation");
}

function readString(value: unknown) {
  if (typeof value === "string") {
    return trimNullable(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = readString(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function readBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = readString(value)?.toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toRecordArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => toRecord(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

function singularizeCollectionName(value: string) {
  const withoutTabsSuffix = value.replace(/Tabs$/, "");

  if (withoutTabsSuffix.endsWith("ies")) {
    return `${withoutTabsSuffix.slice(0, -3)}y`;
  }

  if (withoutTabsSuffix.endsWith("s")) {
    return withoutTabsSuffix.slice(0, -1);
  }

  return withoutTabsSuffix;
}

function normalizeRoleSummary(rawRecipient: Record<string, unknown>) {
  return {
    recipientId: readString(rawRecipient.recipientId),
    recipientIdGuid: readString(rawRecipient.recipientIdGuid),
    recipientType: readString(rawRecipient.recipientType) ?? "recipient",
    roleName: readString(rawRecipient.roleName),
    name: readString(rawRecipient.name),
    email: readString(rawRecipient.email),
    routingOrder: readString(rawRecipient.routingOrder),
    status: readString(rawRecipient.status),
  };
}

function normalizeTemplateTabs(input: {
  recipientType: string;
  roleName: string | null;
  tabs: Record<string, unknown> | null;
}) {
  if (!input.tabs) {
    return [];
  }

  const fields: DocuSignTemplateField[] = [];

  for (const [collection, rawTabs] of Object.entries(input.tabs)) {
    const tabTypeFallback = singularizeCollectionName(collection);

    for (const rawTab of toRecordArray(rawTabs)) {
      fields.push({
        tabId: readString(rawTab.tabId),
        tabType: readString(rawTab.tabType) ?? tabTypeFallback,
        collection,
        label: readString(rawTab.tabLabel),
        name: readString(rawTab.name),
        value: readString(rawTab.value),
        documentId: readString(rawTab.documentId),
        pageNumber: readString(rawTab.pageNumber),
        recipientId: readString(rawTab.recipientId),
        recipientType: input.recipientType,
        roleName: input.roleName,
        required: readBoolean(rawTab.required),
        locked: readBoolean(rawTab.locked),
        shared: readBoolean(rawTab.shared),
        xPosition: readString(rawTab.xPosition),
        yPosition: readString(rawTab.yPosition),
        anchorString: readString(rawTab.anchorString),
        conditionalParentLabel: readString(rawTab.conditionalParentLabel),
        conditionalParentValue: readString(rawTab.conditionalParentValue),
      });
    }
  }

  return fields.sort((left, right) => {
    const leftKey = [
      left.documentId ?? "",
      left.pageNumber ?? "",
      left.tabType,
      left.label ?? left.name ?? "",
    ].join(":");
    const rightKey = [
      right.documentId ?? "",
      right.pageNumber ?? "",
      right.tabType,
      right.label ?? right.name ?? "",
    ].join(":");

    return leftKey.localeCompare(rightKey);
  });
}

function normalizeTemplateRoles(input: {
  recipients: Record<string, unknown> | null;
  includeTabs: boolean;
}) {
  if (!input.recipients) {
    return [] as DocuSignTemplateRole[];
  }

  const roles: DocuSignTemplateRole[] = [];

  for (const [collectionName, rawRecipients] of Object.entries(input.recipients)) {
    if (collectionName === "recipientCount") {
      continue;
    }

    for (const rawRecipient of toRecordArray(rawRecipients)) {
      const summary = normalizeRoleSummary(rawRecipient);
      const recipientType =
        summary.recipientType !== "recipient"
          ? summary.recipientType
          : singularizeCollectionName(collectionName);
      const tabs = input.includeTabs
        ? normalizeTemplateTabs({
            recipientType,
            roleName: summary.roleName,
            tabs: toRecord(rawRecipient.tabs),
          })
        : [];

      roles.push({
        ...summary,
        recipientType,
        totalTabCount: readNumber(rawRecipient.totalTabCount),
        tabs,
      });
    }
  }

  return roles.sort((left, right) => {
    const leftOrder = Number(left.routingOrder ?? Number.MAX_SAFE_INTEGER);
    const rightOrder = Number(right.routingOrder ?? Number.MAX_SAFE_INTEGER);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return `${left.roleName ?? ""}:${left.name ?? ""}`.localeCompare(
      `${right.roleName ?? ""}:${right.name ?? ""}`,
    );
  });
}

function summarizeTemplateRoles(roles: DocuSignTemplateRole[]) {
  return roles.map<DocuSignTemplateRoleSummary>((role) => ({
    recipientId: role.recipientId,
    recipientIdGuid: role.recipientIdGuid,
    recipientType: role.recipientType,
    roleName: role.roleName,
    name: role.name,
    email: role.email,
    routingOrder: role.routingOrder,
    status: role.status,
  }));
}

function normalizeTemplateDocuments(rawDocuments: unknown) {
  return toRecordArray(rawDocuments).map<DocuSignTemplateDocument>((document) => ({
    documentId: readString(document.documentId),
    name: readString(document.name),
    order: readString(document.order),
    pages: readNumber(document.pages),
    includeInDownload: readBoolean(document.includeInDownload),
    signerMustAcknowledge: readString(document.signerMustAcknowledge),
    templateRequired: readBoolean(document.templateRequired),
    templateLocked: readBoolean(document.templateLocked),
  }));
}

function buildFieldCatalog(fields: DocuSignTemplateField[]) {
  const byType = Object.fromEntries(
    Object.entries(
      fields.reduce<Record<string, number>>((counts, field) => {
        counts[field.tabType] = (counts[field.tabType] ?? 0) + 1;
        return counts;
      }, {}),
    ).sort(([left], [right]) => left.localeCompare(right)),
  );

  return {
    total: fields.length,
    required: fields.filter((field) => field.required === true).length,
    byType,
  };
}

function normalizeTemplateSummary(rawTemplate: Record<string, unknown>) {
  const roles = normalizeTemplateRoles({
    recipients: toRecord(rawTemplate.recipients),
    includeTabs: false,
  });
  const documents = normalizeTemplateDocuments(rawTemplate.documents);
  const templateId = readString(rawTemplate.templateId);

  if (!templateId) {
    throw new Error("DocuSign returned a template without a templateId.");
  }

  return {
    templateId,
    name: readString(rawTemplate.name) ?? "Untitled template",
    description: readString(rawTemplate.description),
    folderId: readString(rawTemplate.folderId),
    folderName: readString(rawTemplate.folderName),
    createdAt: readString(rawTemplate.created),
    lastModifiedAt: readString(rawTemplate.lastModified),
    lastUsedAt: readString(rawTemplate.lastUsed),
    pageCount: readNumber(rawTemplate.pageCount),
    documentCount: documents.length,
    recipientCount: roles.length,
    shared: readBoolean(rawTemplate.shared),
    emailSubject: readString(rawTemplate.emailSubject),
    roles: summarizeTemplateRoles(roles),
  } satisfies DocuSignTemplateSummary;
}

function normalizeTemplateDetails(input: {
  template: Record<string, unknown>;
  recipients: Record<string, unknown> | null;
}) {
  const roles = normalizeTemplateRoles({
    recipients: input.recipients ?? toRecord(input.template.recipients),
    includeTabs: true,
  });
  const documents = normalizeTemplateDocuments(input.template.documents);
  const fields = roles.flatMap((role) => role.tabs);
  const templateId = readString(input.template.templateId);

  if (!templateId) {
    throw new Error("DocuSign returned template details without a templateId.");
  }

  return {
    templateId,
    name: readString(input.template.name) ?? "Untitled template",
    description: readString(input.template.description),
    folderId: readString(input.template.folderId),
    folderName: readString(input.template.folderName),
    createdAt: readString(input.template.created),
    lastModifiedAt: readString(input.template.lastModified),
    lastUsedAt: readString(input.template.lastUsed),
    pageCount: readNumber(input.template.pageCount),
    documentCount: documents.length,
    recipientCount: roles.length,
    shared: readBoolean(input.template.shared),
    emailSubject: readString(input.template.emailSubject),
    emailBlurb: readString(input.template.emailBlurb),
    roles,
    documents,
    fields,
    fieldCatalog: buildFieldCatalog(fields),
  } satisfies DocuSignTemplateDetails;
}

function loadDocuSignSdk(): DocuSignSdk {
  const runtimeRequire = new Function(
    "runtimeRequire",
    "packageName",
    "return runtimeRequire(packageName);",
  ) as (runtimeRequire: NodeJS.Require, packageName: string) => unknown;
  const loadedModule = runtimeRequire(require, DOCUSIGN_PACKAGE_NAME) as
    | {
        default?: unknown;
      }
    | undefined;

  return (loadedModule?.default ?? loadedModule) as DocuSignSdk;
}

async function resolveDocuSignConfig({
  readSecretValue,
  env = process.env,
}: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
}): Promise<ResolvedDocuSignConfig> {
  const clientId = await resolveProviderSecret({
    provider: DOCUSIGN_PROVIDER,
    keyName: "DOCUSIGN_CLIENT_ID",
    envValue: env.DOCUSIGN_CLIENT_ID,
    warningPrefix: "DocuSign",
    readSecretValue,
  });
  const clientSecret = await resolveProviderSecret({
    provider: DOCUSIGN_PROVIDER,
    keyName: "DOCUSIGN_CLIENT_SECRET",
    envValue: env.DOCUSIGN_CLIENT_SECRET,
    warningPrefix: "DocuSign",
    readSecretValue,
  });
  const privateKey = await resolveProviderSecret({
    provider: DOCUSIGN_PROVIDER,
    keyName: "DOCUSIGN_PRIVATE_KEY",
    envValue: env.DOCUSIGN_PRIVATE_KEY ?? env.DOCUSIGN_JWT_PRIVATE_KEY,
    warningPrefix: "DocuSign",
    readSecretValue,
  });

  const warnings = [
    ...clientId.warnings,
    ...clientSecret.warnings,
    ...privateKey.warnings,
  ];
  const configuredAuthBaseUrl = trimNullable(env.DOCUSIGN_AUTH_BASE_URL);
  let oauthBasePath = DOCUSIGN_DEFAULT_OAUTH_BASE_PATH;
  let authBaseUrlIsValid = true;

  if (configuredAuthBaseUrl) {
    const normalizedAuthBasePath =
      normalizeDocuSignOAuthBasePath(configuredAuthBaseUrl);

    if (!normalizedAuthBasePath) {
      authBaseUrlIsValid = false;
      warnings.push(
        "DocuSign: DOCUSIGN_AUTH_BASE_URL is invalid. Use a hostname like account-d.docusign.com or an https URL.",
      );
    } else {
      oauthBasePath = normalizedAuthBasePath;
    }
  }

  const configuredAuthModel = normalizeDocuSignAuthModel(env.DOCUSIGN_AUTH_MODEL);

  if (env.DOCUSIGN_AUTH_MODEL && !configuredAuthModel) {
    warnings.push(
      "DocuSign: DOCUSIGN_AUTH_MODEL must be either authorization-code or jwt.",
    );
  }

  const authModel =
    configuredAuthModel ??
    (privateKey.value ? "jwt" : "authorization-code");
  const keypairId = trimNullable(env.DOCUSIGN_KEYPAIR_ID);
  const userId = trimNullable(env.DOCUSIGN_USER_ID);
  const configuredAccountId = trimNullable(env.DOCUSIGN_ACCOUNT_ID);
  const rawScopes = normalizeListEnv(
    env.DOCUSIGN_OAUTH_SCOPES,
    authModel === "jwt"
      ? DOCUSIGN_DEFAULT_JWT_SCOPES
      : DOCUSIGN_DEFAULT_AUTH_CODE_SCOPES,
  );
  const scopes = Array.from(new Set(rawScopes));

  if (!clientId.value) {
    warnings.push(
      "DocuSign: missing DOCUSIGN_CLIENT_ID. Store it in the docusign vault record or set the env fallback.",
    );
  }

  let normalizedPrivateKey: string | null = null;

  if (privateKey.value) {
    normalizedPrivateKey = normalizeDocuSignPrivateKey(privateKey.value);

    try {
      createPrivateKey({
        key: normalizedPrivateKey,
        format: "pem",
      });
    } catch {
      normalizedPrivateKey = null;
      warnings.push("DocuSign: DOCUSIGN_PRIVATE_KEY is not valid PEM data.");
    }
  }

  if (authModel === "authorization-code") {
    if (!clientSecret.value) {
      warnings.push(
        "DocuSign: missing DOCUSIGN_CLIENT_SECRET. Store it in the docusign vault record or set the env fallback.",
      );
    }
  } else {
    if (!privateKey.value) {
      warnings.push(
        "DocuSign: missing DOCUSIGN_PRIVATE_KEY for JWT authentication.",
      );
    }

    if (!userId) {
      warnings.push(
        "DocuSign: missing DOCUSIGN_USER_ID. JWT impersonation needs the target user's API Username GUID.",
      );
    }

    if (!hasRequiredJwtScopes(scopes)) {
      warnings.push(
        "DocuSign: JWT mode should request both signature and impersonation scopes.",
      );
    }
  }

  let ready = false;

  const hasModelSpecificCredentials =
    authModel === "jwt"
      ? Boolean(clientId.value && normalizedPrivateKey && userId)
      : Boolean(clientId.value && clientSecret.value);

  if (hasModelSpecificCredentials && authBaseUrlIsValid) {
    try {
      loadDocuSignSdk();
      ready = true;
    } catch (error) {
      warnings.push(
        `DocuSign: the official SDK is not available to the server runtime. ${
          error instanceof Error ? error.message : "Check the installed package and config."
        }`,
      );
    }
  }

  return {
    status: {
      provider: "docusign",
      ready,
      authModel,
      environment: getDocuSignEnvironment(oauthBasePath),
      oauthBasePath,
      userIdConfigured: Boolean(userId),
      keypairIdConfigured: Boolean(keypairId),
      accountIdConfigured: Boolean(configuredAccountId),
      configuredAccountId,
      scopes,
      sources: {
        DOCUSIGN_CLIENT_ID: clientId.source,
        ...(authModel === "jwt"
          ? {
              DOCUSIGN_PRIVATE_KEY: privateKey.source,
            }
          : {
              DOCUSIGN_CLIENT_SECRET: clientSecret.source,
            }),
      },
      warnings: Array.from(new Set(warnings)),
    },
    authModel,
    clientId: clientId.value,
    clientSecret: clientSecret.value,
    privateKey: normalizedPrivateKey,
    oauthBasePath,
    scopes,
    userId,
    configuredAccountId,
  };
}

function normalizeAccountSelection(input: {
  account: Record<string, unknown>;
  selection: DocuSignAccount["selection"];
}) {
  const accountId = readString(input.account.accountId);
  const baseUri = readString(input.account.baseUri);

  if (!accountId || !baseUri) {
    throw new Error(
      "DocuSign did not return an accountId/baseUri pair for the selected account.",
    );
  }

  return {
    accountId,
    accountName: readString(input.account.accountName),
    baseUri,
    isDefault: readBoolean(input.account.isDefault) ?? false,
    selection: input.selection,
  } satisfies DocuSignAccount;
}

function selectDocuSignAccount(input: {
  accounts: unknown;
  configuredAccountId: string | null;
}) {
  const accounts = toRecordArray(input.accounts);

  if (accounts.length === 0) {
    throw new Error(
      "DocuSign user info did not return any accessible accounts for this integration.",
    );
  }

  if (input.configuredAccountId) {
    const configuredAccount = accounts.find(
      (account) => readString(account.accountId) === input.configuredAccountId,
    );

    if (!configuredAccount) {
      const availableAccountIds = accounts
        .map((account) => readString(account.accountId))
        .filter((value): value is string => Boolean(value))
        .join(", ");

      throw new Error(
        `DocuSign could not find DOCUSIGN_ACCOUNT_ID=${input.configuredAccountId} for this user. Available accounts: ${availableAccountIds || "none"}.`,
      );
    }

    return normalizeAccountSelection({
      account: configuredAccount,
      selection: "configured",
    });
  }

  const defaultAccount =
    accounts.find((account) => readBoolean(account.isDefault) === true) ??
    accounts[0];

  return normalizeAccountSelection({
    account: defaultAccount,
    selection:
      readBoolean(defaultAccount.isDefault) === true ? "default" : "first-available",
  });
}

export async function getDocuSignStatus({
  readSecretValue,
  env = process.env,
}: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
}) {
  return (await resolveDocuSignConfig({ readSecretValue, env })).status;
}

async function createDocuSignTemplatesApi(input: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
}) {
  const { account, apiClient, sdk } = await createDocuSignApiContext(input);

  return {
    account,
    templatesApi: new sdk.TemplatesApi(apiClient),
  };
}

async function createDocuSignApiContext(input: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
}) {
  const config = await resolveDocuSignConfig(input);

  if (!config.status.ready) {
    throw new Error(
      config.status.warnings[0] ??
        "DocuSign is not configured well enough to initialize the template service.",
    );
  }

  if (config.authModel !== "jwt") {
    throw new Error(
      "DocuSign template access currently requires JWT authentication in the shared integration layer.",
    );
  }

  if (!config.clientId || !config.privateKey || !config.userId) {
    throw new Error(
      "DocuSign JWT credentials are incomplete. Check DOCUSIGN_CLIENT_ID, DOCUSIGN_PRIVATE_KEY, and DOCUSIGN_USER_ID.",
    );
  }

  const sdk = loadDocuSignSdk();
  const apiClient = new sdk.ApiClient();
  apiClient.setOAuthBasePath(config.oauthBasePath);

  const jwtToken = await apiClient.requestJWTUserToken(
    config.clientId,
    config.userId,
    config.scopes,
    config.privateKey,
    3600,
  );
  const userInfo = await apiClient.getUserInfo(jwtToken.body.access_token);
  const account = selectDocuSignAccount({
    accounts: userInfo.accounts,
    configuredAccountId: config.configuredAccountId,
  });

  apiClient.setBasePath(`${account.baseUri}/restapi`);
  apiClient.addDefaultHeader(
    "Authorization",
    `Bearer ${jwtToken.body.access_token}`,
  );

  return {
    account,
    apiClient,
    sdk,
  };
}

async function createDocuSignEnvelopesApi(input: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
}) {
  const { account, apiClient, sdk } = await createDocuSignApiContext(input);

  return {
    account,
    envelopesApi: new sdk.EnvelopesApi(apiClient),
  };
}

export async function listDocuSignTemplates(input: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
  count?: number;
  searchText?: string | null;
}) {
  const count = Math.max(
    1,
    Math.min(
      Math.trunc(input.count ?? DEFAULT_TEMPLATE_PAGE_SIZE),
      MAX_TEMPLATE_PAGE_SIZE,
    ),
  );
  const searchText = trimNullable(input.searchText ?? null);
  const { account, templatesApi } = await createDocuSignTemplatesApi(input);
  const results = await templatesApi.listTemplates(account.accountId, {
    count: String(count),
    include: "folders,documents,recipients",
    order: "desc",
    orderBy: "modified",
    ...(searchText ? { searchText } : {}),
  });
  const templates = toRecordArray(results.envelopeTemplates).map((template) =>
    normalizeTemplateSummary(template),
  );

  return {
    account,
    templates,
    meta: {
      countRequested: count,
      resultSetSize: readNumber(results.resultSetSize) ?? templates.length,
      searchText,
    },
  } satisfies ListDocuSignTemplatesResult;
}

export async function getDocuSignTemplate(input: {
  readSecretValue: ProviderSecretReader;
  env?: StringEnv;
  templateId: string;
}) {
  const templateId = trimNullable(input.templateId);

  if (!templateId) {
    throw new Error("A DocuSign templateId is required.");
  }

  const { account, templatesApi } = await createDocuSignTemplatesApi(input);
  const [template, recipients] = await Promise.all([
    templatesApi.get(account.accountId, templateId, {
      include: "folders,documents,recipients",
    }),
    templatesApi.listRecipients(account.accountId, templateId, {
      includeTabs: "true",
      includeAnchorTabLocations: "true",
    }),
  ]);

  return {
    account,
    template: normalizeTemplateDetails({
      template,
      recipients,
    }),
  } satisfies GetDocuSignTemplateResult;
}

function buildEnvelopeTemplateRoles(
  templateRoles: DocuSignEnvelopeTemplateRoleInput[],
) {
  return templateRoles.map((role) => ({
    roleName: role.roleName,
    name: role.name.trim(),
    email: role.email.trim().toLowerCase(),
    ...(role.routingOrder === undefined || role.routingOrder === null
      ? {}
      : { routingOrder: String(role.routingOrder) }),
    ...(role.tabs ? { tabs: role.tabs } : {}),
  }));
}

function buildEnvelopeCustomFields(
  customFields: DocuSignEnvelopeCustomFieldInput[] | undefined,
) {
  type EnvelopeTextCustomField = {
    name: string;
    value: string;
    show: string;
    required?: string;
  };

  const textCustomFields =
    customFields
      ?.map((field) => {
        const name = trimNullable(field.name);
        const value = trimNullable(field.value);

        if (!name || !value) {
          return null;
        }

        return {
          name,
          value,
          show: field.show === true ? "true" : "false",
          ...(field.required === undefined
            ? {}
            : { required: field.required ? "true" : "false" }),
        } satisfies EnvelopeTextCustomField;
      })
      .filter((field): field is EnvelopeTextCustomField => Boolean(field)) ?? [];

  return textCustomFields.length > 0 ? { textCustomFields } : undefined;
}

function buildTemplateEnvelopePayload(input: {
  templateId: string;
  status: "sent" | "created";
  emailSubject?: string | null;
  emailBlurb?: string | null;
  templateRoles: DocuSignEnvelopeTemplateRoleInput[];
  customFields?: DocuSignEnvelopeCustomFieldInput[];
}) {
  const envelopeCustomFields = buildEnvelopeCustomFields(input.customFields);

  return {
    templateId: input.templateId,
    status: input.status,
    ...(trimNullable(input.emailSubject)
      ? { emailSubject: trimNullable(input.emailSubject) }
      : {}),
    ...(trimNullable(input.emailBlurb)
      ? { emailBlurb: trimNullable(input.emailBlurb) }
      : {}),
    templateRoles: buildEnvelopeTemplateRoles(input.templateRoles),
    ...(envelopeCustomFields ? { customFields: envelopeCustomFields } : {}),
  } satisfies Record<string, unknown>;
}

function normalizeEnvelopeSummary(rawEnvelope: Record<string, unknown>) {
  const envelopeId = readString(rawEnvelope.envelopeId);

  if (!envelopeId) {
    throw new Error("DocuSign returned an envelope summary without an envelopeId.");
  }

  return {
    envelopeId,
    status: readString(rawEnvelope.status),
    uri: readString(rawEnvelope.uri),
  };
}

function normalizeTemplateNameMatch(value: string) {
  return value.trim().toLowerCase();
}

function buildCreateTemplateRecipients(
  recipients: DocuSignCreateTemplateRecipientInput[],
) {
  const signerRecipients: Array<Record<string, unknown>> = [];
  const notaryRecipients: Array<Record<string, unknown>> = [];

  for (const recipient of recipients) {
    const payload = {
      recipientId: recipient.recipientId,
      roleName: recipient.roleName,
      name: trimNullable(recipient.name),
      email: trimNullable(recipient.email),
      routingOrder: String(recipient.routingOrder),
      defaultRecipient: recipient.defaultRecipient ? "true" : "false",
      tabs: recipient.tabs ?? undefined,
    } satisfies Record<string, unknown>;

    if (recipient.recipientType === "notary") {
      notaryRecipients.push(payload);
      continue;
    }

    signerRecipients.push(payload);
  }

  return {
    signers: signerRecipients,
    ...(notaryRecipients.length > 0 ? { notaries: notaryRecipients } : {}),
  };
}

function buildEnvelopeTemplatePayload(input: {
  name: string;
  description?: string | null;
  emailSubject?: string | null;
  emailBlurb?: string | null;
  documents: DocuSignCreateTemplateDocumentInput[];
  recipients: DocuSignCreateTemplateRecipientInput[];
  shared?: boolean;
}) {
  return {
    name: input.name,
    description: trimNullable(input.description),
    emailSubject:
      trimNullable(input.emailSubject) ?? `Pushing Capital | ${input.name}`,
    emailBlurb:
      trimNullable(input.emailBlurb) ??
      "Pushing Capital generated this template for company onboarding and compliance workflows.",
    shared: input.shared === false ? "false" : "true",
    documents: input.documents.map((document) => ({
      documentId: document.documentId,
      name: document.name,
      documentBase64: document.documentBase64,
      fileExtension: trimNullable(document.fileExtension) ?? "pdf",
      order:
        document.order === undefined || document.order === null
          ? undefined
          : String(document.order),
    })),
    recipients: buildCreateTemplateRecipients(input.recipients),
  } satisfies Record<string, unknown>;
}

export async function createDocuSignTemplate(input: CreateDocuSignTemplateInput) {
  const name = trimNullable(input.name);

  if (!name) {
    throw new Error("A DocuSign template name is required.");
  }

  if (!Array.isArray(input.documents) || input.documents.length === 0) {
    throw new Error("At least one DocuSign template document is required.");
  }

  if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
    throw new Error("At least one DocuSign template recipient is required.");
  }

  const searchExistingByName = input.searchExistingByName !== false;
  const { account, templatesApi } = await createDocuSignTemplatesApi(input);
  const envelopeTemplate = buildEnvelopeTemplatePayload({
    name,
    description: input.description,
    emailSubject: input.emailSubject,
    emailBlurb: input.emailBlurb,
    documents: input.documents,
    recipients: input.recipients,
    shared: input.shared,
  });

  if (searchExistingByName) {
    const existingResults = await templatesApi.listTemplates(account.accountId, {
      count: String(MAX_TEMPLATE_PAGE_SIZE),
      include: "folders,documents,recipients",
      order: "desc",
      orderBy: "modified",
      searchText: name,
    });
    const existingTemplate = toRecordArray(existingResults.envelopeTemplates).find(
      (template) =>
        normalizeTemplateNameMatch(readString(template.name) ?? "") ===
        normalizeTemplateNameMatch(name),
    );

    if (existingTemplate) {
      const existingTemplateId = readString(existingTemplate.templateId);

      if (!existingTemplateId) {
        throw new Error(
          "DocuSign returned an existing template match without a templateId.",
        );
      }

      await templatesApi.update(account.accountId, existingTemplateId, {
        envelopeTemplate,
      });
      const refreshedTemplate = await templatesApi.get(
        account.accountId,
        existingTemplateId,
        {
          include: "folders,documents,recipients",
        },
      );

      return {
        account,
        template: normalizeTemplateSummary(toRecord(refreshedTemplate) ?? {}),
        created: false,
      } satisfies CreateDocuSignTemplateResult;
    }
  }

  const createdTemplate = await templatesApi.createTemplate(account.accountId, {
    envelopeTemplate,
  });

  return {
    account,
    template: normalizeTemplateSummary(toRecord(createdTemplate) ?? {}),
    created: true,
  } satisfies CreateDocuSignTemplateResult;
}

export async function sendDocuSignTemplateEnvelope(
  input: SendDocuSignTemplateEnvelopeInput,
) {
  const templateId = trimNullable(input.templateId);

  if (!templateId) {
    throw new Error("A DocuSign templateId is required.");
  }

  if (!Array.isArray(input.templateRoles) || input.templateRoles.length === 0) {
    throw new Error("At least one DocuSign template role is required.");
  }

  const envelopeStatus = input.status ?? "sent";
  const { account, envelopesApi } = await createDocuSignEnvelopesApi(input);
  const envelopeDefinition = buildTemplateEnvelopePayload({
    templateId,
    status: envelopeStatus,
    emailSubject: input.emailSubject,
    emailBlurb: input.emailBlurb,
    templateRoles: input.templateRoles,
    customFields: input.customFields,
  });
  const createdEnvelope = await envelopesApi.createEnvelope(account.accountId, {
    envelopeDefinition,
    ...(envelopeStatus === "created" && input.mergeRolesOnDraft
      ? { mergeRolesOnDraft: "true" }
      : {}),
  });
  const normalizedEnvelope = normalizeEnvelopeSummary(
    toRecord(createdEnvelope) ?? {},
  );

  return {
    account,
    templateId,
    envelopeId: normalizedEnvelope.envelopeId,
    status: normalizedEnvelope.status,
    uri: normalizedEnvelope.uri,
  } satisfies SendDocuSignTemplateEnvelopeResult;
}

export async function getDocuSignTemplateDocument(
  input: GetDocuSignTemplateDocumentInput,
) {
  const templateId = trimNullable(input.templateId);
  const documentId = trimNullable(input.documentId);
  const fileType = trimNullable(input.fileType)?.toLowerCase() ?? "pdf";

  if (!templateId) {
    throw new Error("A DocuSign templateId is required.");
  }

  if (!documentId) {
    throw new Error("A DocuSign documentId is required.");
  }

  const { account, apiClient } = await createDocuSignApiContext(input);
  const requestUrl = new URL(
    `${account.baseUri}/restapi/v2.1/accounts/${encodeURIComponent(
      account.accountId,
    )}/templates/${encodeURIComponent(templateId)}/documents/${encodeURIComponent(
      documentId,
    )}`,
  );

  if (fileType && fileType !== "pdf") {
    requestUrl.searchParams.set("file_type", fileType);
  }

  const defaultHeaders = (
    apiClient as unknown as {
      defaultHeaders?: Record<string, string>;
    }
  ).defaultHeaders ?? { Authorization: "" };
  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/pdf",
      ...(defaultHeaders.Authorization
        ? { Authorization: defaultHeaders.Authorization }
        : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = trimNullable(await response.text().catch(() => ""));
    throw new Error(
      detail ??
        `DocuSign template document download failed with status ${response.status}.`,
    );
  }

  return {
    account,
    templateId,
    documentId,
    fileType,
    contentType: trimNullable(response.headers.get("content-type")),
    documentBase64: Buffer.from(await response.arrayBuffer()).toString("base64"),
  } satisfies GetDocuSignTemplateDocumentResult;
}
