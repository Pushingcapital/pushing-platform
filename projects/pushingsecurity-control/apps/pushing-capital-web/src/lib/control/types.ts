import type {
  DocuSignFieldContract,
  DocuSignRecipientContract,
} from "@/lib/docusign/contracts";

export type PlaybookStatus = "active" | "paused" | "draft";

export type PlaybookSurface =
  | "identity"
  | "workspace"
  | "browser"
  | "notary"
  | "security";

export type RunMode = "dry-run" | "live";

export type RunStatus = "queued" | "reviewing" | "ready";

export type OnboardingStage =
  | "identity-review"
  | "awaiting-signature"
  | "ready-for-workspace"
  | "workspace-provisioning"
  | "browser-setup"
  | "ready-for-notary"
  | "completed"
  | "needs-follow-up";

export type EncryptedSecretValue = {
  ciphertext: string;
  iv: string;
  tag: string;
};

export type VaultSecret = {
  id: string;
  provider: string;
  label: string;
  keyName: string;
  notes: string;
  scopes: string[];
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredSecretRecord = VaultSecret & EncryptedSecretValue;

export type AutomationPlaybook = {
  id: string;
  name: string;
  surface: PlaybookSurface;
  status: PlaybookStatus;
  description: string;
  providerRefs: string[];
  steps: string[];
  createdAt: string;
  updatedAt: string;
};

export type ManagedBookmark = {
  folder: string;
  title: string;
  url: string;
};

export type BrowserBundle = {
  id: string;
  name: string;
  description: string;
  homepageUrl: string;
  startupUrls: string[];
  extensionIds: string[];
  managedBookmarks: ManagedBookmark[];
  createdAt: string;
  updatedAt: string;
};

export type AutomationRun = {
  id: string;
  playbookId: string;
  playbookName: string;
  mode: RunMode;
  status: RunStatus;
  notes: string;
  requestedBy: string;
  requestedAt: string;
  onboardingJobId?: string;
  onboardingApplicant?: string;
};

export type OnboardingTimelineEntry = {
  id: string;
  label: string;
  detail: string;
  at: string;
};

export type OnboardingIntakeMetadata = {
  submittedAt: string;
  sourceLabel: string;
  pageUrl: string | null;
  pagePath: string | null;
  referrer: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  requestId: string | null;
  browserLanguage: string | null;
  browserTimeZone: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
};

export type OnboardingContactSyncStatus =
  | "disabled"
  | "created"
  | "updated"
  | "failed";

export type OnboardingContactSync = {
  provider: string;
  status: OnboardingContactSyncStatus;
  destinationLabel: string;
  detail: string;
  externalId: string | null;
  syncedAt: string;
};

export type OnboardingLaneClassification = {
  intakeAudience:
    | "employee"
    | "subcontractor"
    | "service-buyer"
    | "software-buyer";
  serviceFamily: "finance" | "automotive";
  requestedServiceSlug: string;
  routedServiceSlug: string;
  category: string;
  confidence: number;
  reason: string;
  recommendedLoginPath: string;
  recommendedWorkflowKey: string;
  notaryFallbackEnabled: boolean;
  dealPipelineId: string;
  dealStageId: string;
  ticketPipelineId: string | null;
  ticketStageId: string | null;
  classifiedAt: string;
};

export type OnboardingServiceRequestSyncStatus =
  | "disabled"
  | "created"
  | "updated"
  | "failed";

export type OnboardingServiceRequestSync = {
  provider: string;
  status: OnboardingServiceRequestSyncStatus;
  destinationLabel: string;
  detail: string;
  externalId: string | null;
  contactId: string | null;
  requestedServiceSlug: string;
  routedServiceSlug: string;
  dealPipelineId: string;
  dealStageId: string;
  ticketPipelineId: string | null;
  ticketStageId: string | null;
  syncedAt: string;
};

export type DriverLicenseParseResult = {
  provider: "google-vision";
  status: "parsed" | "needs-review" | "failed";
  fileName: string | null;
  mimeType: string | null;
  rawText: string;
  confidence: number | null;
  fields: {
    fullName: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    licenseNumber: string | null;
    dateOfBirth: string | null;
    issueDate: string | null;
    expirationDate: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
      state: string | null;
      postalCode: string | null;
  };
  documentSignals: {
    faceCount: number | null;
    faceDetectionStatus:
      | "detected"
      | "not-detected"
      | "multiple"
      | "not-available";
    reviewStatus: "ok" | "needs-review";
    warnings: string[];
  };
  warnings: string[];
  parsedAt: string;
};

export type DocuSignEnvelopeDispatchStatus = "sent" | "created" | "failed";

export type DocuSignEnvelopeDispatchReceipt = {
  provider: "docusign";
  status: DocuSignEnvelopeDispatchStatus;
  templateKey: string | null;
  templateId: string | null;
  templateName: string | null;
  envelopeId: string | null;
  envelopeStatus: string | null;
  recipientEmail: string | null;
  companySignerEmail: string | null;
  recipientRoles: DocuSignRecipientContract[];
  fieldContracts: DocuSignFieldContract[];
  customFieldNames: string[];
  dispatchedAt: string;
  warnings: string[];
  detail: string;
};

export type DocuSignCompletionReceipt = {
  provider: "docusign";
  verified: boolean;
  event: string | null;
  envelopeId: string | null;
  envelopeStatus: string | null;
  signerEmail: string | null;
  signerName: string | null;
  matchedBy: "job-id" | "email";
  receivedAt: string;
  completedAt: string | null;
};

export type WorkspaceProvisioningStatus =
  | "created"
  | "existing"
  | "failed";

export type WorkspaceProvisioningReceipt = {
  provider: "google-workspace";
  status: WorkspaceProvisioningStatus;
  primaryEmail: string | null;
  username: string | null;
  givenName: string | null;
  familyName: string | null;
  googleUserId: string | null;
  orgUnitPath: string | null;
  personalEmail: string | null;
  phone: string | null;
  changePasswordAtNextLogin: boolean;
  passwordRule: "lastname-birthyear-dollar";
  attemptedAt: string;
  warnings: string[];
  detail: string;
};

export type BrowserBootstrapStatus = "planned" | "applied" | "failed";

export type BrowserBootstrapReceipt = {
  provider: "chrome-enterprise";
  status: BrowserBootstrapStatus;
  bundleId: string | null;
  bundleName: string | null;
  homepageUrl: string | null;
  startupUrls: string[];
  extensionIds: string[];
  managedBookmarks: ManagedBookmark[];
  assignedPrimaryEmail: string | null;
  orgUnitPath: string | null;
  orgUnitId: string | null;
  preparedAt: string;
  warnings: string[];
  appliedPolicySchemas: string[];
  detail: string;
};

export type OnboardingJob = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  stage: OnboardingStage;
  requestedBundleId: string | null;
  operatorNotes: string;
  createdAt: string;
  updatedAt: string;
  intakeMetadata?: OnboardingIntakeMetadata;
  laneClassification?: OnboardingLaneClassification;
  contactSync?: OnboardingContactSync;
  serviceRequestSync?: OnboardingServiceRequestSync;
  licenseParse?: DriverLicenseParseResult;
  docuSignEnvelope?: DocuSignEnvelopeDispatchReceipt;
  docuSignCompletion?: DocuSignCompletionReceipt;
  workspaceProvisioning?: WorkspaceProvisioningReceipt;
  browserBootstrap?: BrowserBootstrapReceipt;
  timeline: OnboardingTimelineEntry[];
};

export type ControlSnapshot = {
  meta: {
    storageMode: string;
    storagePath: string;
    warnings: string[];
    encryptionReady: boolean;
    bootstrappedAuth: boolean;
  };
  secrets: VaultSecret[];
  playbooks: AutomationPlaybook[];
  browserBundles: BrowserBundle[];
  jobs: OnboardingJob[];
  runs: AutomationRun[];
};

export type OperatorSession = {
  subject: string;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
};
