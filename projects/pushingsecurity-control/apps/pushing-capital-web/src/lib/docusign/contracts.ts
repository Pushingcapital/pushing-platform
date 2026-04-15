import type {
  DocuSignTemplateDetails,
  DocuSignTemplateField,
} from "@pushingcap/integrations/docusign";

export type DocuSignRecipientContract = {
  roleName: string;
  recipientType: "signer" | "notary";
  recipientId?: string | null;
  routingOrder: number | null;
  defaultSignerEmail: string | null;
  defaultSignerName: string | null;
  defaultSignerTitle: string | null;
};

export type DocuSignFieldContract = {
  id: string;
  roleName: string | null;
  recipientId?: string | null;
  collection?: string | null;
  tabType: string;
  tabId?: string | null;
  tabLabel: string | null;
  name: string | null;
  required: boolean;
  anchorString: string | null;
  documentId?: string | null;
  pageNumber?: string | null;
  xPosition?: string | null;
  yPosition?: string | null;
  defaultValue: string | null;
  locked: boolean;
};

export type SignerKey = "ahmed" | "david" | "emmanuel";

export type SignerDirectoryEntry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  defaultRoles: string[];
};

export const SIGNER_DIRECTORY: Record<SignerKey, SignerDirectoryEntry> = {
  ahmed: {
    firstName: "Ahmed",
    lastName: "Ismaeil",
    email: "amssi@pushingcap.com",
    phone: "9492285892",
    title: "Chief Operating Officer",
    defaultRoles: ["company_representative", "attorney_in_fact"],
  },
  david: {
    firstName: "David",
    lastName: "Berger",
    email: "davidb@pushingcap.com",
    phone: "9494130318",
    title: "Chief Data Officer",
    defaultRoles: ["company_representative"],
  },
  emmanuel: {
    firstName: "Emmanuel",
    lastName: "Haddad",
    email: "manny@pushingcap.com",
    phone: "9497064604",
    title: "CEO / Chief Executive Officer",
    defaultRoles: ["company_representative"],
  },
};

export const MUTUAL_NDA_TEMPLATE_KEY = "mutual-nda";
export const MUTUAL_NDA_TEMPLATE_NAME = "Mutual NDA";
export const MUTUAL_NDA_COMPANY_NAME = "Pushing Capital LLC";

export const MUTUAL_NDA_ROLE_CONTRACTS: DocuSignRecipientContract[] = [
  {
    roleName: "Manager",
    recipientType: "signer",
    recipientId: null,
    routingOrder: 2,
    defaultSignerEmail: SIGNER_DIRECTORY.ahmed.email,
    defaultSignerName: `${SIGNER_DIRECTORY.ahmed.firstName} ${SIGNER_DIRECTORY.ahmed.lastName}`,
    defaultSignerTitle: SIGNER_DIRECTORY.ahmed.title,
  },
  {
    roleName: "Client",
    recipientType: "signer",
    recipientId: null,
    routingOrder: 1,
    defaultSignerEmail: null,
    defaultSignerName: null,
    defaultSignerTitle: null,
  },
];

export const MUTUAL_NDA_FIELD_CONTRACTS: DocuSignFieldContract[] = [
  {
    id: "manager_business_name",
    roleName: "Manager",
    recipientId: null,
    tabType: "text",
    tabId: null,
    tabLabel: "Manager Business Name",
    name: "First Party",
    required: true,
    anchorString: null,
    defaultValue: MUTUAL_NDA_COMPANY_NAME,
    locked: false,
  },
  {
    id: "client_business_name",
    roleName: "Manager",
    recipientId: null,
    tabType: "text",
    tabId: null,
    tabLabel: "Client Business Name",
    name: "Second Party",
    required: true,
    anchorString: null,
    defaultValue: null,
    locked: false,
  },
  {
    id: "effective_date",
    roleName: "Manager",
    recipientId: null,
    tabType: "text",
    tabId: null,
    tabLabel: "Effective Date",
    name: "Effective Date",
    required: true,
    anchorString: null,
    defaultValue: null,
    locked: false,
  },
];

export const MUTUAL_NDA_CUSTOM_FIELD_NAMES = [
  "onboardingJobId",
  "jobId",
  "workflowKey",
  "templateKey",
  "platformContactId",
  "platformContactEmail",
] as const;

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeContractToken(value: string | null | undefined) {
  return (
    trimNullable(value)
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ?? null
  );
}

function buildFieldContractId(field: DocuSignTemplateField) {
  const tabId = trimNullable(field.tabId);

  if (tabId) {
    return tabId;
  }

  const parts = [
    normalizeContractToken(field.roleName),
    normalizeContractToken(field.tabType),
    normalizeContractToken(field.label) ?? normalizeContractToken(field.name),
    normalizeContractToken(field.documentId),
    normalizeContractToken(field.pageNumber),
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(":") : "unresolved-field-contract";
}

export function buildRecipientContractsFromTemplateDetails(
  template: DocuSignTemplateDetails,
) {
  return template.roles.map((role) => ({
    roleName: role.roleName ?? role.recipientType,
    recipientType:
      role.recipientType.toLowerCase().includes("notary") ? "notary" : "signer",
    recipientId: trimNullable(role.recipientId),
    routingOrder:
      role.routingOrder && Number.isFinite(Number(role.routingOrder))
        ? Number(role.routingOrder)
        : null,
    defaultSignerEmail: trimNullable(role.email),
    defaultSignerName: trimNullable(role.name),
    defaultSignerTitle: null,
  })) satisfies DocuSignRecipientContract[];
}

export function buildFieldContractsFromTemplateDetails(
  template: DocuSignTemplateDetails,
) {
  return template.fields.map((field) => ({
    id: buildFieldContractId(field),
    roleName: trimNullable(field.roleName),
    recipientId: trimNullable(field.recipientId),
    collection: trimNullable(field.collection),
    tabType: field.tabType,
    tabId: trimNullable(field.tabId),
    tabLabel: trimNullable(field.label),
    name: trimNullable(field.name),
    required: field.required === true,
    anchorString: trimNullable(field.anchorString),
    documentId: trimNullable(field.documentId),
    pageNumber: trimNullable(field.pageNumber),
    xPosition: trimNullable(field.xPosition),
    yPosition: trimNullable(field.yPosition),
    defaultValue: trimNullable(field.value),
    locked: field.locked === true,
  })) satisfies DocuSignFieldContract[];
}

function findFieldContract(
  fieldContracts: DocuSignFieldContract[] | null | undefined,
  roleName: string,
  candidates: string[],
) {
  const normalizedRoleName = normalizeContractToken(roleName);

  if (!fieldContracts || !normalizedRoleName) {
    return null;
  }

  const normalizedCandidates = candidates
    .map((candidate) => normalizeContractToken(candidate))
    .filter((candidate): candidate is string => Boolean(candidate));

  for (const field of fieldContracts) {
    if (normalizeContractToken(field.roleName) !== normalizedRoleName) {
      continue;
    }

    const aliases = [
      normalizeContractToken(field.tabLabel),
      normalizeContractToken(field.name),
      normalizeContractToken(field.id),
    ].filter((value): value is string => Boolean(value));

    if (aliases.some((alias) => normalizedCandidates.includes(alias))) {
      return field;
    }
  }

  return null;
}

export function buildMutualNdaManagerTextTabs(input: {
  clientName: string;
  effectiveDate: string;
  companyName?: string | null;
  fieldContracts?: DocuSignFieldContract[] | null;
}) {
  const companyName =
    trimNullable(input.companyName) ?? MUTUAL_NDA_COMPANY_NAME;

  return MUTUAL_NDA_FIELD_CONTRACTS.map((field) => {
    const liveField =
      findFieldContract(input.fieldContracts, "Manager", [
        field.id,
        field.tabLabel ?? "",
        field.name ?? "",
      ]) ?? field;

    return {
      ...(trimNullable(liveField.tabId) ? { tabId: trimNullable(liveField.tabId) } : {}),
      tabLabel: liveField.tabLabel ?? field.tabLabel ?? field.id,
      ...(trimNullable(liveField.name ?? field.name)
        ? { name: trimNullable(liveField.name ?? field.name) }
        : {}),
      value:
        field.id === "manager_business_name"
          ? companyName
          : field.id === "client_business_name"
            ? input.clientName
            : input.effectiveDate,
      locked: (liveField.locked ?? field.locked) ? "true" : "false",
    };
  });
}
