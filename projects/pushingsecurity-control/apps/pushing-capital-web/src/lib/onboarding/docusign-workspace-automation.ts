import "server-only";

import {
  findOnboardingJob,
  readSecretValue,
  recordDocuSignProvisioning,
} from "@/lib/control/store";
import type {
  DocuSignCompletionReceipt,
  OnboardingJob,
  WorkspaceProvisioningReceipt,
} from "@/lib/control/types";
import { listSignerProfiles } from "@/lib/document-template-bindings";
import {
  createGoogleWorkspaceUser,
  getGoogleWorkspaceStatus,
  getGoogleWorkspaceUser,
} from "@/lib/providers/google-workspace";

type NormalizedRecipient = {
  email: string | null;
  name: string | null;
  status: string | null;
  roleName: string | null;
};

type NormalizedDocuSignWebhook = {
  event: string | null;
  envelopeId: string | null;
  envelopeStatus: string | null;
  completedAt: string | null;
  jobId: string | null;
  recipients: NormalizedRecipient[];
};

export type HandleDocuSignWorkspaceWebhookResult =
  | {
      handled: false;
      reason: string;
      jobId: string | null;
      event: string | null;
      envelopeId: string | null;
    }
  | {
      handled: true;
      jobId: string;
      event: string | null;
      envelopeId: string | null;
      completion: DocuSignCompletionReceipt;
      workspaceProvisioning: WorkspaceProvisioningReceipt;
      jobStage: OnboardingJob["stage"];
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

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function toRecordArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => toRecord(item))
        .filter((item): item is Record<string, unknown> => Boolean(item))
    : [];
}

function getPath(root: unknown, path: string[]) {
  let current: unknown = root;

  for (const key of path) {
    const record = toRecord(current);

    if (!record || !(key in record)) {
      return null;
    }

    current = record[key];
  }

  return current;
}

function firstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = trimNullable(value);

      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
}

function normalizePhone(value: string | null | undefined) {
  const trimmed = trimNullable(value);

  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return trimmed;
}

function normalizeDirectoryToken(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toLowerCase();
}

function normalizePasswordLastName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
}

function parseBirthYear(value: string | null | undefined) {
  const normalized = trimNullable(value);

  if (!normalized) {
    return null;
  }

  const fourDigitYear = normalized.match(/\b(19\d{2}|20\d{2})\b/);

  if (fourDigitYear?.[1]) {
    return fourDigitYear[1];
  }

  const shortYear = normalized.match(/\b\d{1,2}[\/-]\d{1,2}[\/-](\d{2})\b/);

  if (!shortYear?.[1]) {
    return null;
  }

  const yearValue = Number(shortYear[1]);

  if (!Number.isFinite(yearValue)) {
    return null;
  }

  const currentTwoDigitYear = new Date().getFullYear() % 100;
  return `${yearValue > currentTwoDigitYear ? 1900 : 2000}${shortYear[1]}`;
}

function normalizeRecipient(record: Record<string, unknown>) {
  return {
    email: firstString([record.email]),
    name: firstString([record.name, record.userName]),
    status: firstString([record.status]),
    roleName: firstString([record.roleName]),
  } satisfies NormalizedRecipient;
}

function collectRecipients(payload: Record<string, unknown>) {
  const collections = [
    getPath(payload, ["recipients", "signers"]),
    getPath(payload, ["envelopeSummary", "recipients", "signers"]),
    getPath(payload, ["data", "envelopeSummary", "recipients", "signers"]),
    getPath(payload, ["envelopeStatus", "recipientStatuses"]),
    getPath(payload, ["data", "envelopeStatus", "recipientStatuses"]),
  ];

  return collections.flatMap((collection) =>
    toRecordArray(collection).map((recipient) => normalizeRecipient(recipient)),
  );
}

function extractCustomFieldMap(payload: Record<string, unknown>) {
  const fieldCollections = [
    getPath(payload, ["customFields", "textCustomFields"]),
    getPath(payload, ["envelopeSummary", "customFields", "textCustomFields"]),
    getPath(payload, ["data", "envelopeSummary", "customFields", "textCustomFields"]),
    getPath(payload, ["data", "customFields", "textCustomFields"]),
  ];
  const map = new Map<string, string>();

  for (const collection of fieldCollections) {
    for (const record of toRecordArray(collection)) {
      const name = firstString([record.name]);
      const value = firstString([record.value, record.textCustomFieldValue]);

      if (name && value) {
        map.set(name.trim().toLowerCase(), value);
      }
    }
  }

  const directCustomFields = toRecord(getPath(payload, ["customFields"]));

  if (directCustomFields) {
    for (const [key, value] of Object.entries(directCustomFields)) {
      const normalizedValue = firstString([value]);

      if (normalizedValue) {
        map.set(key.trim().toLowerCase(), normalizedValue);
      }
    }
  }

  return map;
}

function normalizeDocuSignWebhook(payload: unknown): NormalizedDocuSignWebhook {
  const record = toRecord(payload) ?? {};
  const customFields = extractCustomFieldMap(record);

  return {
    event: firstString([
      record.event,
      record.eventType,
      getPath(record, ["data", "event"]),
      getPath(record, ["data", "eventType"]),
    ]),
    envelopeId: firstString([
      record.envelopeId,
      getPath(record, ["envelopeStatus", "envelopeId"]),
      getPath(record, ["envelopeSummary", "envelopeId"]),
      getPath(record, ["data", "envelopeId"]),
      getPath(record, ["data", "envelopeSummary", "envelopeId"]),
    ]),
    envelopeStatus: firstString([
      record.status,
      getPath(record, ["envelopeStatus", "status"]),
      getPath(record, ["envelopeSummary", "status"]),
      getPath(record, ["data", "status"]),
      getPath(record, ["data", "envelopeStatus", "status"]),
      getPath(record, ["data", "envelopeSummary", "status"]),
    ]),
    completedAt: firstString([
      record.completedDateTime,
      record.completedAt,
      getPath(record, ["envelopeStatus", "completedDateTime"]),
      getPath(record, ["envelopeSummary", "completedDateTime"]),
      getPath(record, ["data", "envelopeSummary", "completedDateTime"]),
    ]),
    jobId:
      customFields.get("onboardingjobid") ??
      customFields.get("onboarding_job_id") ??
      customFields.get("jobid") ??
      customFields.get("job_id") ??
      null,
    recipients: collectRecipients(record),
  };
}

function isSignedStatus(value: string | null | undefined) {
  const normalized = trimNullable(value)?.toLowerCase();

  return Boolean(
    normalized &&
      (normalized.includes("complete") ||
        normalized.includes("signed") ||
        normalized === "finished"),
  );
}

function selectApplicantRecipient(
  recipients: NormalizedRecipient[],
  companySignerEmails: Set<string>,
) {
  const completedApplicant = recipients.find((recipient) => {
    const email = trimNullable(recipient.email)?.toLowerCase();

    return (
      email &&
      !companySignerEmails.has(email) &&
      isSignedStatus(recipient.status)
    );
  });

  if (completedApplicant) {
    return completedApplicant;
  }

  return (
    recipients.find((recipient) => {
      const email = trimNullable(recipient.email)?.toLowerCase();
      return email && !companySignerEmails.has(email);
    }) ?? null
  );
}

function buildFailedProvisioningReceipt(
  job: OnboardingJob,
  detail: string,
  warnings: string[] = [],
) {
  return {
    provider: "google-workspace",
    status: "failed",
    primaryEmail: null,
    username: null,
    givenName: job.licenseParse?.fields.firstName ?? null,
    familyName: job.licenseParse?.fields.lastName ?? null,
    googleUserId: null,
    orgUnitPath: null,
    personalEmail: job.email,
    phone: normalizePhone(job.phone),
    changePasswordAtNextLogin: true,
    passwordRule: "lastname-birthyear-dollar",
    attemptedAt: isoNow(),
    warnings,
    detail,
  } satisfies WorkspaceProvisioningReceipt;
}

async function provisionWorkspaceFromJob(job: OnboardingJob) {
  const legalFirstName = trimNullable(job.licenseParse?.fields.firstName);
  const legalLastName = trimNullable(job.licenseParse?.fields.lastName);
  const birthYear = parseBirthYear(job.licenseParse?.fields.dateOfBirth);

  if (!legalFirstName || !legalLastName) {
    return buildFailedProvisioningReceipt(
      job,
      "Workspace provisioning is blocked because the driver-license OCR result does not include a confident legal first and last name.",
      [
        "Review the uploaded driver license and confirm the legal first and last name before retrying provisioning.",
      ],
    );
  }

  if (!birthYear) {
    return buildFailedProvisioningReceipt(
      job,
      "Workspace provisioning is blocked because the driver-license OCR result does not include a usable birth year for the requested password rule.",
      [
        "Review the uploaded driver license and confirm the applicant date of birth before retrying provisioning.",
      ],
    );
  }

  const workspaceStatus = await getGoogleWorkspaceStatus({
    readSecretValue,
  });

  if (!workspaceStatus.ready) {
    return buildFailedProvisioningReceipt(
      job,
      "Google Workspace is not configured well enough to auto-provision this employee yet.",
      workspaceStatus.warnings,
    );
  }

  const normalizedFirstName = normalizeDirectoryToken(legalFirstName);
  const normalizedLastName = normalizeDirectoryToken(legalLastName);
  const lastInitial = normalizedLastName[0] ?? null;

  if (!normalizedFirstName || !lastInitial) {
    return buildFailedProvisioningReceipt(
      job,
      "Workspace provisioning is blocked because the legal name extracted from the driver license cannot be turned into a valid username.",
    );
  }

  const usernameCandidates = [
    `${normalizedFirstName}${lastInitial}`,
    `${normalizedFirstName}${lastInitial}${birthYear.slice(-2)}`,
  ];
  const checkedAddresses: string[] = [];
  let selectedUsername: string | null = null;
  let selectedPrimaryEmail: string | null = null;

  for (const usernameCandidate of usernameCandidates) {
    const primaryEmail = `${usernameCandidate}@${workspaceStatus.primaryDomain}`;
    checkedAddresses.push(primaryEmail);
    const existingUser = await getGoogleWorkspaceUser({
      readSecretValue,
      primaryEmail,
    });

    if (!existingUser.found) {
      selectedUsername = usernameCandidate;
      selectedPrimaryEmail = primaryEmail;
      break;
    }
  }

  if (!selectedUsername || !selectedPrimaryEmail) {
    return buildFailedProvisioningReceipt(
      job,
      "Workspace provisioning is blocked because both approved username patterns are already taken.",
      [
        `Checked usernames: ${checkedAddresses.join(", ")}.`,
      ],
    );
  }

  const passwordLastName = normalizePasswordLastName(legalLastName);

  if (!passwordLastName) {
    return buildFailedProvisioningReceipt(
      job,
      "Workspace provisioning is blocked because the legal last name cannot be turned into the requested password format.",
    );
  }

  const provisionedUser = await createGoogleWorkspaceUser({
    readSecretValue,
    primaryEmail: selectedPrimaryEmail,
    givenName: legalFirstName,
    familyName: legalLastName,
    password: `${passwordLastName}${birthYear}$`,
    recoveryEmail: job.email,
    phone: normalizePhone(job.phone),
    changePasswordAtNextLogin: true,
  });

  return {
    provider: "google-workspace",
    status: provisionedUser.created ? "created" : "existing",
    primaryEmail: provisionedUser.user.primaryEmail,
    username: trimNullable(provisionedUser.user.primaryEmail)?.split("@")[0] ?? null,
    givenName: provisionedUser.user.givenName,
    familyName: provisionedUser.user.familyName,
    googleUserId: provisionedUser.user.id,
    orgUnitPath:
      provisionedUser.user.orgUnitPath ?? provisionedUser.defaultOrgUnitPath,
    personalEmail: job.email,
    phone:
      provisionedUser.user.phones[0]?.value ?? normalizePhone(job.phone),
    changePasswordAtNextLogin: true,
    passwordRule: "lastname-birthyear-dollar",
    attemptedAt: isoNow(),
    warnings: [],
    detail: provisionedUser.created
      ? `Created ${selectedPrimaryEmail} in Google Workspace and set the requested temporary-password pattern with a forced reset on first login.`
      : `Google Workspace user ${selectedPrimaryEmail} already exists, so the automation reused it and staged the next steps.`,
  } satisfies WorkspaceProvisioningReceipt;
}

export async function handleDocuSignWorkspaceWebhook(input: {
  payload: unknown;
  verified: boolean;
}) : Promise<HandleDocuSignWorkspaceWebhookResult> {
  const normalized = normalizeDocuSignWebhook(input.payload);
  const companySignerEmails = new Set(
    (await listSignerProfiles()).map((profile) => profile.email.toLowerCase()),
  );
  const matchedBy = normalized.jobId ? "job-id" : "email";
  const matchedRecipient = selectApplicantRecipient(
    normalized.recipients,
    companySignerEmails,
  );
  const matchedEmail = trimNullable(matchedRecipient?.email)?.toLowerCase() ?? null;

  if (
    !isSignedStatus(normalized.envelopeStatus) &&
    !normalized.recipients.some((recipient) => isSignedStatus(recipient.status))
  ) {
    return {
      handled: false,
      reason: "The webhook did not describe a signed or completed DocuSign recipient event.",
      jobId: normalized.jobId,
      event: normalized.event,
      envelopeId: normalized.envelopeId,
    };
  }

  const job = await findOnboardingJob({
    jobId: normalized.jobId,
    email: matchedEmail,
  });

  if (!job) {
    return {
      handled: false,
      reason:
        normalized.jobId || matchedEmail
          ? "No onboarding job matched the DocuSign webhook."
          : "The webhook did not include a job ID or a non-company signer email that could be matched to onboarding.",
      jobId: normalized.jobId,
      event: normalized.event,
      envelopeId: normalized.envelopeId,
    };
  }

  if (
    normalized.envelopeId &&
    job.docuSignCompletion?.envelopeId === normalized.envelopeId &&
    (job.workspaceProvisioning?.status === "created" ||
      job.workspaceProvisioning?.status === "existing") &&
    job.docuSignCompletion &&
    job.workspaceProvisioning
  ) {
    return {
      handled: true,
      jobId: job.id,
      event: job.docuSignCompletion.event,
      envelopeId: job.docuSignCompletion.envelopeId,
      completion: job.docuSignCompletion,
      workspaceProvisioning: job.workspaceProvisioning,
      jobStage: job.stage,
    };
  }

  const completion: DocuSignCompletionReceipt = {
    provider: "docusign",
    verified: input.verified,
    event: normalized.event,
    envelopeId: normalized.envelopeId,
    envelopeStatus: normalized.envelopeStatus,
    signerEmail: matchedEmail,
    signerName: matchedRecipient?.name ?? null,
    matchedBy,
    receivedAt: isoNow(),
    completedAt: normalized.completedAt,
  };

  const workspaceProvisioning =
    job.workspaceProvisioning?.status === "created" ||
    job.workspaceProvisioning?.status === "existing"
      ? job.workspaceProvisioning
      : await provisionWorkspaceFromJob(job);
  const recorded = await recordDocuSignProvisioning({
    jobId: job.id,
    requestedBy: "docusign-webhook",
    completion,
    workspaceProvisioning,
  });

  return {
    handled: true,
    jobId: job.id,
    event: completion.event,
    envelopeId: completion.envelopeId,
    completion,
    workspaceProvisioning,
    jobStage: recorded.job.stage,
  };
}
