import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  getDocumentTemplateBinding,
  upsertDocumentTemplateBinding,
} from "@/lib/document-template-bindings";
import {
  buildFieldContractsFromTemplateDetails,
  buildRecipientContractsFromTemplateDetails,
  MUTUAL_NDA_COMPANY_NAME,
  MUTUAL_NDA_CUSTOM_FIELD_NAMES,
  MUTUAL_NDA_ROLE_CONTRACTS,
  MUTUAL_NDA_TEMPLATE_KEY,
  MUTUAL_NDA_TEMPLATE_NAME,
} from "@/lib/docusign/contracts";
import {
  createDocuSignTemplate,
  getDocuSignTemplate,
  getDocuSignTemplateDocument,
  type DocuSignTemplateDetails,
  type DocuSignTemplateField,
} from "@/lib/providers/docusign";

import { readSecretValue } from "@/lib/control/store";

const MUTUAL_NDA_SOURCE_DIRECTORY = path.join(
  process.cwd(),
  "output",
  "pdf",
  "managed",
  "mutual-nda",
);

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildTemplateTabPayload(field: DocuSignTemplateField) {
  return {
    collection: field.collection,
    payload: {
      ...(trimNullable(field.label) ? { tabLabel: trimNullable(field.label) } : {}),
      ...(trimNullable(field.name) ? { name: trimNullable(field.name) } : {}),
      ...(trimNullable(field.documentId)
        ? { documentId: trimNullable(field.documentId) }
        : {}),
      ...(trimNullable(field.pageNumber)
        ? { pageNumber: trimNullable(field.pageNumber) }
        : {}),
      ...(trimNullable(field.xPosition)
        ? { xPosition: trimNullable(field.xPosition) }
        : {}),
      ...(trimNullable(field.yPosition)
        ? { yPosition: trimNullable(field.yPosition) }
        : {}),
      ...(field.required === null
        ? {}
        : { required: field.required ? "true" : "false" }),
      ...(field.locked === null
        ? {}
        : { locked: field.locked ? "true" : "false" }),
      ...(trimNullable(field.value) ? { value: trimNullable(field.value) } : {}),
    } satisfies Record<string, unknown>,
  };
}

function groupRoleTabs(fields: DocuSignTemplateField[]) {
  const tabs: Record<string, Array<Record<string, unknown>>> = {};

  for (const field of fields) {
    const tab = buildTemplateTabPayload(field);
    const collection = tabs[tab.collection] ?? [];
    collection.push(tab.payload);
    tabs[tab.collection] = collection;
  }

  return tabs;
}

function buildProvisioningRecipients(template: DocuSignTemplateDetails) {
  return template.roles.map((role, index) => {
    const configuredRole = MUTUAL_NDA_ROLE_CONTRACTS.find(
      (candidate) =>
        candidate.roleName.toLowerCase() ===
        (trimNullable(role.roleName)?.toLowerCase() ?? ""),
    );

    return {
      recipientType: configuredRole?.recipientType ?? "signer",
      recipientId: role.recipientId ?? String(index + 1),
      roleName: role.roleName ?? configuredRole?.roleName ?? `Recipient ${index + 1}`,
      name: configuredRole?.defaultSignerName ?? trimNullable(role.name),
      email: configuredRole?.defaultSignerEmail ?? trimNullable(role.email),
      routingOrder:
        configuredRole?.routingOrder ??
        Number(trimNullable(role.routingOrder) ?? index + 1),
      defaultRecipient: Boolean(configuredRole?.defaultSignerEmail),
      tabs: groupRoleTabs(role.tabs),
    };
  });
}

async function downloadSourceDocuments(template: DocuSignTemplateDetails) {
  await mkdir(MUTUAL_NDA_SOURCE_DIRECTORY, { recursive: true });
  const sourcePaths: string[] = [];
  const documentInputs = [];

  for (const [index, document] of template.documents.entries()) {
    const documentId = trimNullable(document.documentId);

    if (!documentId) {
      continue;
    }

    const downloaded = await getDocuSignTemplateDocument({
      readSecretValue,
      templateId: template.templateId,
      documentId,
    });
    const outputPath = path.join(
      MUTUAL_NDA_SOURCE_DIRECTORY,
      `${String(index + 1).padStart(2, "0")}-${slugify(
        trimNullable(document.name) ?? `document-${documentId}`,
      )}.${downloaded.fileType}`,
    );

    await writeFile(outputPath, Buffer.from(downloaded.documentBase64, "base64"));
    sourcePaths.push(outputPath);
    documentInputs.push({
      documentId,
      name: trimNullable(document.name) ?? `Mutual NDA ${documentId}`,
      documentBase64: downloaded.documentBase64,
      fileExtension: downloaded.fileType,
      order: trimNullable(document.order) ?? String(index + 1),
    });
  }

  if (documentInputs.length === 0) {
    throw new Error("The Mutual NDA template does not expose any downloadable documents.");
  }

  return {
    sourcePaths,
    documentInputs,
  };
}

function buildWarnings(input: {
  sourceTemplateId: string;
  provisionedTemplateId: string;
  existingBindingTemplateId: string | null;
}) {
  const warnings: string[] = [];

  if (input.sourceTemplateId !== input.provisionedTemplateId) {
    warnings.push(
      `Mutual NDA provisioning migrated from source template ${input.sourceTemplateId} to managed template ${input.provisionedTemplateId}.`,
    );
  }

  if (
    input.existingBindingTemplateId &&
    input.existingBindingTemplateId !== input.provisionedTemplateId
  ) {
    warnings.push(
      `Mutual NDA binding moved from ${input.existingBindingTemplateId} to ${input.provisionedTemplateId}.`,
    );
  }

  return warnings;
}

export async function ensureProgrammaticMutualNdaTemplate() {
  const sourceTemplateId = trimNullable(process.env.DOCUSIGN_MUTUAL_NDA_TEMPLATE_ID);

  if (!sourceTemplateId) {
    throw new Error(
      "DOCUSIGN_MUTUAL_NDA_TEMPLATE_ID must point at the source Mutual NDA template until the programmatic template is provisioned.",
    );
  }

  const existingBinding = await getDocumentTemplateBinding(MUTUAL_NDA_TEMPLATE_KEY);
  const sourceTemplate = await getDocuSignTemplate({
    readSecretValue,
    templateId: existingBinding?.externalTemplateId ?? sourceTemplateId,
  });
  const sourceDocuments = await downloadSourceDocuments(sourceTemplate.template);
  const created = await createDocuSignTemplate({
    readSecretValue,
    name: MUTUAL_NDA_TEMPLATE_NAME,
    description:
      "Programmatically managed Mutual NDA for Pushing Capital onboarding.",
    emailSubject: "Pushing Capital | Mutual NDA",
    emailBlurb:
      "Please review and sign the Mutual NDA to continue your onboarding with Pushing Capital LLC.",
    documents: sourceDocuments.documentInputs,
    recipients: buildProvisioningRecipients(sourceTemplate.template),
    shared: true,
    searchExistingByName: true,
  });
  const managedTemplate = await getDocuSignTemplate({
    readSecretValue,
    templateId: created.template.templateId,
  });
  const recipientContracts =
    buildRecipientContractsFromTemplateDetails(managedTemplate.template);
  const fieldContracts = buildFieldContractsFromTemplateDetails(
    managedTemplate.template,
  ).map((field) =>
    field.roleName?.toLowerCase() === "manager" &&
    field.tabLabel?.toLowerCase() === "manager business name"
      ? { ...field, id: "manager_business_name", defaultValue: MUTUAL_NDA_COMPANY_NAME }
      : field.roleName?.toLowerCase() === "manager" &&
          field.tabLabel?.toLowerCase() === "client business name"
        ? { ...field, id: "client_business_name" }
        : field.roleName?.toLowerCase() === "manager" &&
            field.tabLabel?.toLowerCase() === "effective date"
          ? { ...field, id: "effective_date" }
          : field,
  );
  const warnings = buildWarnings({
    sourceTemplateId,
    provisionedTemplateId: created.template.templateId,
    existingBindingTemplateId: existingBinding?.externalTemplateId ?? null,
  });

  const binding = await upsertDocumentTemplateBinding({
    templateId: MUTUAL_NDA_TEMPLATE_KEY,
    externalTemplateId: created.template.templateId,
    externalTemplateName: created.template.name,
    accountId: created.account.accountId,
    accountName: created.account.accountName,
    sourceDocumentPaths: sourceDocuments.sourcePaths,
    attachmentPaths: [],
    attachmentLabels: [],
    requiresNotary: false,
    notaryReady: false,
    recipientContracts:
      recipientContracts.length > 0 ? recipientContracts : MUTUAL_NDA_ROLE_CONTRACTS,
    fieldContracts,
    warnings,
  });

  return {
    binding,
    templateId: managedTemplate.template.templateId,
    templateName: managedTemplate.template.name,
    recipientContracts:
      recipientContracts.length > 0 ? recipientContracts : MUTUAL_NDA_ROLE_CONTRACTS,
    fieldContracts,
    customFieldNames: [...MUTUAL_NDA_CUSTOM_FIELD_NAMES],
    sourceDocumentPaths: sourceDocuments.sourcePaths,
    created: created.created,
    warnings,
  };
}
