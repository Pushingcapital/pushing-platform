import "server-only";

import { readSecretValue } from "@/lib/control/store";
import type {
  DocuSignEnvelopeDispatchReceipt,
  OnboardingJob,
} from "@/lib/control/types";
import {
  listSignerProfiles,
  type StoredSignerProfile,
} from "@/lib/document-template-bindings";
import {
  buildMutualNdaManagerTextTabs,
  MUTUAL_NDA_COMPANY_NAME,
  MUTUAL_NDA_CUSTOM_FIELD_NAMES,
  MUTUAL_NDA_FIELD_CONTRACTS,
  MUTUAL_NDA_ROLE_CONTRACTS,
  MUTUAL_NDA_TEMPLATE_KEY,
  MUTUAL_NDA_TEMPLATE_NAME,
} from "@/lib/docusign/contracts";
import { sendDocuSignTemplateEnvelope } from "@/lib/providers/docusign";
import { ensureProgrammaticMutualNdaTemplate } from "@/lib/onboarding/mutual-nda-template";

const DEFAULT_COMPANY_SIGNER_EMAIL = "amssi@pushingcap.com";

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

function normalizeNameToken(value: string | null | undefined) {
  return trimNullable(value);
}

function formatLegalFullName(job: OnboardingJob) {
  const fullName = normalizeNameToken(job.licenseParse?.fields.fullName);

  if (fullName) {
    return fullName;
  }

  const firstName = normalizeNameToken(job.licenseParse?.fields.firstName);
  const middleName = normalizeNameToken(job.licenseParse?.fields.middleName);
  const lastName = normalizeNameToken(job.licenseParse?.fields.lastName);
  const legalName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  if (legalName) {
    return legalName;
  }

  return `${job.firstName} ${job.lastName}`.trim();
}

function formatEffectiveDate(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;

  return `${month}/${day}/${year}`;
}

function selectConfiguredSigner(
  profiles: StoredSignerProfile[],
  email: string | null,
) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();

  return (
    profiles.find((profile) => profile.email.toLowerCase() === normalizedEmail) ??
    null
  );
}

async function resolveCompanySigner() {
  const signerProfiles = await listSignerProfiles();

  if (signerProfiles.length === 0) {
    throw new Error(
      "No signer profiles are available yet. Provision the signer directory before sending the Mutual NDA.",
    );
  }

  const configuredSigner =
    selectConfiguredSigner(
      signerProfiles,
      trimNullable(process.env.DOCUSIGN_MUTUAL_NDA_MANAGER_EMAIL),
    ) ??
    selectConfiguredSigner(
      signerProfiles,
      trimNullable(process.env.DOCUSIGN_DEFAULT_COMPANY_SIGNER_EMAIL),
    ) ??
    selectConfiguredSigner(signerProfiles, DEFAULT_COMPANY_SIGNER_EMAIL) ??
    signerProfiles.find((profile) =>
      profile.defaultRoles.some(
        (role) => role.trim().toLowerCase() === "company_representative",
      ),
    ) ??
    signerProfiles[0];

  if (!configuredSigner) {
    throw new Error("Unable to resolve the company signer for the Mutual NDA.");
  }

  return configuredSigner;
}

export function buildMutualNdaDispatchFailureReceipt(input: {
  job: OnboardingJob;
  detail: string;
  warnings?: string[];
  templateId?: string | null;
}) {
  return {
    provider: "docusign",
    status: "failed",
    templateKey: MUTUAL_NDA_TEMPLATE_KEY,
    templateId: trimNullable(input.templateId),
    templateName: MUTUAL_NDA_TEMPLATE_NAME,
    envelopeId: null,
    envelopeStatus: null,
    recipientEmail: input.job.email,
    companySignerEmail: null,
    recipientRoles: MUTUAL_NDA_ROLE_CONTRACTS,
    fieldContracts: MUTUAL_NDA_FIELD_CONTRACTS,
    customFieldNames: [...MUTUAL_NDA_CUSTOM_FIELD_NAMES],
    dispatchedAt: isoNow(),
    warnings: input.warnings ?? [],
    detail: input.detail,
  } satisfies DocuSignEnvelopeDispatchReceipt;
}

export async function sendMutualNdaEnvelopeForOnboardingJob({
  job,
}: {
  job: OnboardingJob;
}) {
  const [managedTemplate, companySigner] = await Promise.all([
    ensureProgrammaticMutualNdaTemplate(),
    resolveCompanySigner(),
  ]);
  const clientName = formatLegalFullName(job);
  const effectiveDate = formatEffectiveDate();
  const envelope = await sendDocuSignTemplateEnvelope({
    readSecretValue,
    templateId: managedTemplate.templateId,
    status: "sent",
    emailSubject: `Pushing Capital | Mutual NDA for ${clientName}`,
    emailBlurb:
      "Please review and sign the Mutual NDA to continue your onboarding with Pushing Capital LLC.",
    templateRoles: [
      {
        roleName: "Manager",
        name: companySigner.fullName,
        email: companySigner.email,
        routingOrder: 2,
        tabs: {
          textTabs: buildMutualNdaManagerTextTabs({
            clientName,
            effectiveDate,
            companyName: MUTUAL_NDA_COMPANY_NAME,
            fieldContracts: managedTemplate.fieldContracts,
          }),
        },
      },
      {
        roleName: "Client",
        name: clientName,
        email: job.email,
        routingOrder: 1,
      },
    ],
    customFields: [
      {
        name: "onboardingJobId",
        value: job.id,
        show: false,
      },
      {
        name: "jobId",
        value: job.id,
        show: false,
      },
      {
        name: "workflowKey",
        value: "pushing-capital-onboarding",
        show: false,
      },
      {
        name: "templateKey",
        value: "mutual-nda",
        show: false,
      },
      ...(job.contactSync?.externalId
        ? [
            {
              name: "platformContactId",
              value: job.contactSync.externalId,
              show: false,
            },
          ]
        : []),
      {
        name: "platformContactEmail",
        value: job.email,
        show: false,
      },
    ],
  });

  return {
    provider: "docusign",
    status:
      trimNullable(envelope.status)?.toLowerCase() === "sent" ? "sent" : "created",
    templateKey: MUTUAL_NDA_TEMPLATE_KEY,
    templateId: managedTemplate.templateId,
    templateName: managedTemplate.templateName,
    envelopeId: envelope.envelopeId,
    envelopeStatus: envelope.status,
    recipientEmail: job.email,
    companySignerEmail: companySigner.email,
    recipientRoles: managedTemplate.recipientContracts.map((role) =>
      role.roleName === "Manager"
        ? {
            ...role,
            defaultSignerEmail: companySigner.email,
            defaultSignerName: companySigner.fullName,
            defaultSignerTitle: companySigner.title,
          }
        : role,
    ),
    fieldContracts: managedTemplate.fieldContracts,
    customFieldNames: managedTemplate.customFieldNames,
    dispatchedAt: isoNow(),
    warnings: managedTemplate.warnings,
    detail:
      trimNullable(envelope.status)?.toLowerCase() === "sent"
        ? `Sent the Mutual NDA to ${job.email} from the programmatic DocuSign template ${managedTemplate.templateName}.`
        : `Created the Mutual NDA envelope for ${job.email}, but DocuSign returned status ${envelope.status ?? "unknown"}.`,
  } satisfies DocuSignEnvelopeDispatchReceipt;
}
