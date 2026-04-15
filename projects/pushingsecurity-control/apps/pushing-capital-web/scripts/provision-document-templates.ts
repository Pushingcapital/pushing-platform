import { execFile as execFileCallback, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  createDocuSignTemplate,
  getDocuSignTemplate,
  type CreateDocuSignTemplateInput,
  type DocuSignCreateTemplateRecipientInput,
  type DocuSignCreateTemplateDocumentInput,
} from "../../../packages/integrations/src/docusign.ts";
import {
  getDocumentTemplateProvisioningStatePath,
  upsertDocumentTemplateBinding,
  upsertSignerProfile,
} from "../src/lib/document-template-bindings.ts";
import {
  PUSHING_CAPITAL_DOCUMENT_TEMPLATES,
  type DocumentTemplate,
  type DocumentTemplateSignerRole,
} from "../src/lib/document-templates.ts";
import {
  buildFieldContractsFromTemplateDetails,
  buildRecipientContractsFromTemplateDetails,
  SIGNER_DIRECTORY,
  type DocuSignFieldContract,
  type DocuSignRecipientContract,
  type SignerDirectoryEntry,
  type SignerKey,
} from "../src/lib/docusign/contracts.ts";
import { upsertPushingCapitalPlatformContact } from "../src/lib/platform-contacts.ts";

const execFile = promisify(execFileCallback);
const LETTER_SIZE = "8.5in 11in";
const COMPANY_LEGAL_NAME = "Pushing Capital LLC";
const COMPANY_ENTITY_TYPE = "LLC";
const FCRA_SUMMARY_URL =
  "https://files.consumerfinance.gov/f/documents/bcfp_consumer-rights-summary_2018-09.pdf";

const OUTPUT_ROOT = path.join(process.cwd(), "output", "pdf", "document-templates");
const HTML_OUTPUT_DIRECTORY = path.join(OUTPUT_ROOT, "html");
const PDF_OUTPUT_DIRECTORY = path.join(OUTPUT_ROOT, "generated");
const SUPPORT_OUTPUT_DIRECTORY = path.join(OUTPUT_ROOT, "supporting");
const PREVIEW_OUTPUT_DIRECTORY = path.join(OUTPUT_ROOT, "previews");
const CHROME_BINARY =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

type SlotKind =
  | "text"
  | "checkbox"
  | "signHere"
  | "dateSigned"
  | "fullName"
  | "notarize"
  | "notarySeal";

type FieldSlot = {
  anchor: string;
  kind: SlotKind;
  roleName?: DocumentTemplateSignerRole | "company_representative";
  width?: number;
  height?: number;
  required?: boolean;
  value?: string;
  locked?: boolean;
};

type RecipientPlan = {
  roleName: DocumentTemplateSignerRole;
  recipientType: "signer" | "notary";
  routingOrder: number;
  defaultSignerKey?: SignerKey;
};

type ProvisioningPlan = {
  docusignName: string;
  emailSubject: string;
  emailBlurb: string;
  recipients: RecipientPlan[];
  lineSlots: Record<string, FieldSlot[] | FieldSlot[][]>;
  attachments: Array<"fcra-summary-of-rights" | "california-civil-code-1786-22">;
};

function text(
  anchor: string,
  roleName: DocumentTemplateSignerRole,
  options: Partial<Omit<FieldSlot, "anchor" | "kind" | "roleName">> = {},
): FieldSlot {
  return {
    anchor,
    kind: "text",
    roleName,
    width: options.width,
    height: options.height,
    required: options.required,
    value: options.value,
    locked: options.locked,
  };
}

function checkbox(
  anchor: string,
  roleName: DocumentTemplateSignerRole,
  options: Partial<Omit<FieldSlot, "anchor" | "kind" | "roleName">> = {},
): FieldSlot {
  return {
    anchor,
    kind: "checkbox",
    roleName,
    required: options.required,
    value: options.value,
    locked: options.locked,
  };
}

function signHere(
  anchor: string,
  roleName: DocumentTemplateSignerRole,
  options: Partial<Omit<FieldSlot, "anchor" | "kind" | "roleName">> = {},
): FieldSlot {
  return {
    anchor,
    kind: "signHere",
    roleName,
    required: options.required ?? true,
    locked: options.locked,
  };
}

function dateSigned(
  anchor: string,
  roleName: DocumentTemplateSignerRole,
  options: Partial<Omit<FieldSlot, "anchor" | "kind" | "roleName">> = {},
): FieldSlot {
  return {
    anchor,
    kind: "dateSigned",
    roleName,
    required: options.required,
    locked: options.locked,
  };
}

function fullName(
  anchor: string,
  roleName: DocumentTemplateSignerRole,
  options: Partial<Omit<FieldSlot, "anchor" | "kind" | "roleName">> = {},
): FieldSlot {
  return {
    anchor,
    kind: "fullName",
    roleName,
    width: options.width,
    required: options.required,
    locked: options.locked,
  };
}

function notarize(anchor: string): FieldSlot {
  return {
    anchor,
    kind: "notarize",
    roleName: "notary",
    required: true,
  };
}

function notarySeal(anchor: string): FieldSlot {
  return {
    anchor,
    kind: "notarySeal",
    roleName: "notary",
    required: true,
  };
}

const PROVISIONING_PLANS: Record<string, ProvisioningPlan> = {
  "pc-w2-employment-offer-compliance-acknowledgment": {
    docusignName:
      "Pushing Capital | W-2 Employment Offer, Duties, and Compliance Acknowledgment",
    emailSubject: "Pushing Capital | W-2 Employment Offer",
    emailBlurb:
      "Please review and sign the Pushing Capital employment offer packet.",
    recipients: [
      {
        roleName: "company_representative",
        recipientType: "signer",
        routingOrder: 1,
        defaultSignerKey: "ahmed",
      },
      {
        roleName: "employee",
        recipientType: "signer",
        routingOrder: 2,
      },
    ],
    lineSlots: {
      "DATE: __________________": [
        text("offer_date", "company_representative", { width: 180 }),
      ],
      "Employee Name: ______________________________": [
        fullName("employee_name_header", "employee", { width: 220 }),
      ],
      "Address: ____________________________________": [
        text("employee_address", "employee", { width: 240 }),
      ],
      "City/State/Zip: ______________________________": [
        text("employee_city_state_zip", "employee", { width: 220 }),
      ],
      "Dear __________________________:": [
        fullName("employee_greeting_name", "employee", { width: 190 }),
      ],
      'Pushing Capital, {{company_legal_name}} ("Company"), is pleased to offer you employment as a W-2 employee in the position of Data Security and Monitoring Specialist / __________________________, effective __________________, subject to the terms below.':
        [
          text("job_title_suffix", "company_representative", { width: 180 }),
          text("effective_date", "company_representative", { width: 140 }),
        ],
      "User/Client Name: __________________________": [
        text("client_name", "company_representative", { width: 200 }),
      ],
      "State of Residence: _________________________": [
        text("client_state_of_residence", "company_representative", {
          width: 200,
        }),
      ],
      "You will be paid at the rate of $________________ per [hour / year / month], less all lawful deductions, on the Company’s regular designated payday(s) and in compliance with applicable wage laws.":
        [
          text("compensation_amount", "company_representative", { width: 120 }),
        ],
      "Your employment shall be [AT-WILL / FOR A DEFINITE TERM ENDING __________________]. No oral statement changes this status. Any change must be in a written agreement signed by an authorized Company representative.":
        [
          text("employment_term_end_date", "company_representative", {
            width: 170,
          }),
        ],
      "By: _______________________________________": [
        signHere("company_sign_here", "company_representative"),
      ],
      "Name: _____________________________________": [
        fullName("company_name", "company_representative", { width: 220 }),
      ],
      "Title: ______________________________________": [
        text("company_title", "company_representative", {
          width: 220,
          value: SIGNER_DIRECTORY.ahmed.title,
        }),
      ],
      "Date: ______________________________________": [
        [dateSigned("company_date_signed", "company_representative")],
        [dateSigned("employee_date_signed", "employee")],
      ],
      "Signature: _________________________________": [
        signHere("employee_sign_here", "employee"),
      ],
      "Print Name: ________________________________": [
        fullName("employee_print_name", "employee", { width: 220 }),
      ],
    },
    attachments: [],
  },
  "pc-employee-confidentiality-data-security-agreement": {
    docusignName:
      "Pushing Capital | Employee Confidentiality, Nondisclosure, and Data Security Agreement",
    emailSubject: "Pushing Capital | Employee Confidentiality Agreement",
    emailBlurb:
      "Please review and sign the employee confidentiality and data security agreement.",
    recipients: [
      {
        roleName: "employee",
        recipientType: "signer",
        routingOrder: 1,
      },
      {
        roleName: "company_representative",
        recipientType: "signer",
        routingOrder: 2,
        defaultSignerKey: "ahmed",
      },
    ],
    lineSlots: {
      'This Agreement is entered as of __________________ by and between Pushing Capital, {{company_entity_type}} ("Company") and ______________________________ ("Employee").':
        [
          text("agreement_date", "company_representative", { width: 130 }),
          fullName("employee_name_intro", "employee", { width: 220 }),
        ],
      "Signature: __________________________________": [
        signHere("employee_sign_here", "employee"),
      ],
      "Print Name: _________________________________": [
        fullName("employee_print_name", "employee", { width: 220 }),
      ],
      "Date: ______________________________________": [
        [dateSigned("employee_date_signed", "employee")],
        [dateSigned("company_date_signed", "company_representative")],
      ],
      "By: ________________________________________": [
        signHere("company_sign_here", "company_representative"),
      ],
      "Name/Title: _________________________________": [
        text("company_name_title", "company_representative", {
          width: 250,
          value: `Ahmed Ismaeil / ${SIGNER_DIRECTORY.ahmed.title}`,
        }),
      ],
    },
    attachments: [],
  },
  "pc-background-check-disclosure-authorization": {
    docusignName:
      "Pushing Capital | Stand-Alone Background Check Disclosure and Authorization",
    emailSubject: "Pushing Capital | Background Check Disclosure",
    emailBlurb:
      "Please review the disclosure, attachments, and authorization, then complete the requested acknowledgments.",
    recipients: [
      {
        roleName: "employee",
        recipientType: "signer",
        routingOrder: 1,
      },
    ],
    lineSlots: {
      "[  ] I request to receive a copy of any report obtained about me.": [
        checkbox("background_copy_request", "employee"),
      ],
      "[  ] A Summary of Your Rights Under the Fair Credit Reporting Act": [
        checkbox("background_ack_fcra", "employee", { required: true }),
      ],
      "[  ] A Summary of Rights Under California Civil Code §1786.22": [
        checkbox("background_ack_california", "employee", { required: true }),
      ],
      "Signature: __________________________________": [
        signHere("employee_sign_here", "employee"),
      ],
      "Print Name: _________________________________": [
        fullName("employee_print_name", "employee", { width: 220 }),
      ],
      "Date: ______________________________________": [
        dateSigned("employee_date_signed", "employee"),
      ],
    },
    attachments: [
      "fcra-summary-of-rights",
      "california-civil-code-1786-22",
    ],
  },
  "pc-california-consumer-credit-report-addendum": {
    docusignName: "Pushing Capital | California Consumer Credit Report Addendum",
    emailSubject: "Pushing Capital | California Credit Addendum",
    emailBlurb:
      "Please review the California consumer credit report addendum and complete the acknowledgment.",
    recipients: [
      {
        roleName: "employee",
        recipientType: "signer",
        routingOrder: 1,
      },
    ],
    lineSlots: {
      "[  ] I request a copy of any consumer credit report obtained about me.": [
        checkbox("credit_report_copy_request", "employee"),
      ],
      "Signature: __________________________________": [
        signHere("employee_sign_here", "employee"),
      ],
      "Print Name: _________________________________": [
        fullName("employee_print_name", "employee", { width: 220 }),
      ],
      "Date: ______________________________________": [
        dateSigned("employee_date_signed", "employee"),
      ],
    },
    attachments: [],
  },
  "pc-user-client-authorization-written-instructions-esign-consent": {
    docusignName:
      "Pushing Capital | User/Client Authorization, Written Instructions, and E-Sign Consent",
    emailSubject: "Pushing Capital | User Authorization and E-Sign Consent",
    emailBlurb:
      "Please review, complete, and sign the user authorization and e-sign consent packet.",
    recipients: [
      {
        roleName: "user",
        recipientType: "signer",
        routingOrder: 1,
      },
      {
        roleName: "company_representative",
        recipientType: "signer",
        routingOrder: 2,
        defaultSignerKey: "ahmed",
      },
      {
        roleName: "notary",
        recipientType: "notary",
        routingOrder: 3,
      },
    ],
    lineSlots: {
      'I, ______________________________________ ("User"), residing at': [
        fullName("user_name", "user", { width: 220 }),
      ],
      "_____________________________________________________________,": [
        text("user_address", "user", { width: 320 }),
      ],
      "I instruct any consumer reporting agency or other lawful source to furnish my consumer report and/or credit-related information to Company for the Authorized Purpose, to the extent permitted by law, no more than ______ times per calendar month, unless additional access is reasonably necessary to:":
        [text("monthly_credit_access_limit", "company_representative", { width: 90 })],
      "This authorization begins on __________________ and remains in effect until:":
        [text("authorization_start_date", "company_representative", { width: 140 })],
      "[  ] revoked in writing by me;": [
        checkbox("authorization_revoked_option", "user"),
      ],
      "[  ] ____________________________;": [
        checkbox("authorization_end_option", "user"),
        text("authorization_end_date", "company_representative", { width: 170 }),
      ],
      "Signature: __________________________________": [
        signHere("user_sign_here", "user"),
      ],
      "Print Name: _________________________________": [
        fullName("user_print_name", "user", { width: 220 }),
      ],
      "Date: ______________________________________": [
        [dateSigned("user_date_signed", "user")],
        [dateSigned("company_date_signed", "company_representative")],
      ],
      "By: ________________________________________": [
        signHere("company_sign_here", "company_representative"),
      ],
      "Name/Title: _________________________________": [
        text("company_name_title", "company_representative", {
          width: 260,
          value: `Ahmed Ismaeil / ${SIGNER_DIRECTORY.ahmed.title}`,
        }),
      ],
    },
    attachments: [],
  },
  "pc-limited-motor-vehicle-poa-dmv-record-authorization": {
    docusignName:
      "Pushing Capital | Limited Motor Vehicle Power of Attorney and DMV Record Authorization",
    emailSubject: "Pushing Capital | Limited Motor Vehicle POA",
    emailBlurb:
      "Please review, complete, and sign the limited DMV power of attorney and authorization packet.",
    recipients: [
      {
        roleName: "principal",
        recipientType: "signer",
        routingOrder: 1,
      },
      {
        roleName: "attorney_in_fact",
        recipientType: "signer",
        routingOrder: 2,
        defaultSignerKey: "ahmed",
      },
      {
        roleName: "notary",
        recipientType: "notary",
        routingOrder: 3,
      },
    ],
    lineSlots: {
      'I, ______________________________________ ("Principal"),': [
        fullName("principal_name", "principal", { width: 220 }),
      ],
      "residing at _______________________________________________,": [
        text("principal_address", "principal", { width: 320 }),
      ],
      "Name/Title: _______________________________________________": [
        text("designated_officer_name_title", "attorney_in_fact", {
          width: 280,
          value: `Ahmed Ismaeil / ${SIGNER_DIRECTORY.ahmed.title}`,
        }),
      ],
      "State(s): _________________________________________________": [
        text("state_list", "principal", { width: 260 }),
      ],
      "Year: __________": [text("vehicle_year", "principal", { width: 80 })],
      "Make: _________________________________________________": [
        text("vehicle_make", "principal", { width: 220 }),
      ],
      "Model: ________________________________________________": [
        text("vehicle_model", "principal", { width: 220 }),
      ],
      "VIN: _________________________________________________": [
        text("vehicle_vin", "principal", { width: 220 }),
      ],
      "Plate No.: _____________________________________________": [
        text("vehicle_plate_number", "principal", { width: 220 }),
      ],
      "Title No. (if known): _____________________________________": [
        text("vehicle_title_number", "principal", { width: 220 }),
      ],
      "Authorized Transaction(s): _________________________________": [
        text("authorized_transactions_line_one", "principal", { width: 260 }),
      ],
      "_______________________________________________________": [
        text("authorized_transactions_line_two", "principal", { width: 400 }),
      ],
      "This power of attorney becomes effective on __________________ and remains effective until:":
        [text("poa_start_date", "company_representative", { width: 140 })],
      "[  ] completion of the authorized transaction(s);": [
        checkbox("poa_end_completion", "principal"),
      ],
      "[  ] revoked by me in writing;": [
        checkbox("poa_end_revoked", "principal"),
      ],
      "[  ] ____________________________.": [
        checkbox("poa_end_other", "principal"),
        text("poa_end_date", "company_representative", { width: 180 }),
      ],
      "Signature: __________________________________": [
        signHere("principal_sign_here", "principal"),
      ],
      "Print Name: _________________________________": [
        fullName("principal_print_name", "principal", { width: 220 }),
      ],
      "Date: ______________________________________": [
        [dateSigned("principal_date_signed", "principal")],
        [dateSigned("company_date_signed", "attorney_in_fact")],
      ],
      "By: ________________________________________": [
        signHere("company_sign_here", "attorney_in_fact"),
      ],
      "Name/Title: _________________________________": [
        text("company_name_title", "attorney_in_fact", {
          width: 260,
          value: `Ahmed Ismaeil / ${SIGNER_DIRECTORY.ahmed.title}`,
        }),
      ],
      "[Insert the state-required notarial acknowledgment/jurat here.]": [
        notarize("notary_action"),
        notarySeal("notary_seal"),
      ],
    },
    attachments: [],
  },
  "pc-1099-contractor-agreement": {
    docusignName: "Pushing Capital | 1099 Independent Contractor Agreement",
    emailSubject: "Pushing Capital | Independent Contractor Agreement",
    emailBlurb:
      "Please review and sign the Independent Contractor Agreement.",
    recipients: [
      {
        roleName: "contractor",
        recipientType: "signer",
        routingOrder: 1,
      },
      {
        roleName: "company_representative",
        recipientType: "signer",
        routingOrder: 2,
        defaultSignerKey: "ahmed",
      },
    ],
    lineSlots: {
      'This Independent Contractor Agreement ("Agreement") is made effective as of __________________ by and between Pushing Capital, {{company_entity_type}} ("Company"), and ______________________________':
        [
          text("agreement_date", "company_representative", { width: 130 }),
          fullName("contractor_name_intro", "contractor", { width: 220 }),
        ],
      '("Contractor"), located at ________________________________________________.': [
        text("contractor_address", "contractor", { width: 340 }),
      ],
      "______________________________________________________________________.": [
        text("services_description", "company_representative", { width: 400 }),
      ],
      "In consideration for the Services, Company will pay Contractor at the rate of $__________________. Contractor shall be responsible for all expenses incurred while performing the Services unless otherwise agreed in writing.": [
        text("compensation_rate", "company_representative", { width: 140 }),
      ],
      "Signature: __________________________________": [
        signHere("contractor_sign_here", "contractor"),
      ],
      "Print Name: _________________________________": [
        fullName("contractor_print_name", "contractor", { width: 220 }),
      ],
      "Date: ______________________________________": [
        [dateSigned("contractor_date_signed", "contractor")],
        [dateSigned("company_date_signed", "company_representative")],
      ],
      "By: ________________________________________": [
        signHere("company_sign_here", "company_representative"),
      ],
      "Name/Title: _________________________________": [
        text("company_name_title", "company_representative", {
          width: 250,
          value: `Ahmed Ismaeil / ${SIGNER_DIRECTORY.ahmed.title}`,
        }),
      ],
    },
    attachments: [],
  },
  "pc-direct-deposit-authorization": {
    docusignName: "Pushing Capital | Direct Deposit Authorization",
    emailSubject: "Pushing Capital | Direct Deposit Authorization",
    emailBlurb:
      "Please complete the Direct Deposit Authorization form.",
    recipients: [
      {
        roleName: "employee",
        recipientType: "signer",
        routingOrder: 1,
      },
    ],
    lineSlots: {
      "Payee Name: ______________________________": [
        fullName("payee_name", "employee", { width: 220 }),
      ],
      "Bank Name: ______________________________": [
        text("bank_name", "employee", { width: 220 }),
      ],
      "Routing Number: _________________________": [
        text("routing_number", "employee", { width: 200 }),
      ],
      "Account Number: _________________________": [
        text("account_number", "employee", { width: 200 }),
      ],
      "Account Type: [  ] Checking   [  ] Savings": [
        checkbox("checking_account", "employee"),
        checkbox("savings_account", "employee"),
      ],
      "Signature: __________________________________": [
        signHere("payee_sign_here", "employee"),
      ],
      "Print Name: _________________________________": [
        fullName("payee_print_name", "employee", { width: 220 }),
      ],
      "Date: ______________________________________": [
        dateSigned("payee_date_signed", "employee"),
      ],
    },
    attachments: [],
  },
};

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function anchorToken(templateId: string, anchor: string) {
  return `/pc-${slugify(templateId)}-${slugify(anchor)}/`;
}

async function loadEnvFile(filePath: string) {
  try {
    const contents = await fs.readFile(filePath, "utf8");

    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#") || !line.includes("=")) {
        continue;
      }

      const equalsIndex = line.indexOf("=");
      const key = line.slice(0, equalsIndex).trim();
      const rawValue = line.slice(equalsIndex + 1);

      if (!key || process.env[key] !== undefined) {
        continue;
      }

      let value = rawValue.trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value.replace(/\\n/g, "\n");
    }
  } catch {
    // This script is intentionally happy to continue if a local env file is absent.
  }
}

async function loadLocalEnvironment() {
  await loadEnvFile(path.join(process.cwd(), ".env.local"));
  await loadEnvFile(path.join(process.cwd(), ".env"));
}

async function ensureDirectories() {
  await fs.mkdir(HTML_OUTPUT_DIRECTORY, { recursive: true });
  await fs.mkdir(PDF_OUTPUT_DIRECTORY, { recursive: true });
  await fs.mkdir(SUPPORT_OUTPUT_DIRECTORY, { recursive: true });
  await fs.mkdir(PREVIEW_OUTPUT_DIRECTORY, { recursive: true });
}

async function readLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public", "brand", "p-glass-mark.png");
  const logoBytes = await fs.readFile(logoPath);
  return `data:image/png;base64,${logoBytes.toString("base64")}`;
}

function applyTemplateTextSubstitutions(value: string) {
  return value
    .replace(
      'Pushing Capital, {{company_legal_name}} ("Company")',
      'Pushing Capital LLC ("Company")',
    )
    .replaceAll("{{company_legal_name}}", COMPANY_LEGAL_NAME)
    .replaceAll("{{company_entity_type}}", COMPANY_ENTITY_TYPE);
}

function renderFieldSlot(
  templateId: string,
  match: string,
  slot: FieldSlot,
) {
  const width =
    slot.width ??
    (slot.kind === "checkbox" ? 14 : Math.max(120, Math.min(360, match.length * 7)));
  const height = slot.height ?? (slot.kind === "checkbox" ? 14 : 18);
  const token = anchorToken(templateId, slot.anchor);

  if (slot.kind === "checkbox") {
    return `<span class="checkbox-slot"><span class="ds-anchor">${escapeHtml(token)}</span></span>`;
  }

  return `<span class="field-slot" style="width:${width}px;height:${height}px"><span class="ds-anchor">${escapeHtml(
    token,
  )}</span></span>`;
}

function getLineClass(line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    return "spacer";
  }

  if (trimmed === "TO:" || trimmed === "COMPANY:" || trimmed === "EMPLOYEE:") {
    return "section-label";
  }

  if (
    trimmed === "USER:" ||
    trimmed === "COMPANY ACKNOWLEDGMENT:" ||
    trimmed === "PRINCIPAL:" ||
    trimmed === "ACCEPTED BY ATTORNEY-IN-FACT:" ||
    trimmed === "AUTHORIZATION" ||
    trimmed === "NOTARY:"
  ) {
    return "section-label";
  }

  if (
    trimmed.startsWith("RE:") ||
    trimmed === "CONFIDENTIALITY, NONDISCLOSURE, AND DATA SECURITY AGREEMENT" ||
    trimmed === "DISCLOSURE REGARDING BACKGROUND INVESTIGATION" ||
    trimmed === "(Standalone Disclosure and Authorization)" ||
    trimmed === "NOTICE REGARDING PROCUREMENT OF CONSUMER CREDIT REPORT" ||
    trimmed === "FOR EMPLOYMENT PURPOSES (CALIFORNIA)" ||
    trimmed === "LIMITED MOTOR VEHICLE POWER OF ATTORNEY" ||
    trimmed === "AND DMV RECORD AUTHORIZATION"
  ) {
    return "title-line";
  }

  if (trimmed.startsWith("•")) {
    return "bullet-line";
  }

  if (/^\d+\./.test(trimmed) || /^\([a-z]\)/.test(trimmed)) {
    return "body-line compact";
  }

  return "body-line";
}

function renderNotaryBlock(templateId: string) {
  return `
    <div class="notary-panel">
      <div class="notary-panel-title">Remote notary section</div>
      <div class="notary-row">Notarial action <span class="field-slot" style="width:190px;height:18px"><span class="ds-anchor">${escapeHtml(
        anchorToken(templateId, "notary_action"),
      )}</span></span></div>
      <div class="notary-row">Notary seal <span class="field-slot" style="width:170px;height:18px"><span class="ds-anchor">${escapeHtml(
        anchorToken(templateId, "notary_seal"),
      )}</span></span></div>
      <div class="notary-caption">To be completed during the DocuSign Notary session and any state-specific acknowledgment or jurat required for the transaction.</div>
    </div>
  `;
}

function resolveLineSlots(
  plan: ProvisioningPlan,
  line: string,
  occurrence: number,
) {
  const configured = plan.lineSlots[line];

  if (!configured) {
    return [];
  }

  if (configured.length === 0) {
    return [];
  }

  if (Array.isArray(configured[0])) {
    const grouped = configured as FieldSlot[][];
    return grouped[Math.min(occurrence, grouped.length - 1)] ?? [];
  }

  return configured as FieldSlot[];
}

function renderLine(
  template: DocumentTemplate,
  plan: ProvisioningPlan,
  line: string,
  occurrence: number,
) {
  if (line.trim() === "[PUSHING CAPITAL LETTERHEAD]") {
    return "";
  }

  if (line.trim() === "[Insert the state-required notarial acknowledgment/jurat here.]") {
    return renderNotaryBlock(template.id);
  }

  const lineSlots = resolveLineSlots(plan, line, occurrence);
  const matches = [...line.matchAll(/_{3,}|\[\s\s\]/g)];

  if (matches.length > 0 && lineSlots.length === 0) {
    return `<p class="${getLineClass(line)}">${escapeHtml(
      applyTemplateTextSubstitutions(line),
    )}</p>`;
  }

  if (lineSlots.length > 0 && matches.length !== lineSlots.length) {
    throw new Error(
      `Template ${template.id} expected ${lineSlots.length} slot(s) for line "${line}" but found ${matches.length}.`,
    );
  }

  if (matches.length === 0) {
    return `<p class="${getLineClass(line)}">${escapeHtml(
      applyTemplateTextSubstitutions(line),
    )}</p>`;
  }

  let cursor = 0;
  const renderedSegments: string[] = [];

  for (const [index, match] of matches.entries()) {
    const rawMatch = match[0];

    if (match.index === undefined) {
      continue;
    }

    const before = line.slice(cursor, match.index);
    renderedSegments.push(escapeHtml(applyTemplateTextSubstitutions(before)));
    renderedSegments.push(renderFieldSlot(template.id, rawMatch, lineSlots[index]!));
    cursor = match.index + rawMatch.length;
  }

  renderedSegments.push(
    escapeHtml(applyTemplateTextSubstitutions(line.slice(cursor))),
  );

  return `<p class="${getLineClass(line)}">${renderedSegments.join("")}</p>`;
}

function renderTemplateHtml(template: DocumentTemplate, logoDataUri: string) {
  const plan = PROVISIONING_PLANS[template.id];

  if (!plan) {
    throw new Error(`No provisioning plan found for template ${template.id}.`);
  }

  const lineOccurrences = new Map<string, number>();
  const renderedBody = template.body
    .split("\n")
    .map((line) => {
      const occurrence = lineOccurrences.get(line) ?? 0;
      lineOccurrences.set(line, occurrence + 1);
      return renderLine(template, plan, line, occurrence);
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(template.title)}</title>
    <style>
      @page {
        size: ${LETTER_SIZE};
        margin: 0.72in 0.78in 0.78in 0.78in;
      }

      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #0f172a;
        font-size: 10.6pt;
        line-height: 1.35;
      }

      .sheet {
        width: 100%;
      }

      .letterhead {
        border-bottom: 2px solid #0f172a;
        margin-bottom: 18px;
        padding-bottom: 12px;
      }

      .letterhead-mark {
        width: 58px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 12px;
      }

      .letterhead-copy {
        display: inline-block;
        vertical-align: middle;
      }

      .letterhead-name {
        font-size: 17pt;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .letterhead-subtitle {
        color: #475569;
        font-size: 8.8pt;
        margin-top: 3px;
      }

      .title-line {
        font-size: 11.6pt;
        font-weight: 700;
        margin: 0 0 6px 0;
      }

      .section-label {
        font-size: 10.8pt;
        font-weight: 700;
        margin: 11px 0 5px 0;
      }

      .body-line {
        margin: 0 0 5px 0;
      }

      .body-line.compact {
        margin-bottom: 4px;
      }

      .bullet-line {
        margin: 0 0 4px 14px;
        text-indent: -10px;
      }

      .spacer {
        height: 7px;
      }

      .field-slot {
        display: inline-block;
        vertical-align: baseline;
        border-bottom: 1px solid #0f172a;
        min-height: 14px;
        margin: 0 2px 1px 4px;
        position: relative;
      }

      .checkbox-slot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1px solid #0f172a;
        margin-right: 6px;
        vertical-align: text-top;
        position: relative;
      }

      .ds-anchor {
        position: absolute;
        left: 0;
        top: 0;
        color: #ffffff;
        font-size: 1pt;
        line-height: 1pt;
      }

      .notary-panel {
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        padding: 12px;
        margin: 4px 0 10px 0;
      }

      .notary-panel-title {
        font-weight: 700;
        margin-bottom: 8px;
      }

      .notary-row {
        margin-bottom: 6px;
      }

      .notary-caption {
        color: #475569;
        font-size: 8.8pt;
      }

      .footer {
        margin-top: 18px;
        color: #64748b;
        font-size: 8.3pt;
        border-top: 1px solid #cbd5e1;
        padding-top: 8px;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="letterhead">
        <img class="letterhead-mark" src="${logoDataUri}" alt="Pushing Capital logo" />
        <div class="letterhead-copy">
          <div class="letterhead-name">Pushing Capital LLC</div>
          <div class="letterhead-subtitle">Reusable onboarding and compliance template generated for DocuSign provisioning.</div>
        </div>
      </div>
      ${renderedBody}
      <div class="footer">Internal template key: ${escapeHtml(
        template.id,
      )}. Generated ${escapeHtml(new Date().toISOString())}.</div>
    </div>
  </body>
</html>`;
}

async function convertHtmlToPdf(htmlPath: string, outputDirectory: string) {
  const outputPath = path.join(
    outputDirectory,
    `${path.basename(htmlPath, path.extname(htmlPath))}.pdf`,
  );
  const userDataDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "pc-doc-template-print-"),
  );

  try {
    const chrome = spawn(
      CHROME_BINARY,
      [
      "--headless=new",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--allow-file-access-from-files",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=3000",
      `--user-data-dir=${userDataDirectory}`,
      "--print-to-pdf-no-header",
      `--print-to-pdf=${outputPath}`,
      pathToFileURL(htmlPath).href,
      ],
      {
        stdio: "ignore",
      },
    );
    const waitForChromeExit = async () => {
      if (chrome.exitCode !== null || chrome.signalCode !== null) {
        return;
      }

      await new Promise<void>((resolve) => {
        chrome.once("exit", () => resolve());
      });
    };

    const startedAt = Date.now();

    while (Date.now() - startedAt < 15000) {
      try {
        const stat = await fs.stat(outputPath);

        if (stat.size > 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          chrome.kill("SIGTERM");
          await waitForChromeExit();
          break;
        }
      } catch {
        // Keep polling until Chrome writes the PDF file.
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    try {
      await fs.stat(outputPath);
    } catch {
      chrome.kill("SIGKILL");
      await waitForChromeExit();
      throw new Error(`Chrome did not write ${outputPath} within the expected time.`);
    }
  } finally {
    await fs.rm(userDataDirectory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 250,
    });
  }

  return outputPath;
}

async function renderPdfPreview(pdfPath: string, previewDirectory: string) {
  const previewPrefix = path.join(
    previewDirectory,
    path.basename(pdfPath, ".pdf"),
  );

  await execFile("pdftoppm", ["-png", "-f", "1", "-singlefile", pdfPath, previewPrefix]);
  return `${previewPrefix}.png`;
}

async function renderCompanyTemplatePdf(
  template: DocumentTemplate,
  logoDataUri: string,
) {
  const htmlPath = path.join(
    HTML_OUTPUT_DIRECTORY,
    `${slugify(template.id)}.html`,
  );
  const html = renderTemplateHtml(template, logoDataUri);
  await fs.writeFile(htmlPath, html, "utf8");
  const pdfPath = await convertHtmlToPdf(htmlPath, PDF_OUTPUT_DIRECTORY);
  await renderPdfPreview(pdfPath, PREVIEW_OUTPUT_DIRECTORY);
  return { htmlPath, pdfPath };
}

async function downloadOfficialFcraSummaryPdf() {
  const outputPath = path.join(
    SUPPORT_OUTPUT_DIRECTORY,
    "fcra-summary-of-rights.pdf",
  );
  const response = await fetch(FCRA_SUMMARY_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Unable to download the official FCRA summary PDF. Status ${response.status}.`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, bytes);
  return outputPath;
}

function renderCaliforniaCivilCodeHtml(logoDataUri: string) {
  const statuteLines = [
    "(a) An investigative consumer reporting agency shall supply files and information required under Section 1786.10 during normal business hours and on reasonable notice.",
    "(b) Files maintained on a consumer shall be made available for the consumer's visual inspection, as follows:",
    "(1) In person, if the consumer appears in person and furnishes proper identification. A copy of the file shall also be available for a fee not to exceed the actual costs of duplication services provided.",
    "(2) By certified mail, if the consumer makes a written request, with proper identification, for copies to be sent to a specified addressee.",
    "(3) By telephone summary, if the consumer makes a written request, with proper identification for telephone disclosure, and prepays or is directly charged any toll charges.",
    "(c) Proper identification means information generally deemed sufficient to identify a person, including documents such as a valid driver's license, social security account number, military identification card, or credit cards. Additional employment, personal, or family history may only be required if the consumer cannot reasonably identify himself or herself with the standard information above.",
    "(d) The investigative consumer reporting agency shall provide trained personnel to explain to the consumer any information furnished under Section 1786.10.",
    "(e) The investigative consumer reporting agency shall provide a written explanation of any coded information contained in files maintained on a consumer whenever a file is provided for visual inspection.",
    "(f) The consumer may be accompanied by one other person of the consumer's choosing, who must furnish reasonable identification. The agency may require a written statement granting permission to discuss the file in that person's presence.",
  ];

  const body = statuteLines
    .map((line) => `<p class="body-line">${escapeHtml(line)}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>California Civil Code Section 1786.22</title>
    <style>
      @page {
        size: ${LETTER_SIZE};
        margin: 0.72in 0.78in 0.78in 0.78in;
      }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #0f172a;
        font-size: 10.8pt;
        line-height: 1.45;
      }
      .letterhead {
        border-bottom: 2px solid #0f172a;
        margin-bottom: 18px;
        padding-bottom: 12px;
      }
      .letterhead-mark {
        width: 58px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 12px;
      }
      .letterhead-copy {
        display: inline-block;
        vertical-align: middle;
      }
      .letterhead-name {
        font-size: 17pt;
        font-weight: 700;
      }
      .letterhead-subtitle {
        color: #475569;
        font-size: 8.8pt;
        margin-top: 3px;
      }
      .title-line {
        font-size: 13pt;
        font-weight: 700;
        margin: 0 0 6px 0;
      }
      .caption {
        color: #475569;
        margin: 0 0 14px 0;
      }
      .body-line {
        margin: 0 0 7px 0;
      }
      .footer {
        margin-top: 18px;
        color: #64748b;
        font-size: 8.3pt;
        border-top: 1px solid #cbd5e1;
        padding-top: 8px;
      }
    </style>
  </head>
  <body>
    <div class="letterhead">
      <img class="letterhead-mark" src="${logoDataUri}" alt="Pushing Capital logo" />
      <div class="letterhead-copy">
        <div class="letterhead-name">Pushing Capital LLC</div>
        <div class="letterhead-subtitle">Supporting rights notice included with the background check disclosure packet.</div>
      </div>
    </div>
    <div class="title-line">California Civil Code Section 1786.22</div>
    <p class="caption">Official statutory text reproduced from the California Legislative Information site for packet attachment use.</p>
    ${body}
    <div class="footer">Source: California Civil Code Section 1786.22. Generated ${escapeHtml(
      new Date().toISOString(),
    )} for onboarding packet assembly.</div>
  </body>
</html>`;
}

async function renderCaliforniaCivilCodePdf(logoDataUri: string) {
  const htmlPath = path.join(
    HTML_OUTPUT_DIRECTORY,
    "california-civil-code-1786-22.html",
  );
  const pdfPath = path.join(
    SUPPORT_OUTPUT_DIRECTORY,
    "california-civil-code-1786-22.pdf",
  );

  await fs.writeFile(htmlPath, renderCaliforniaCivilCodeHtml(logoDataUri), "utf8");
  await convertHtmlToPdf(htmlPath, SUPPORT_OUTPUT_DIRECTORY);
  await renderPdfPreview(pdfPath, PREVIEW_OUTPUT_DIRECTORY);
  return pdfPath;
}

async function syncSignerProfiles() {
  const synced: Record<SignerKey, { entry: SignerDirectoryEntry; contactId: string }> =
    {} as Record<SignerKey, { entry: SignerDirectoryEntry; contactId: string }>;

  for (const [signerKey, entry] of Object.entries(SIGNER_DIRECTORY) as Array<
    [SignerKey, SignerDirectoryEntry]
  >) {
    const contact = await upsertPushingCapitalPlatformContact({
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      phone: entry.phone,
      title: entry.title,
      company: COMPANY_LEGAL_NAME,
      role: "signer-profile",
      metadata: {
        signerProfile: true,
        defaultRoles: entry.defaultRoles,
      },
    });

    await upsertSignerProfile({
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      phone: entry.phone,
      title: entry.title,
      companyName: COMPANY_LEGAL_NAME,
      defaultRoles: entry.defaultRoles,
      platformContactId: contact.id,
      notes: "Provisioned automatically from the DocuSign template setup workflow.",
    });

    synced[signerKey] = {
      entry,
      contactId: contact.id,
    };
  }

  return synced;
}

function slotToTabPayload(
  templateId: string,
  slot: FieldSlot,
): { collection: string; payload: Record<string, unknown> } | null {
  if (!slot.roleName) {
    return null;
  }

  const anchorString = anchorToken(templateId, slot.anchor);
  const common = {
    anchorString,
    anchorUnits: "pixels",
    anchorXOffset: "0",
    anchorYOffset:
      slot.kind === "signHere" || slot.kind === "dateSigned" ? "-4" : "0",
    anchorIgnoreIfNotPresent: "false",
    anchorMatchWholeWord: "false",
    required: slot.required === true ? "true" : "false",
    locked: slot.locked === true ? "true" : "false",
    tabLabel: slot.anchor,
  } satisfies Record<string, unknown>;

  switch (slot.kind) {
    case "text":
      return {
        collection: "textTabs",
        payload: {
          ...common,
          width: String(slot.width ?? 180),
          height: String(slot.height ?? 18),
          value: trimNullable(slot.value) ?? undefined,
        },
      };
    case "checkbox":
      return {
        collection: "checkboxTabs",
        payload: {
          ...common,
          selected: trimNullable(slot.value)?.toLowerCase() === "true" ? "true" : "false",
        },
      };
    case "signHere":
      return {
        collection: "signHereTabs",
        payload: common,
      };
    case "dateSigned":
      return {
        collection: "dateSignedTabs",
        payload: common,
      };
    case "fullName":
      return {
        collection: "fullNameTabs",
        payload: {
          ...common,
          width: String(slot.width ?? 180),
        },
      };
    case "notarize":
      return {
        collection: "notarizeTabs",
        payload: common,
      };
    case "notarySeal":
      return {
        collection: "notarySealTabs",
        payload: common,
      };
    default:
      return null;
  }
}

function slotKindToTabType(kind: SlotKind) {
  switch (kind) {
    case "text":
      return "text";
    case "checkbox":
      return "checkbox";
    case "signHere":
      return "signHere";
    case "dateSigned":
      return "dateSigned";
    case "fullName":
      return "fullName";
    case "notarize":
      return "notarize";
    case "notarySeal":
      return "notarySeal";
    default:
      return "unknown";
  }
}

function buildRecipientContracts(
  plan: ProvisioningPlan,
  includeNotary: boolean,
): DocuSignRecipientContract[] {
  return plan.recipients
    .filter((recipient) => includeNotary || recipient.roleName !== "notary")
    .map((recipient) => {
      const defaultSigner =
        recipient.defaultSignerKey !== undefined
          ? SIGNER_DIRECTORY[recipient.defaultSignerKey]
          : null;

      return {
        roleName: recipient.roleName,
        recipientType: recipient.recipientType,
        routingOrder: recipient.routingOrder,
        defaultSignerEmail: defaultSigner?.email ?? null,
        defaultSignerName: defaultSigner
          ? `${defaultSigner.firstName} ${defaultSigner.lastName}`
          : null,
        defaultSignerTitle: defaultSigner?.title ?? null,
      } satisfies DocuSignRecipientContract;
    });
}

function buildFieldContracts(
  template: DocumentTemplate,
  plan: ProvisioningPlan,
  includeNotary: boolean,
): DocuSignFieldContract[] {
  return collectAllSlots(plan)
    .filter((slot) => slot.roleName)
    .filter((slot) => includeNotary || slot.roleName !== "notary")
    .map((slot) => ({
      id: slot.anchor,
      roleName: slot.roleName ?? null,
      tabType: slotKindToTabType(slot.kind),
      tabLabel: slot.anchor,
      name: slot.anchor,
      required: slot.required === true,
      anchorString: anchorToken(template.id, slot.anchor),
      defaultValue: trimNullable(slot.value),
      locked: slot.locked === true,
    }));
}

function collectAllSlots(plan: ProvisioningPlan) {
  const slots = Object.values(plan.lineSlots).flatMap((value) =>
    Array.isArray(value[0]) ? (value as FieldSlot[][]).flat() : (value as FieldSlot[]),
  );

  if (plan.recipients.some((recipient) => recipient.roleName === "notary")) {
    slots.push(notarize("notary_action"), notarySeal("notary_seal"));
  }

  return slots;
}

function buildRecipientPayloads(
  template: DocumentTemplate,
  plan: ProvisioningPlan,
  includeNotary: boolean,
) {
  const groupedTabs = new Map<
    string,
    Record<string, Array<Record<string, unknown>>>
  >();
  const slots = collectAllSlots(plan);

  for (const slot of slots) {
    if (!slot.roleName) {
      continue;
    }

    if (!includeNotary && slot.roleName === "notary") {
      continue;
    }

    const tab = slotToTabPayload(template.id, slot);

    if (!tab) {
      continue;
    }

    const current = groupedTabs.get(slot.roleName) ?? {};
    const collection = current[tab.collection] ?? [];
    collection.push(tab.payload);
    current[tab.collection] = collection;
    groupedTabs.set(slot.roleName, current);
  }

  return plan.recipients
    .filter((recipient) => includeNotary || recipient.roleName !== "notary")
    .map((recipient, index) => {
      const defaultSigner =
        recipient.defaultSignerKey !== undefined
          ? SIGNER_DIRECTORY[recipient.defaultSignerKey]
          : null;

      return {
        recipientType: recipient.recipientType,
        recipientId: String(index + 1),
        roleName: recipient.roleName,
        name: defaultSigner
          ? `${defaultSigner.firstName} ${defaultSigner.lastName}`
          : null,
        email: defaultSigner?.email ?? null,
        routingOrder: recipient.routingOrder,
        defaultRecipient: defaultSigner !== null,
        tabs: groupedTabs.get(recipient.roleName),
      } satisfies DocuSignCreateTemplateRecipientInput;
    });
}

async function buildTemplateDocumentInputs(
  template: DocumentTemplate,
  logoDataUri: string,
  supportingDocuments: Record<string, string>,
) {
  const { pdfPath } = await renderCompanyTemplatePdf(template, logoDataUri);
  const mainDocument = {
    documentId: "1",
    name: `${template.shortTitle}.pdf`,
    documentBase64: (await fs.readFile(pdfPath)).toString("base64"),
    fileExtension: "pdf",
    order: "1",
  } satisfies DocuSignCreateTemplateDocumentInput;

  const attachmentDocumentInputs: DocuSignCreateTemplateDocumentInput[] = [];
  const attachmentPaths: string[] = [];
  const attachmentLabels: string[] = [];

  template.attachments.forEach((label, index) => {
    const key =
      label === "A Summary of Your Rights Under the Fair Credit Reporting Act"
        ? "fcra-summary-of-rights"
        : "california-civil-code-1786-22";
    const attachmentPath = supportingDocuments[key];

    if (!attachmentPath) {
      throw new Error(
        `Supporting document ${key} is missing for template ${template.id}.`,
      );
    }

    attachmentPaths.push(attachmentPath);
    attachmentLabels.push(label);
    attachmentDocumentInputs.push({
      documentId: String(index + 2),
      name: path.basename(attachmentPath),
      documentBase64: "",
      fileExtension: "pdf",
      order: String(index + 2),
    });
  });

  for (const [index, attachmentPath] of attachmentPaths.entries()) {
    attachmentDocumentInputs[index] = {
      documentId: String(index + 2),
      name: path.basename(attachmentPath),
      documentBase64: (await fs.readFile(attachmentPath)).toString("base64"),
      fileExtension: "pdf",
      order: String(index + 2),
    };
  }

  return {
    mainPdfPath: pdfPath,
    documents: [mainDocument, ...attachmentDocumentInputs],
    attachmentPaths,
    attachmentLabels,
  };
}

async function provisionTemplate(
  template: DocumentTemplate,
  logoDataUri: string,
  supportingDocuments: Record<string, string>,
) {
  const plan = PROVISIONING_PLANS[template.id];

  if (!plan) {
    throw new Error(`No provisioning plan registered for template ${template.id}.`);
  }

  const documentInputs = await buildTemplateDocumentInputs(
    template,
    logoDataUri,
    supportingDocuments,
  );
  const baseInput = {
    readSecretValue: async () => null,
    name: plan.docusignName,
    description: `${template.title}\nInternal template key: ${template.id}`,
    emailSubject: plan.emailSubject,
    emailBlurb: plan.emailBlurb,
    documents: documentInputs.documents,
    searchExistingByName: true,
    shared: true,
  } satisfies Omit<CreateDocuSignTemplateInput, "recipients" | "env"> & {
    readSecretValue: CreateDocuSignTemplateInput["readSecretValue"];
  };

  let warnings: string[] = [];
  let created;

  try {
    created = await createDocuSignTemplate({
      ...baseInput,
      recipients: buildRecipientPayloads(template, plan, template.requiresNotary),
    });
  } catch (error) {
    if (!template.requiresNotary) {
      throw error;
    }

    warnings = [
      `DocuSign Notary configuration fell back to a standard template because the first create attempt failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    ];
    created = await createDocuSignTemplate({
      ...baseInput,
      recipients: buildRecipientPayloads(template, plan, false),
    });
  }

  const details = await getDocuSignTemplate({
    readSecretValue: async () => null,
    templateId: created.template.templateId,
  });
  const notaryReady = details.template.roles.some((role) =>
    role.recipientType.toLowerCase().includes("notary"),
  );
  const liveRecipientContracts =
    buildRecipientContractsFromTemplateDetails(details.template);
  const liveFieldContracts = buildFieldContractsFromTemplateDetails(
    details.template,
  );

  await upsertDocumentTemplateBinding({
    templateId: template.id,
    externalTemplateId: created.template.templateId,
    externalTemplateName: created.template.name,
    accountId: created.account.accountId,
    accountName: created.account.accountName,
    sourceDocumentPaths: [documentInputs.mainPdfPath],
    attachmentPaths: documentInputs.attachmentPaths,
    attachmentLabels: documentInputs.attachmentLabels,
    requiresNotary: template.requiresNotary,
    notaryReady,
    recipientContracts:
      liveRecipientContracts.length > 0
        ? liveRecipientContracts
        : buildRecipientContracts(plan, template.requiresNotary && notaryReady),
    fieldContracts:
      liveFieldContracts.length > 0
        ? liveFieldContracts
        : buildFieldContracts(template, plan, template.requiresNotary && notaryReady),
    warnings,
  });

  return {
    created: created.created,
    templateId: created.template.templateId,
    templateName: created.template.name,
    notaryReady,
    warnings,
    mainPdfPath: documentInputs.mainPdfPath,
  };
}

async function main() {
  await loadLocalEnvironment();
  await ensureDirectories();

  const requiredDocuSignKeys = [
    "DOCUSIGN_CLIENT_ID",
    "DOCUSIGN_PRIVATE_KEY",
    "DOCUSIGN_USER_ID",
  ];
  const missingDocuSignKeys = requiredDocuSignKeys.filter(
    (key) => !trimNullable(process.env[key]),
  );

  if (missingDocuSignKeys.length > 0) {
    throw new Error(
      `Missing required DocuSign environment keys: ${missingDocuSignKeys.join(", ")}.`,
    );
  }

  if (!trimNullable(process.env.PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN)) {
    throw new Error(
      "PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN is required for signer contact upserts.",
    );
  }

  const logoDataUri = await readLogoDataUri();
  const [fcraPdfPath, californiaPdfPath] = await Promise.all([
    downloadOfficialFcraSummaryPdf(),
    renderCaliforniaCivilCodePdf(logoDataUri),
  ]);

  await syncSignerProfiles();

  const supportingDocuments = {
    "fcra-summary-of-rights": fcraPdfPath,
    "california-civil-code-1786-22": californiaPdfPath,
  };

  const results = [];

  for (const template of PUSHING_CAPITAL_DOCUMENT_TEMPLATES) {
    results.push(await provisionTemplate(template, logoDataUri, supportingDocuments));
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        templates: results,
        outputRoot: OUTPUT_ROOT,
        provisioningStatePath: getDocumentTemplateProvisioningStatePath(),
      },
      null,
      2,
    ),
  );
}

await main();
