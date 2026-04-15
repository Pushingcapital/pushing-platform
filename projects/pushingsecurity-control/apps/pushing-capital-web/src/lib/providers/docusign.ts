import "server-only";

import {
  createDocuSignTemplate as createSharedDocuSignTemplate,
  getDocuSignStatus as getSharedDocuSignStatus,
  getDocuSignTemplateDocument as getSharedDocuSignTemplateDocument,
  getDocuSignTemplate as getSharedDocuSignTemplate,
  listDocuSignTemplates as listSharedDocuSignTemplates,
  sendDocuSignTemplateEnvelope as sendSharedDocuSignTemplateEnvelope,
  type CreateDocuSignTemplateInput,
  type CreateDocuSignTemplateResult,
  type DocuSignAuthModel,
  type DocuSignCreateTemplateDocumentInput,
  type DocuSignCreateTemplateRecipientInput,
  type DocuSignEnvelopeCustomFieldInput,
  type DocuSignEnvelopeTemplateRoleInput,
  type DocuSignStatus,
  type DocuSignTemplateDetails,
  type DocuSignTemplateField,
  type DocuSignTemplateRole,
  type DocuSignTemplateRoleSummary,
  type DocuSignTemplateSummary,
  type DocuSignTemplateDocument,
  type GetDocuSignTemplateDocumentInput,
  type GetDocuSignTemplateDocumentResult,
  type GetDocuSignTemplateResult,
  type ListDocuSignTemplatesResult,
  type SendDocuSignTemplateEnvelopeInput,
  type SendDocuSignTemplateEnvelopeResult,
} from "@pushingcap/integrations/docusign";

import type { ProviderSecretReader } from "@/lib/providers/config";

export type {
  CreateDocuSignTemplateInput,
  CreateDocuSignTemplateResult,
  DocuSignAuthModel,
  DocuSignCreateTemplateDocumentInput,
  DocuSignCreateTemplateRecipientInput,
  DocuSignEnvelopeCustomFieldInput,
  DocuSignEnvelopeTemplateRoleInput,
  DocuSignStatus,
  DocuSignTemplateDetails,
  DocuSignTemplateDocument,
  DocuSignTemplateField,
  DocuSignTemplateRole,
  DocuSignTemplateRoleSummary,
  DocuSignTemplateSummary,
  GetDocuSignTemplateDocumentInput,
  GetDocuSignTemplateDocumentResult,
  GetDocuSignTemplateResult,
  ListDocuSignTemplatesResult,
  SendDocuSignTemplateEnvelopeInput,
  SendDocuSignTemplateEnvelopeResult,
};

export async function getDocuSignStatus({
  readSecretValue,
}: {
  readSecretValue: ProviderSecretReader;
}) {
  return getSharedDocuSignStatus({
    readSecretValue,
    env: process.env,
  });
}

export async function listDocuSignTemplates({
  readSecretValue,
  count,
  searchText,
}: {
  readSecretValue: ProviderSecretReader;
  count?: number;
  searchText?: string | null;
}) {
  return listSharedDocuSignTemplates({
    readSecretValue,
    env: process.env,
    count,
    searchText,
  });
}

export async function getDocuSignTemplate({
  readSecretValue,
  templateId,
}: {
  readSecretValue: ProviderSecretReader;
  templateId: string;
}) {
  return getSharedDocuSignTemplate({
    readSecretValue,
    env: process.env,
    templateId,
  });
}

export async function getDocuSignTemplateDocument({
  readSecretValue,
  templateId,
  documentId,
  fileType,
}: Omit<GetDocuSignTemplateDocumentInput, "env"> & {
  readSecretValue: ProviderSecretReader;
}) {
  return getSharedDocuSignTemplateDocument({
    readSecretValue,
    env: process.env,
    templateId,
    documentId,
    fileType,
  });
}

export async function createDocuSignTemplate({
  readSecretValue,
  name,
  description,
  emailSubject,
  emailBlurb,
  documents,
  recipients,
  shared,
  searchExistingByName,
}: Omit<CreateDocuSignTemplateInput, "env"> & {
  readSecretValue: ProviderSecretReader;
}) {
  return createSharedDocuSignTemplate({
    readSecretValue,
    env: process.env,
    name,
    description,
    emailSubject,
    emailBlurb,
    documents,
    recipients,
    shared,
    searchExistingByName,
  });
}

export async function sendDocuSignTemplateEnvelope({
  readSecretValue,
  templateId,
  status,
  emailSubject,
  emailBlurb,
  templateRoles,
  customFields,
  mergeRolesOnDraft,
}: Omit<SendDocuSignTemplateEnvelopeInput, "env"> & {
  readSecretValue: ProviderSecretReader;
}) {
  return sendSharedDocuSignTemplateEnvelope({
    readSecretValue,
    env: process.env,
    templateId,
    status,
    emailSubject,
    emailBlurb,
    templateRoles,
    customFields,
    mergeRolesOnDraft,
  });
}
