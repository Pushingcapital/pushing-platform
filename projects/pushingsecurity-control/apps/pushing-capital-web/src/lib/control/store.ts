import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  decryptSecretValue,
  encryptSecretValue,
  fingerprintSecret,
  hasMasterKey,
} from "@/lib/control/crypto";
import { getCredentialWarnings, hasCredentialBootstrap } from "@/lib/control/session";
import type { SecretLookupInput } from "@/lib/providers/config";
import { getDocuSignStatus } from "@/lib/providers/docusign";
import { getGoogleWorkspaceStatus } from "@/lib/providers/google-workspace";
import type {
  AutomationPlaybook,
  AutomationRun,
  BrowserBundle,
  BrowserBootstrapReceipt,
  ControlSnapshot,
  DocuSignEnvelopeDispatchReceipt,
  DocuSignCompletionReceipt,
  DriverLicenseParseResult,
  ManagedBookmark,
  OnboardingContactSync,
  OnboardingIntakeMetadata,
  OnboardingJob,
  OnboardingLaneClassification,
  OnboardingServiceRequestSync,
  OnboardingStage,
  PlaybookStatus,
  PlaybookSurface,
  RunMode,
  StoredSecretRecord,
  WorkspaceProvisioningReceipt,
} from "@/lib/control/types";
import {
  getMongoConfigWarnings,
  getMongoDb,
  hasMongoConfig,
} from "@/lib/mongodb";

const LOCAL_STORE_DIRECTORY = path.join(process.cwd(), ".data");
const LOCAL_STORE_PATH = path.join(LOCAL_STORE_DIRECTORY, "control-store.json");
const PREFERRED_BROWSER_BUNDLE_ID = "pushing-capital-employee-onboarding";
const CLAUDE_CHROME_EXTENSION_ID = "fcoeoabgfenejglbffodgkkbkcdhcgfn";

const COLLECTIONS = {
  meta: "control_meta",
  secrets: "control_secrets",
  playbooks: "control_playbooks",
  browserBundles: "control_browser_bundles",
  jobs: "control_onboarding_jobs",
  runs: "control_runs",
} as const;

type ControlStoreFile = {
  version: number;
  secrets: StoredSecretRecord[];
  playbooks: AutomationPlaybook[];
  browserBundles: BrowserBundle[];
  jobs: OnboardingJob[];
  runs: AutomationRun[];
};

type ControlStoreMetaRecord = {
  _id: string;
  version: number;
  updatedAt: string;
  createdAt?: string;
};

type UpsertSecretInput = {
  provider: string;
  label: string;
  keyName: string;
  secretValue: string;
  notes: string;
  scopes: string[];
};

type UpsertPlaybookInput = {
  name: string;
  surface: PlaybookSurface;
  status: PlaybookStatus;
  description: string;
  providerRefs: string[];
  steps: string[];
};

type UpsertBrowserBundleInput = {
  name: string;
  description: string;
  homepageUrl: string;
  startupUrls: string[];
  extensionIds: string[];
  managedBookmarks: ManagedBookmark[];
};

type QueueRunInput = {
  playbookId: string;
  mode: RunMode;
  notes: string;
  requestedBy: string;
  onboardingJobId?: string;
  onboardingApplicant?: string;
};

type CreateOnboardingJobInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  intakeMetadata?: OnboardingIntakeMetadata;
  laneClassification?: OnboardingLaneClassification;
  contactSync?: OnboardingContactSync;
  serviceRequestSync?: OnboardingServiceRequestSync;
  licenseParse?: DriverLicenseParseResult;
};

type UpdateOnboardingJobStageInput = {
  jobId: string;
  stage: OnboardingStage;
  operatorNotes: string;
  requestedBy: string;
};

type FindOnboardingJobInput = {
  jobId?: string | null;
  email?: string | null;
};

type RecordDocuSignProvisioningInput = {
  jobId: string;
  requestedBy: string;
  completion: DocuSignCompletionReceipt;
  workspaceProvisioning: WorkspaceProvisioningReceipt;
};

type RecordDocuSignEnvelopeDispatchInput = {
  jobId: string;
  requestedBy: string;
  envelope: DocuSignEnvelopeDispatchReceipt;
};

type RecordOnboardingContactSyncInput = {
  jobId: string;
  requestedBy: string;
  contactSync: OnboardingContactSync;
};

type RecordOnboardingServiceRequestSyncInput = {
  jobId: string;
  requestedBy: string;
  serviceRequestSync: OnboardingServiceRequestSync;
};

function isoNow() {
  return new Date().toISOString();
}

function normalizeList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mergeSeededRecords<T extends { id: string }>(
  current: T[] | undefined,
  seeded: T[],
) {
  const merged = [...(current ?? [])];
  const seenIds = new Set(merged.map((record) => record.id));

  for (const record of seeded) {
    if (!seenIds.has(record.id)) {
      merged.push(record);
      seenIds.add(record.id);
    }
  }

  return merged;
}

function matchesStoredSecret(
  secret: StoredSecretRecord,
  input: SecretLookupInput,
) {
  return (
    secret.provider.toLowerCase() === input.provider.trim().toLowerCase() &&
    secret.keyName.toLowerCase() === input.keyName.trim().toLowerCase()
  );
}

function formatStageLabel(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatApplicantName(input: { firstName: string; lastName: string }) {
  return `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
}

function appendTimelineEntry(
  job: OnboardingJob,
  input: { label: string; detail: string; at?: string },
) {
  job.timeline.unshift({
    id: randomUUID(),
    label: input.label,
    detail: input.detail,
    at: input.at ?? isoNow(),
  });
}

function appendAutomationRun(
  store: ControlStoreFile,
  input: QueueRunInput,
) {
  const playbook = store.playbooks.find(
    (candidate) => candidate.id === input.playbookId,
  );

  if (!playbook) {
    throw new Error("That playbook could not be found.");
  }

  store.runs.unshift({
    id: randomUUID(),
    playbookId: playbook.id,
    playbookName: playbook.name,
    mode: input.mode,
    status: input.mode === "live" ? "reviewing" : "queued",
    notes: input.notes.trim(),
    requestedBy: input.requestedBy,
    requestedAt: isoNow(),
    onboardingJobId: input.onboardingJobId,
    onboardingApplicant: input.onboardingApplicant,
  });

  return playbook;
}

function getAutomationPlaybookIdForStage(stage: OnboardingStage) {
  switch (stage) {
    case "workspace-provisioning":
      return "workspace-provisioning";
    case "browser-setup":
      return "managed-browser-bootstrap";
    case "ready-for-notary":
      return "notary-handoff";
    default:
      return null;
  }
}

function getAutomationPlaybookIdForLaneClassification(
  laneClassification: OnboardingLaneClassification | undefined,
) {
  if (!laneClassification) {
    return null;
  }

  return laneClassification.serviceFamily === "finance"
    ? "finance-intake-routing"
    : "automotive-intake-routing";
}

function seedPlaybooks(now: string): AutomationPlaybook[] {
  return [
    {
      id: "identity-intake-review",
      name: "Identity Intake Review",
      surface: "identity",
      status: "active",
      description:
        "Receives intake submissions, reviews uploaded documents, and decides whether the applicant can move into provisioning.",
      providerRefs: ["docusign", "google-workspace"],
      steps: [
        "Validate the intake payload and required documents.",
        "Compare address evidence against the captured location evidence.",
        "Mark the case ready for workspace provisioning or return it for manual review.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "finance-intake-routing",
      name: "Finance Intake Routing",
      surface: "identity",
      status: "active",
      description:
        "Splits finance buyers into the correct login surface, lender-readiness workflow, and notary reserve path after identity intake lands.",
      providerRefs: ["hubspot", "docusign-notary"],
      steps: [
        "Confirm the finance intake audience and login surface.",
        "Route the case into lender-readiness and underwriting preparation.",
        "Keep DocuSign Notary available as a reserve escalation path.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "automotive-intake-routing",
      name: "Automotive Intake Routing",
      surface: "identity",
      status: "active",
      description:
        "Routes automotive buyers, employees, and subcontractors into the correct workflow lane, service-request shell, and security-managed lifecycle path.",
      providerRefs: ["hubspot", "docusign-notary"],
      steps: [
        "Confirm whether the case is employee, subcontractor, or buyer intake.",
        "Route the case into the correct automotive workflow spine.",
        "Keep the intake attached to the same security lifecycle record for later offboarding.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "workspace-provisioning",
      name: "Workspace Provisioning",
      surface: "workspace",
      status: "draft",
      description:
        "Creates the managed Google Workspace user, prepares the first-login state, and records the onboarding identifiers.",
      providerRefs: ["google-workspace", "google-admin-sdk"],
      steps: [
        "Create the Workspace user with a temporary password.",
        "Assign required org units and groups.",
        "Store the provisioning receipt and next-action checklist.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "managed-browser-bootstrap",
      name: "Managed Browser Bootstrap",
      surface: "browser",
      status: "active",
      description:
        "Applies the selected bookmark bundle, startup pages, and extension list to a managed Chrome profile.",
      providerRefs: ["chrome-enterprise", "tailscale"],
      steps: [
        "Resolve the assigned browser policy bundle.",
        "Generate the bootstrap script or enrollment handoff.",
        "Track first-launch completion and policy receipt.",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "notary-handoff",
      name: "Notary Handoff",
      surface: "notary",
      status: "draft",
      description:
        "Packages the verified applicant state and launches the DocuSign Notary handoff only after the earlier gates are complete.",
      providerRefs: ["docusign-notary"],
      steps: [
        "Confirm OTP and identity-review status.",
        "Create the DocuSign envelope and notary launch package.",
        "Record the envelope identifier and completion callback target.",
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedBrowserBundles(now: string): BrowserBundle[] {
  return [
    {
      id: PREFERRED_BROWSER_BUNDLE_ID,
      name: "Pushing Capital Employee Onboarding",
      description:
        "Managed Chrome baseline for newly provisioned Pushing Capital employees, including the first-login bookmark set and Claude in Chrome.",
      homepageUrl: "https://www.pushingcap.com",
      startupUrls: ["https://www.pushingcap.com"],
      extensionIds: [CLAUDE_CHROME_EXTENSION_ID],
      managedBookmarks: [
        {
          folder: "Credit",
          title: "Experian",
          url: "https://www.experian.com",
        },
        {
          folder: "Credit",
          title: "Equifax",
          url: "https://www.equifax.com",
        },
        {
          folder: "Credit",
          title: "TransUnion",
          url: "https://www.transunion.com",
        },
        {
          folder: "Finance",
          title: "QuickBooks",
          url: "https://www.quickbooks.com",
        },
        {
          folder: "Credit",
          title: "myFICO",
          url: "https://www.myfico.com",
        },
        {
          folder: "Credit",
          title: "Credit Karma",
          url: "https://www.creditkarma.com",
        },
        {
          folder: "Company",
          title: "Pushing Capital",
          url: "https://www.pushingcap.com",
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createSeedStore(): ControlStoreFile {
  const now = isoNow();

  return {
    version: 1,
    secrets: [],
    playbooks: seedPlaybooks(now),
    browserBundles: seedBrowserBundles(now),
    jobs: [],
    runs: [],
  };
}

async function ensureLocalStoreFile() {
  await mkdir(LOCAL_STORE_DIRECTORY, { recursive: true });

  try {
    const current = await readFile(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(current) as Partial<ControlStoreFile>;
    const seeded = createSeedStore();
    const normalized: ControlStoreFile = {
      version: parsed.version ?? seeded.version,
      secrets: parsed.secrets ?? seeded.secrets,
      playbooks: mergeSeededRecords(parsed.playbooks, seeded.playbooks),
      browserBundles: mergeSeededRecords(
        parsed.browserBundles,
        seeded.browserBundles,
      ),
      jobs: parsed.jobs ?? seeded.jobs,
      runs: parsed.runs ?? seeded.runs,
    };

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await writeFile(LOCAL_STORE_PATH, JSON.stringify(normalized, null, 2));
    }

    return normalized;
  } catch {
    const seeded = createSeedStore();
    await writeFile(LOCAL_STORE_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeLocalStoreFile(store: ControlStoreFile) {
  await mkdir(LOCAL_STORE_DIRECTORY, { recursive: true });
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2));
}

async function readMongoCollection<T>(collectionName: string) {
  const db = await getMongoDb();
  const documents = await db
    .collection<Record<string, unknown>>(collectionName)
    .find()
    .toArray();

  return documents.map((document) => {
    const record = Object.fromEntries(
      Object.entries(document).filter(([key]) => key !== "_id"),
    );

    return record as T;
  });
}

async function replaceMongoCollection<T extends { id: string }>(
  collectionName: string,
  documents: T[],
) {
  const db = await getMongoDb();
  const collection = db.collection<Record<string, unknown>>(collectionName);

  await collection.deleteMany({});

  if (documents.length > 0) {
    const payload: Array<Record<string, unknown>> = documents.map((document) => ({
      ...document,
    }));

    await collection.insertMany(payload);
  }
}

async function ensureMongoSeeded() {
  const db = await getMongoDb();
  const now = isoNow();
  const playbookCollection = db.collection<{ id?: string }>(COLLECTIONS.playbooks);
  const bundleCollection = db.collection<{ id?: string }>(
    COLLECTIONS.browserBundles,
  );
  const seededPlaybooks = seedPlaybooks(now);
  const seededBundles = seedBrowserBundles(now);
  const [existingPlaybookIds, existingBundleIds] = await Promise.all([
    playbookCollection.distinct("id"),
    bundleCollection.distinct("id"),
  ]);
  const playbookIdSet = new Set(existingPlaybookIds.filter(Boolean));
  const bundleIdSet = new Set(existingBundleIds.filter(Boolean));
  const missingPlaybooks = seededPlaybooks.filter(
    (playbook) => !playbookIdSet.has(playbook.id),
  );
  const missingBundles = seededBundles.filter(
    (bundle) => !bundleIdSet.has(bundle.id),
  );

  if (missingPlaybooks.length > 0) {
    await playbookCollection.insertMany(missingPlaybooks);
  }

  if (missingBundles.length > 0) {
    await bundleCollection.insertMany(missingBundles);
  }

  await db.collection<ControlStoreMetaRecord>(COLLECTIONS.meta).updateOne(
    { _id: "control-store" },
    {
      $set: {
        version: 1,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

async function readMongoStore(): Promise<ControlStoreFile> {
  await ensureMongoSeeded();

  const [secrets, playbooks, browserBundles, jobs, runs] = await Promise.all([
    readMongoCollection<StoredSecretRecord>(COLLECTIONS.secrets),
    readMongoCollection<AutomationPlaybook>(COLLECTIONS.playbooks),
    readMongoCollection<BrowserBundle>(COLLECTIONS.browserBundles),
    readMongoCollection<OnboardingJob>(COLLECTIONS.jobs),
    readMongoCollection<AutomationRun>(COLLECTIONS.runs),
  ]);

  return {
    version: 1,
    secrets,
    playbooks,
    browserBundles,
    jobs,
    runs,
  };
}

async function writeMongoStore(store: ControlStoreFile) {
  await Promise.all([
    replaceMongoCollection(COLLECTIONS.secrets, store.secrets),
    replaceMongoCollection(COLLECTIONS.playbooks, store.playbooks),
    replaceMongoCollection(COLLECTIONS.browserBundles, store.browserBundles),
    replaceMongoCollection(COLLECTIONS.jobs, store.jobs),
    replaceMongoCollection(COLLECTIONS.runs, store.runs),
  ]);
}

async function readStore() {
  if (hasMongoConfig()) {
    return readMongoStore();
  }

  return ensureLocalStoreFile();
}

async function writeStore(store: ControlStoreFile) {
  if (hasMongoConfig()) {
    await writeMongoStore(store);
    return;
  }

  await writeLocalStoreFile(store);
}

function readSecretValueFromStore(
  store: ControlStoreFile,
  input: SecretLookupInput,
) {
  const provider = input.provider.trim();
  const keyName = input.keyName.trim();

  if (!provider || !keyName) {
    return null;
  }

  const secret = store.secrets.find((candidate) =>
    matchesStoredSecret(candidate, {
      provider,
      keyName,
    }),
  );

  if (!secret) {
    return null;
  }

  return decryptSecretValue(secret);
}

function findOnboardingJobInStore(
  store: ControlStoreFile,
  input: FindOnboardingJobInput,
) {
  const jobId = trimNullable(input.jobId);
  const email = trimNullable(input.email)?.toLowerCase();

  if (jobId) {
    return store.jobs.find((candidate) => candidate.id === jobId) ?? null;
  }

  if (email) {
    return (
      store.jobs.find((candidate) => candidate.email.toLowerCase() === email) ?? null
    );
  }

  return null;
}

function getPreferredBrowserBundle(store: ControlStoreFile, job: OnboardingJob) {
  return (
    store.browserBundles.find((bundle) => bundle.id === job.requestedBundleId) ??
    store.browserBundles.find((bundle) => bundle.id === PREFERRED_BROWSER_BUNDLE_ID) ??
    store.browserBundles[0] ??
    null
  );
}

function buildBrowserBootstrapReceipt(input: {
  store: ControlStoreFile;
  job: OnboardingJob;
  primaryEmail: string | null;
  preparedAt: string;
}): BrowserBootstrapReceipt {
  const bundle = getPreferredBrowserBundle(input.store, input.job);

  if (!bundle) {
    return {
      provider: "chrome-enterprise",
      status: "failed",
      bundleId: null,
      bundleName: null,
      homepageUrl: null,
      startupUrls: [],
      extensionIds: [],
      managedBookmarks: [],
      assignedPrimaryEmail: input.primaryEmail,
      orgUnitPath: null,
      orgUnitId: null,
      preparedAt: input.preparedAt,
      warnings: [
        "No managed browser bundle is assigned yet, so Chrome policy staging is blocked.",
      ],
      appliedPolicySchemas: [],
      detail:
        "Workspace identity was created, but there is no managed browser bundle attached to this onboarding job yet.",
    } satisfies BrowserBootstrapReceipt;
  }

  return {
    provider: "chrome-enterprise",
    status: "planned",
    bundleId: bundle.id,
    bundleName: bundle.name,
    homepageUrl: bundle.homepageUrl,
    startupUrls: bundle.startupUrls,
    extensionIds: bundle.extensionIds,
    managedBookmarks: bundle.managedBookmarks,
    assignedPrimaryEmail: input.primaryEmail,
    orgUnitPath: null,
    orgUnitId: null,
    preparedAt: input.preparedAt,
    warnings: [],
    appliedPolicySchemas: [],
    detail: `Prepared the ${bundle.name} browser bundle for the employee's first managed Chrome sign-in.`,
  } satisfies BrowserBootstrapReceipt;
}

async function buildProviderWarnings(store: ControlStoreFile) {
  const lookupSecretValue = async (input: SecretLookupInput) =>
    readSecretValueFromStore(store, input);

  const [docuSignStatus, googleWorkspaceStatus] = await Promise.all([
    getDocuSignStatus({
      readSecretValue: lookupSecretValue,
    }),
    getGoogleWorkspaceStatus({
      readSecretValue: lookupSecretValue,
    }),
  ]);

  return [...docuSignStatus.warnings, ...googleWorkspaceStatus.warnings];
}

function toPublicSecretRecord(secret: StoredSecretRecord) {
  return {
    id: secret.id,
    provider: secret.provider,
    label: secret.label,
    keyName: secret.keyName,
    notes: secret.notes,
    scopes: secret.scopes,
    fingerprint: secret.fingerprint,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
  };
}

async function toSnapshot(store: ControlStoreFile): Promise<ControlSnapshot> {
  const providerWarnings = await buildProviderWarnings(store);

  return {
    meta: {
      storageMode: hasMongoConfig() ? "mongodb-bridge" : "local-encrypted-file",
      storagePath: hasMongoConfig()
        ? `mongodb:${process.env.MONGODB_DB_NAME}`
        : LOCAL_STORE_PATH,
      warnings: [
        ...getCredentialWarnings(),
        ...getMongoConfigWarnings(),
        ...(!hasMasterKey()
          ? [
              "Set PUSHINGSECURITY_MASTER_KEY before storing real provider secrets.",
            ]
          : []),
        ...(hasMongoConfig()
          ? [
              "MongoDB bridge is active. Keep the database role constrained to the control collections only.",
            ]
          : [
              "MongoDB is not configured yet, so the app is using a local encrypted JSON development store.",
            ]),
        ...providerWarnings,
      ],
      encryptionReady: hasMasterKey(),
      bootstrappedAuth: hasCredentialBootstrap(),
    },
    secrets: store.secrets.map(toPublicSecretRecord),
    playbooks: store.playbooks,
    browserBundles: store.browserBundles,
    jobs: [...store.jobs].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    ),
    runs: [...store.runs].sort((left, right) =>
      right.requestedAt.localeCompare(left.requestedAt),
    ),
  };
}

export async function getControlSnapshot() {
  const store = await readStore();
  return await toSnapshot(store);
}

export async function readSecretValue(input: SecretLookupInput) {
  const store = await readStore();
  return readSecretValueFromStore(store, input);
}

export async function findOnboardingJob(input: FindOnboardingJobInput) {
  const store = await readStore();
  return findOnboardingJobInStore(store, input);
}

export async function upsertSecret(input: UpsertSecretInput) {
  if (!input.provider || !input.label || !input.keyName || !input.secretValue) {
    throw new Error("Provider, label, key name, and secret value are required.");
  }

  const store = await readStore();
  const now = isoNow();
  const provider = input.provider.trim();
  const label = input.label.trim();
  const keyName = input.keyName.trim();
  const existing = store.secrets.find(
    (secret) =>
      secret.provider.toLowerCase() === provider.toLowerCase() &&
      secret.keyName.toLowerCase() === keyName.toLowerCase(),
  );
  const encryptedValue = encryptSecretValue(input.secretValue);

  if (existing) {
    existing.provider = provider;
    existing.label = label;
    existing.keyName = keyName;
    existing.notes = input.notes.trim();
    existing.scopes = normalizeList(input.scopes);
    existing.fingerprint = fingerprintSecret(input.secretValue);
    existing.ciphertext = encryptedValue.ciphertext;
    existing.iv = encryptedValue.iv;
    existing.tag = encryptedValue.tag;
    existing.updatedAt = now;
  } else {
    store.secrets.push({
      id: randomUUID(),
      provider,
      label,
      keyName,
      notes: input.notes.trim(),
      scopes: normalizeList(input.scopes),
      fingerprint: fingerprintSecret(input.secretValue),
      createdAt: now,
      updatedAt: now,
      ciphertext: encryptedValue.ciphertext,
      iv: encryptedValue.iv,
      tag: encryptedValue.tag,
    });
  }

  await writeStore(store);

  return await toSnapshot(store);
}

export async function upsertPlaybook(input: UpsertPlaybookInput) {
  if (!input.name || !input.description) {
    throw new Error("Playbook name and description are required.");
  }

  const store = await readStore();
  const now = isoNow();
  const name = input.name.trim();
  const existing = store.playbooks.find(
    (playbook) => playbook.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    existing.surface = input.surface;
    existing.status = input.status;
    existing.description = input.description.trim();
    existing.providerRefs = normalizeList(input.providerRefs);
    existing.steps = normalizeList(input.steps);
    existing.updatedAt = now;
  } else {
    store.playbooks.push({
      id: randomUUID(),
      name,
      surface: input.surface,
      status: input.status,
      description: input.description.trim(),
      providerRefs: normalizeList(input.providerRefs),
      steps: normalizeList(input.steps),
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeStore(store);

  return await toSnapshot(store);
}

export async function upsertBrowserBundle(input: UpsertBrowserBundleInput) {
  if (!input.name || !input.homepageUrl) {
    throw new Error("Bundle name and homepage URL are required.");
  }

  const store = await readStore();
  const now = isoNow();
  const name = input.name.trim();
  const existing = store.browserBundles.find(
    (bundle) => bundle.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    existing.description = input.description.trim();
    existing.homepageUrl = input.homepageUrl.trim();
    existing.startupUrls = normalizeList(input.startupUrls);
    existing.extensionIds = normalizeList(input.extensionIds);
    existing.managedBookmarks = input.managedBookmarks;
    existing.updatedAt = now;
  } else {
    store.browserBundles.push({
      id: randomUUID(),
      name,
      description: input.description.trim(),
      homepageUrl: input.homepageUrl.trim(),
      startupUrls: normalizeList(input.startupUrls),
      extensionIds: normalizeList(input.extensionIds),
      managedBookmarks: input.managedBookmarks,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeStore(store);

  return await toSnapshot(store);
}

export async function queueAutomationRun(input: QueueRunInput) {
  if (!input.playbookId) {
    throw new Error("Choose a playbook before queueing a run.");
  }

  const store = await readStore();
  appendAutomationRun(store, input);

  await writeStore(store);

  return await toSnapshot(store);
}

export async function createOnboardingJob(input: CreateOnboardingJobInput) {
  if (!input.firstName || !input.lastName || !input.phone || !input.email) {
    throw new Error("First name, last name, phone number, and email are required.");
  }

  const store = await readStore();
  const now = isoNow();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone.trim();
  const email = input.email.trim().toLowerCase();
  const applicantName = formatApplicantName({ firstName, lastName });
  const requestedBundleId =
    store.browserBundles.find((bundle) => bundle.id === PREFERRED_BROWSER_BUNDLE_ID)
      ?.id ??
    store.browserBundles[0]?.id ??
    null;

  const job: OnboardingJob = {
    id: randomUUID(),
    firstName,
    lastName,
    phone,
    email,
    stage: "identity-review",
    requestedBundleId,
    operatorNotes: "",
    createdAt: now,
    updatedAt: now,
    intakeMetadata: input.intakeMetadata,
    laneClassification: input.laneClassification,
    contactSync: input.contactSync,
    serviceRequestSync: input.serviceRequestSync,
    licenseParse: input.licenseParse,
    timeline: [],
  };

  appendTimelineEntry(job, {
    label: "Submission received",
    detail: input.intakeMetadata?.pageUrl
      ? `Public intake created for ${applicantName} from ${input.intakeMetadata.pageUrl}.`
      : `Public intake created for ${applicantName}.`,
    at: now,
  });

  if (input.contactSync) {
    const detailParts = [input.contactSync.detail];

    if (input.contactSync.externalId) {
      detailParts.push(`External ID: ${input.contactSync.externalId}`);
    }

    appendTimelineEntry(job, {
      label: `Contact sync ${input.contactSync.status}`,
      detail: detailParts.join(" "),
      at: input.contactSync.syncedAt,
    });
  }

  if (input.laneClassification) {
    appendTimelineEntry(job, {
      label: "Lane classified",
      detail: `Audience ${input.laneClassification.intakeAudience}, family ${input.laneClassification.serviceFamily}, routed to ${input.laneClassification.routedServiceSlug}, login ${input.laneClassification.recommendedLoginPath}, workflow ${input.laneClassification.recommendedWorkflowKey}.`,
      at: input.laneClassification.classifiedAt,
    });
  }

  if (input.licenseParse) {
    appendTimelineEntry(job, {
      label:
        input.licenseParse.status === "parsed"
          ? "Driver license parsed"
          : "Driver license needs review",
      detail: input.licenseParse.fields.licenseNumber
        ? `Vision extracted driver-license data. License number: ${input.licenseParse.fields.licenseNumber}.`
        : "Vision processed the submitted driver license, but some fields still need manual review.",
      at: input.licenseParse.parsedAt,
    });
  }

  const playbook = appendAutomationRun(store, {
    playbookId: "identity-intake-review",
    mode: "live",
    notes: `Auto-queued after public intake for ${applicantName}.`,
    requestedBy: "public-intake",
    onboardingJobId: job.id,
    onboardingApplicant: applicantName,
  });

  appendTimelineEntry(job, {
    label: `${playbook.name} queued`,
    detail: "The case is now in the operator review lane.",
  });

  const familyPlaybookId = getAutomationPlaybookIdForLaneClassification(
    input.laneClassification,
  );

  if (familyPlaybookId) {
    const familyPlaybook = appendAutomationRun(store, {
      playbookId: familyPlaybookId,
      mode: "live",
      notes: `Auto-queued after public intake routing for ${applicantName}.`,
      requestedBy: "public-intake",
      onboardingJobId: job.id,
      onboardingApplicant: applicantName,
    });

    appendTimelineEntry(job, {
      label: `${familyPlaybook.name} queued`,
      detail:
        input.laneClassification?.notaryFallbackEnabled === true
          ? "Family-specific routing automation launched with DocuSign Notary reserved as an escalation path."
          : "Family-specific routing automation launched for this intake.",
    });
  }

  store.jobs.unshift(job);

  await writeStore(store);

  return {
    job,
    snapshot: await toSnapshot(store),
  };
}

export async function recordDocuSignEnvelopeDispatch(
  input: RecordDocuSignEnvelopeDispatchInput,
) {
  if (!input.jobId) {
    throw new Error("Choose an onboarding job before recording a DocuSign send.");
  }

  const store = await readStore();
  const job = findOnboardingJobInStore(store, { jobId: input.jobId });

  if (!job) {
    throw new Error("That onboarding job could not be found.");
  }

  const previousStage = job.stage;
  const nextStage =
    input.envelope.status === "sent"
      ? "awaiting-signature"
      : input.envelope.status === "failed"
        ? "needs-follow-up"
        : previousStage;

  job.docuSignEnvelope = input.envelope;
  job.stage = nextStage;
  job.updatedAt = isoNow();

  appendTimelineEntry(job, {
    label:
      input.envelope.status === "sent"
        ? "Mutual NDA sent"
        : input.envelope.status === "created"
          ? "Mutual NDA draft created"
          : "Mutual NDA send failed",
    detail: input.envelope.detail,
    at: input.envelope.dispatchedAt,
  });

  if (nextStage !== previousStage) {
    appendTimelineEntry(job, {
      label: `Stage updated to ${formatStageLabel(nextStage)}`,
      detail:
        nextStage === "awaiting-signature"
          ? "The onboarding job is waiting for the applicant to sign the Mutual NDA in DocuSign."
          : "The onboarding job needs manual follow-up before DocuSign automation can continue.",
      at: job.updatedAt,
    });
  }

  await writeStore(store);

  return {
    job,
    snapshot: await toSnapshot(store),
  };
}

export async function recordOnboardingContactSync(
  input: RecordOnboardingContactSyncInput,
) {
  if (!input.jobId) {
    throw new Error("Choose an onboarding job before recording contact sync.");
  }

  const store = await readStore();
  const job = findOnboardingJobInStore(store, { jobId: input.jobId });

  if (!job) {
    throw new Error("That onboarding job could not be found.");
  }

  job.contactSync = input.contactSync;
  job.updatedAt = isoNow();

  const detailParts = [input.contactSync.detail];

  if (input.contactSync.externalId) {
    detailParts.push(`External ID: ${input.contactSync.externalId}`);
  }

  appendTimelineEntry(job, {
    label: `Contact sync ${input.contactSync.status}`,
    detail: detailParts.join(" "),
    at: input.contactSync.syncedAt,
  });

  await writeStore(store);

  return {
    job,
    snapshot: await toSnapshot(store),
  };
}

export async function recordOnboardingServiceRequestSync(
  input: RecordOnboardingServiceRequestSyncInput,
) {
  if (!input.jobId) {
    throw new Error(
      "Choose an onboarding job before recording service-request sync.",
    );
  }

  const store = await readStore();
  const job = findOnboardingJobInStore(store, { jobId: input.jobId });

  if (!job) {
    throw new Error("That onboarding job could not be found.");
  }

  job.serviceRequestSync = input.serviceRequestSync;
  job.updatedAt = isoNow();

  const detailParts = [input.serviceRequestSync.detail];

  if (input.serviceRequestSync.externalId) {
    detailParts.push(`External ID: ${input.serviceRequestSync.externalId}`);
  }

  appendTimelineEntry(job, {
    label: `Service request sync ${input.serviceRequestSync.status}`,
    detail: detailParts.join(" "),
    at: input.serviceRequestSync.syncedAt,
  });

  await writeStore(store);

  return {
    job,
    snapshot: await toSnapshot(store),
  };
}

export async function recordDocuSignProvisioning(input: RecordDocuSignProvisioningInput) {
  if (!input.jobId) {
    throw new Error("Choose an onboarding job before recording DocuSign automation.");
  }

  const store = await readStore();
  const job = findOnboardingJobInStore(store, { jobId: input.jobId });

  if (!job) {
    throw new Error("That onboarding job could not be found.");
  }

  const now = isoNow();
  const previousStage = job.stage;
  const applicantName = formatApplicantName(job);

  job.docuSignCompletion = input.completion;
  job.workspaceProvisioning = input.workspaceProvisioning;
  job.updatedAt = now;

  appendTimelineEntry(job, {
    label: "DocuSign signature received",
    detail: input.completion.signerEmail
      ? `DocuSign reported a signed document event for ${input.completion.signerEmail}.`
      : "DocuSign reported a signed document event for this onboarding case.",
    at: input.completion.receivedAt,
  });

  if (input.workspaceProvisioning.status === "failed") {
    job.stage = "needs-follow-up";
    job.browserBootstrap = undefined;

    appendTimelineEntry(job, {
      label: "Workspace provisioning failed",
      detail: input.workspaceProvisioning.detail,
      at: input.workspaceProvisioning.attemptedAt,
    });
  } else {
    const browserBootstrap = buildBrowserBootstrapReceipt({
      store,
      job,
      primaryEmail: input.workspaceProvisioning.primaryEmail,
      preparedAt: now,
    });

    job.browserBootstrap = browserBootstrap;
    job.stage = "browser-setup";

    appendTimelineEntry(job, {
      label:
        input.workspaceProvisioning.status === "existing"
          ? "Workspace account reused"
          : "Workspace account created",
      detail: input.workspaceProvisioning.detail,
      at: input.workspaceProvisioning.attemptedAt,
    });

    appendTimelineEntry(job, {
      label:
        browserBootstrap.status === "applied"
          ? "Managed browser bundle applied"
          : browserBootstrap.status === "planned"
            ? "Managed browser bundle prepared"
            : "Managed browser bundle blocked",
      detail: browserBootstrap.detail,
      at: browserBootstrap.preparedAt,
    });

    const autoPlaybookId =
      job.stage !== previousStage
        ? getAutomationPlaybookIdForStage(job.stage)
        : null;

    if (autoPlaybookId) {
      const playbook = appendAutomationRun(store, {
        playbookId: autoPlaybookId,
        mode: "live",
        notes: `Auto-queued from DocuSign signature completion for ${applicantName}.`,
        requestedBy: input.requestedBy,
        onboardingJobId: job.id,
        onboardingApplicant: applicantName,
      });

      appendTimelineEntry(job, {
        label: `${playbook.name} queued`,
        detail: `Automation launched after Workspace provisioning completed for ${applicantName}.`,
        at: now,
      });
    }
  }

  await writeStore(store);

  return {
    job,
    snapshot: await toSnapshot(store),
  };
}

export async function updateOnboardingJobStage(
  input: UpdateOnboardingJobStageInput,
) {
  if (!input.jobId) {
    throw new Error("Choose an onboarding job before updating the stage.");
  }

  const store = await readStore();
  const job = store.jobs.find((candidate) => candidate.id === input.jobId);

  if (!job) {
    throw new Error("That onboarding job could not be found.");
  }

  const previousStage = job.stage;
  job.stage = input.stage;
  job.operatorNotes = input.operatorNotes.trim();
  job.updatedAt = isoNow();

  appendTimelineEntry(job, {
    label: `Stage updated to ${formatStageLabel(input.stage)}`,
    detail:
      input.operatorNotes.trim() || "Operator moved the case forward in the workflow.",
    at: job.updatedAt,
  });

  const applicantName = formatApplicantName(job);
  const autoPlaybookId =
    input.stage !== previousStage
      ? getAutomationPlaybookIdForStage(input.stage)
      : null;

  if (autoPlaybookId) {
    const playbook = appendAutomationRun(store, {
      playbookId: autoPlaybookId,
      mode: "live",
      notes:
        input.operatorNotes.trim() ||
        `Auto-queued from onboarding stage ${formatStageLabel(input.stage)}.`,
      requestedBy: input.requestedBy,
      onboardingJobId: job.id,
      onboardingApplicant: applicantName,
    });

    appendTimelineEntry(job, {
      label: `${playbook.name} queued`,
      detail: `Automation launched after moving into ${formatStageLabel(
        input.stage,
      )}.`,
      at: job.updatedAt,
    });
  }

  await writeStore(store);

  return await toSnapshot(store);
}
