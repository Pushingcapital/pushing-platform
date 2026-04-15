import "server-only";

export type FormDocumentSourceType =
  | "downloaded_pdf"
  | "generated_pdf"
  | "docusign_template"
  | "uploaded_scan";

export type FormProviderType = "internal" | "docusign" | "wet" | "notary";

export type FormSignatureMode = "wet" | "digital" | "notary" | "none";

export type FormFieldValueType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "date"
  | "number"
  | "currency"
  | "checkbox"
  | "select"
  | "signature"
  | "initial"
  | "json";

export type PcrmObjectType =
  | "contact"
  | "company"
  | "deal"
  | "ticket"
  | "task"
  | "service_request"
  | "custom_object";

export type PcrmWriteMode =
  | "replace"
  | "append"
  | "merge_json"
  | "create_association";

export type FormFieldSourceType =
  | "intake"
  | "existing_pcrm"
  | "ocr"
  | "manual"
  | "formula"
  | "provider";

export type FormOverflowMode = "reject" | "truncate" | "overflow_note";

export type FormGateStatus = "ready" | "needs-review" | "blocked";

export type FormPcrmPlacementContract = {
  objectType: PcrmObjectType;
  propertyKey: string;
  writeMode: PcrmWriteMode;
  isPrimaryTruth: boolean;
  associationLabel?: string | null;
  notes?: string | null;
};

export type FormFieldContract = {
  id: string;
  label: string;
  valueType: FormFieldValueType;
  sourceType: FormFieldSourceType;
  required: boolean;
  maxChars: number | null;
  minChars?: number | null;
  overflowMode: FormOverflowMode;
  overflowTargetProperty?: string | null;
  tabType?: string | null;
  pageNumber?: string | null;
  xPosition?: string | null;
  yPosition?: string | null;
  anchorString?: string | null;
  signatureMode: FormSignatureMode;
  placements: FormPcrmPlacementContract[];
  notes?: string | null;
};

export type FormSignatureRequirement = {
  id: string;
  roleKey: string;
  label: string;
  mode: Exclude<FormSignatureMode, "none">;
  required: boolean;
  routingOrder: number | null;
  pageNumber?: string | null;
  xPosition?: string | null;
  yPosition?: string | null;
  anchorString?: string | null;
  evidencePropertyKeys: string[];
  notes?: string | null;
};

export type FormPacketContract = {
  version: number;
  templateKey: string;
  templateName: string;
  serviceFamily: "finance" | "automotive" | "shared";
  provider: FormProviderType;
  documentSourceType: FormDocumentSourceType;
  sourceDocumentPaths: string[];
  sourceTemplateId?: string | null;
  requiresReview: boolean;
  requiresNotary: boolean;
  signatureRequirements: FormSignatureRequirement[];
  fields: FormFieldContract[];
};

export type FormFieldValidationResult = {
  fieldId: string;
  status: FormGateStatus;
  normalizedValue: string | null;
  originalLength: number;
  finalLength: number;
  truncated: boolean;
  reason: string | null;
};

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeFormFieldValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return trimNullable(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function validateFormFieldValue(
  contract: FormFieldContract,
  value: unknown,
): FormFieldValidationResult {
  const normalizedValue = normalizeFormFieldValue(value);
  const originalLength = normalizedValue?.length ?? 0;

  if (!normalizedValue) {
    return {
      fieldId: contract.id,
      status: contract.required ? "blocked" : "ready",
      normalizedValue: null,
      originalLength,
      finalLength: 0,
      truncated: false,
      reason: contract.required ? "Missing required value." : null,
    };
  }

  if (contract.minChars && originalLength < contract.minChars) {
    return {
      fieldId: contract.id,
      status: "blocked",
      normalizedValue,
      originalLength,
      finalLength: originalLength,
      truncated: false,
      reason: `Value is shorter than the minimum ${contract.minChars}-character threshold.`,
    };
  }

  if (!contract.maxChars || originalLength <= contract.maxChars) {
    return {
      fieldId: contract.id,
      status: "ready",
      normalizedValue,
      originalLength,
      finalLength: originalLength,
      truncated: false,
      reason: null,
    };
  }

  if (contract.overflowMode === "truncate") {
    const truncatedValue = normalizedValue.slice(0, contract.maxChars);
    return {
      fieldId: contract.id,
      status: "needs-review",
      normalizedValue: truncatedValue,
      originalLength,
      finalLength: truncatedValue.length,
      truncated: true,
      reason: `Value exceeded ${contract.maxChars} characters and was truncated.`,
    };
  }

  if (contract.overflowMode === "overflow_note") {
    return {
      fieldId: contract.id,
      status: "needs-review",
      normalizedValue,
      originalLength,
      finalLength: originalLength,
      truncated: false,
      reason:
        contract.overflowTargetProperty
          ? `Value exceeded ${contract.maxChars} characters and must spill into ${contract.overflowTargetProperty}.`
          : `Value exceeded ${contract.maxChars} characters and needs an overflow note.`,
    };
  }

  return {
    fieldId: contract.id,
    status: "blocked",
    normalizedValue,
    originalLength,
    finalLength: originalLength,
    truncated: false,
    reason: `Value exceeded the ${contract.maxChars}-character limit.`,
  };
}

export function buildPcrmPlacementIndex(contract: FormPacketContract) {
  const index = new Map<string, FormFieldContract[]>();

  for (const field of contract.fields) {
    for (const placement of field.placements) {
      const key = `${placement.objectType}.${placement.propertyKey}`;
      const bucket = index.get(key) ?? [];
      bucket.push(field);
      index.set(key, bucket);
    }
  }

  return index;
}

export const FORM_PACKET_CONTRACT_TEMPLATE: FormPacketContract = {
  version: 1,
  templateKey: "replace-me",
  templateName: "Replace Me",
  serviceFamily: "shared",
  provider: "internal",
  documentSourceType: "downloaded_pdf",
  sourceDocumentPaths: [],
  sourceTemplateId: null,
  requiresReview: true,
  requiresNotary: false,
  signatureRequirements: [
    {
      id: "client-signature",
      roleKey: "client",
      label: "Client signature",
      mode: "digital",
      required: true,
      routingOrder: 1,
      pageNumber: null,
      xPosition: null,
      yPosition: null,
      anchorString: null,
      evidencePropertyKeys: ["signature_status", "signed_at"],
      notes: "Change this to wet or notary when the packet requires it.",
    },
  ],
  fields: [
    {
      id: "client-full-name",
      label: "Client full legal name",
      valueType: "text",
      sourceType: "intake",
      required: true,
      maxChars: 120,
      minChars: 2,
      overflowMode: "reject",
      overflowTargetProperty: null,
      tabType: "text",
      pageNumber: "1",
      xPosition: null,
      yPosition: null,
      anchorString: null,
      signatureMode: "none",
      placements: [
        {
          objectType: "contact",
          propertyKey: "firstname_lastname_full",
          writeMode: "replace",
          isPrimaryTruth: true,
          associationLabel: null,
          notes: "Split into firstname / lastname downstream when appropriate.",
        },
      ],
      notes: "Every field should declare maxChars and at least one PCRM placement.",
    },
  ],
};
