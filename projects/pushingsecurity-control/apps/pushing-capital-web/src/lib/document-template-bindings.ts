import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  DocuSignFieldContract,
  DocuSignRecipientContract,
} from "@/lib/docusign/contracts";

const STATE_DIRECTORY = path.join(process.cwd(), ".data");
const STATE_PATH = path.join(
  STATE_DIRECTORY,
  "document-template-provisioning.json",
);

export type StoredSignerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  title: string;
  companyName: string;
  defaultRoles: string[];
  platformContactId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredDocumentTemplateBinding = {
  id: string;
  templateId: string;
  provider: "docusign";
  externalTemplateId: string;
  externalTemplateName: string;
  accountId: string;
  accountName: string | null;
  sourceDocumentPaths: string[];
  attachmentPaths: string[];
  attachmentLabels: string[];
  requiresNotary: boolean;
  notaryReady: boolean;
  recipientContracts: DocuSignRecipientContract[];
  fieldContracts: DocuSignFieldContract[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
  lastProvisionedAt: string;
};

type DocumentTemplateProvisioningState = {
  version: number;
  signerProfiles: StoredSignerProfile[];
  bindings: StoredDocumentTemplateBinding[];
};

type UpsertSignerProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title: string;
  companyName?: string;
  defaultRoles?: string[];
  platformContactId?: string | null;
  notes?: string;
};

type UpsertDocumentTemplateBindingInput = {
  templateId: string;
  externalTemplateId: string;
  externalTemplateName: string;
  accountId: string;
  accountName?: string | null;
  sourceDocumentPaths: string[];
  attachmentPaths?: string[];
  attachmentLabels?: string[];
  requiresNotary: boolean;
  notaryReady: boolean;
  recipientContracts?: DocuSignRecipientContract[];
  fieldContracts?: DocuSignFieldContract[];
  warnings?: string[];
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

function normalizeList(values: Array<string | null | undefined>) {
  return values
    .map((value) => trimNullable(value))
    .filter((value): value is string => Boolean(value));
}

function normalizeRecipientContracts(
  contracts: DocuSignRecipientContract[] | undefined,
) {
  return Array.isArray(contracts)
    ? contracts.map((contract) => ({
        roleName: contract.roleName,
        recipientType: contract.recipientType,
        recipientId: trimNullable(contract.recipientId),
        routingOrder: contract.routingOrder ?? null,
        defaultSignerEmail: trimNullable(contract.defaultSignerEmail),
        defaultSignerName: trimNullable(contract.defaultSignerName),
        defaultSignerTitle: trimNullable(contract.defaultSignerTitle),
      }))
    : [];
}

function normalizeFieldContracts(contracts: DocuSignFieldContract[] | undefined) {
  return Array.isArray(contracts)
    ? contracts.map((contract) => ({
        id: contract.id,
        roleName: trimNullable(contract.roleName),
        recipientId: trimNullable(contract.recipientId),
        collection: trimNullable(contract.collection),
        tabType: contract.tabType,
        tabId: trimNullable(contract.tabId),
        tabLabel: trimNullable(contract.tabLabel),
        name: trimNullable(contract.name),
        required: contract.required === true,
        anchorString: trimNullable(contract.anchorString),
        documentId: trimNullable(contract.documentId),
        pageNumber: trimNullable(contract.pageNumber),
        xPosition: trimNullable(contract.xPosition),
        yPosition: trimNullable(contract.yPosition),
        defaultValue: trimNullable(contract.defaultValue),
        locked: contract.locked === true,
      }))
    : [];
}

function createSeedState(): DocumentTemplateProvisioningState {
  return {
    version: 1,
    signerProfiles: [],
    bindings: [],
  };
}

async function ensureStateFile() {
  await mkdir(STATE_DIRECTORY, { recursive: true });

  try {
    const current = await readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(
      current,
    ) as Partial<DocumentTemplateProvisioningState>;
    const seeded = createSeedState();
    const normalized: DocumentTemplateProvisioningState = {
      version: parsed.version ?? seeded.version,
      signerProfiles: parsed.signerProfiles ?? seeded.signerProfiles,
      bindings: (parsed.bindings ?? seeded.bindings).map((binding) => ({
        ...binding,
        recipientContracts: normalizeRecipientContracts(
          binding.recipientContracts,
        ),
        fieldContracts: normalizeFieldContracts(binding.fieldContracts),
      })),
    };

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await writeFile(STATE_PATH, JSON.stringify(normalized, null, 2));
    }

    return normalized;
  } catch {
    const seeded = createSeedState();
    await writeFile(STATE_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeState(state: DocumentTemplateProvisioningState) {
  await mkdir(STATE_DIRECTORY, { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

export async function listSignerProfiles() {
  const state = await ensureStateFile();
  return [...state.signerProfiles].sort((left, right) =>
    left.fullName.localeCompare(right.fullName),
  );
}

export async function upsertSignerProfile(input: UpsertSignerProfileInput) {
  if (!input.firstName || !input.lastName || !input.email || !input.title) {
    throw new Error(
      "First name, last name, email, and title are required for signer profiles.",
    );
  }

  const state = await ensureStateFile();
  const now = isoNow();
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const existing = state.signerProfiles.find(
    (candidate) => candidate.email.toLowerCase() === email,
  );

  if (existing) {
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.fullName = fullName;
    existing.phone = trimNullable(input.phone);
    existing.title = input.title.trim();
    existing.companyName = trimNullable(input.companyName) ?? "Pushing Capital LLC";
    existing.defaultRoles = normalizeList(input.defaultRoles ?? []);
    existing.platformContactId = trimNullable(input.platformContactId);
    existing.notes = input.notes?.trim() ?? "";
    existing.updatedAt = now;
  } else {
    state.signerProfiles.push({
      id: randomUUID(),
      firstName,
      lastName,
      fullName,
      email,
      phone: trimNullable(input.phone),
      title: input.title.trim(),
      companyName: trimNullable(input.companyName) ?? "Pushing Capital LLC",
      defaultRoles: normalizeList(input.defaultRoles ?? []),
      platformContactId: trimNullable(input.platformContactId),
      notes: input.notes?.trim() ?? "",
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeState(state);

  return (
    state.signerProfiles.find((candidate) => candidate.email === email) ?? null
  );
}

export async function listDocumentTemplateBindings() {
  const state = await ensureStateFile();
  return [...state.bindings].sort((left, right) =>
    left.externalTemplateName.localeCompare(right.externalTemplateName),
  );
}

export async function getDocumentTemplateBinding(templateId: string) {
  const normalizedTemplateId = trimNullable(templateId);

  if (!normalizedTemplateId) {
    return null;
  }

  const state = await ensureStateFile();
  return (
    state.bindings.find((binding) => binding.templateId === normalizedTemplateId) ??
    null
  );
}

export async function upsertDocumentTemplateBinding(
  input: UpsertDocumentTemplateBindingInput,
) {
  if (!input.templateId || !input.externalTemplateId || !input.externalTemplateName) {
    throw new Error(
      "Template ID, external template ID, and external template name are required.",
    );
  }

  const state = await ensureStateFile();
  const now = isoNow();
  const templateId = input.templateId.trim();
  const existing = state.bindings.find((binding) => binding.templateId === templateId);

  if (existing) {
    existing.externalTemplateId = input.externalTemplateId.trim();
    existing.externalTemplateName = input.externalTemplateName.trim();
    existing.accountId = input.accountId.trim();
    existing.accountName = trimNullable(input.accountName);
    existing.sourceDocumentPaths = normalizeList(input.sourceDocumentPaths);
    existing.attachmentPaths = normalizeList(input.attachmentPaths ?? []);
    existing.attachmentLabels = normalizeList(input.attachmentLabels ?? []);
    existing.requiresNotary = input.requiresNotary;
    existing.notaryReady = input.notaryReady;
    existing.recipientContracts = normalizeRecipientContracts(
      input.recipientContracts,
    );
    existing.fieldContracts = normalizeFieldContracts(input.fieldContracts);
    existing.warnings = normalizeList(input.warnings ?? []);
    existing.lastProvisionedAt = now;
    existing.updatedAt = now;
  } else {
    state.bindings.push({
      id: randomUUID(),
      templateId,
      provider: "docusign",
      externalTemplateId: input.externalTemplateId.trim(),
      externalTemplateName: input.externalTemplateName.trim(),
      accountId: input.accountId.trim(),
      accountName: trimNullable(input.accountName),
      sourceDocumentPaths: normalizeList(input.sourceDocumentPaths),
      attachmentPaths: normalizeList(input.attachmentPaths ?? []),
      attachmentLabels: normalizeList(input.attachmentLabels ?? []),
      requiresNotary: input.requiresNotary,
      notaryReady: input.notaryReady,
      recipientContracts: normalizeRecipientContracts(input.recipientContracts),
      fieldContracts: normalizeFieldContracts(input.fieldContracts),
      warnings: normalizeList(input.warnings ?? []),
      createdAt: now,
      updatedAt: now,
      lastProvisionedAt: now,
    });
  }

  await writeState(state);

  return (
    state.bindings.find((binding) => binding.templateId === templateId) ?? null
  );
}

export function getDocumentTemplateProvisioningStatePath() {
  return STATE_PATH;
}
