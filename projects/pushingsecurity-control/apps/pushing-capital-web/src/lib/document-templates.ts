import {
  getDocumentTemplateBinding,
  listDocumentTemplateBindings,
  type StoredDocumentTemplateBinding,
} from "./document-template-bindings.ts";

export const PUSHING_CAPITAL_LOGO_PATH = "/brand/p-glass-mark.png";

export type DocumentTemplateSignerRole =
  | "employee"
  | "contractor"
  | "company_representative"
  | "user"
  | "principal"
  | "attorney_in_fact"
  | "notary";

export type DocumentTemplate = {
  id: string;
  title: string;
  shortTitle: string;
  category: "employment" | "compliance" | "client-authorization" | "dmv";
  summary: string;
  brand: {
    companyName: "Pushing Capital";
    logoPath: string;
  };
  signerRoles: DocumentTemplateSignerRole[];
  requiresNotary: boolean;
  attachments: string[];
  notes: string[];
  placeholders: string[];
  docuSignTemplateId: string | null;
  body: string;
};

export type ResolvedDocumentTemplateSummary = Omit<
  ReturnType<typeof listDocumentTemplateSummaries>[number],
  "docuSignTemplateId"
> & {
  docuSignTemplateId: string | null;
  docuSignBinding: StoredDocumentTemplateBinding | null;
};

export type ResolvedDocumentTemplate = Omit<DocumentTemplate, "docuSignTemplateId"> & {
  docuSignTemplateId: string | null;
  docuSignBinding: StoredDocumentTemplateBinding | null;
};

export const PUSHING_CAPITAL_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "pc-w2-employment-offer-compliance-acknowledgment",
    title: "W-2 Employment Offer, Duties, and Compliance Acknowledgment",
    shortTitle: "W-2 Employment Offer",
    category: "employment",
    summary:
      "Employment offer letter covering duties, lawful scope of work, confidentiality, compensation, and acknowledgment of access to sensitive records.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["company_representative", "employee"],
    requiresNotary: false,
    attachments: [],
    notes: [
      "Finalize the legal entity name, entity type, signer titles, compensation basis, and employment status before sending.",
    ],
    placeholders: [
      "date",
      "employee_name",
      "employee_address",
      "employee_city_state_zip",
      "greeting_name",
      "company_legal_name",
      "job_title_suffix",
      "effective_date",
      "client_name",
      "client_state_of_residence",
      "compensation_amount",
      "compensation_basis",
      "employment_relationship",
      "employment_term_end_date",
      "company_entity_type",
      "company_signer_name",
      "company_signer_title",
      "company_signature_date",
      "employee_signature_date",
    ],
    docuSignTemplateId: null,
    body: `[PUSHING CAPITAL LETTERHEAD]

DATE: __________________

TO:
Employee Name: ______________________________
Address: ____________________________________
City/State/Zip: ______________________________

RE: W-2 Employment Offer, Duties, and Compliance Acknowledgment

Dear __________________________:

Pushing Capital, {{company_legal_name}} ("Company"), is pleased to offer you employment as a W-2 employee in the position of Data Security and Monitoring Specialist / __________________________, effective __________________, subject to the terms below.

1. Position and Duties.
Your duties include monitoring, reviewing, processing, safeguarding, and administering authorized records and documents for Company-approved users/clients, including, where applicable:
User/Client Name: __________________________
State of Residence: _________________________

You may assist with identity verification, document review, data-security monitoring, DMV/title/registration support, tax-information authorization handling, consumer-report compliance files, and related records, but only to the extent the Company has obtained all legally required disclosures, authorizations, powers of attorney, and agency-specific forms.

2. Lawful Scope of Work.
You shall handle DMV, IRS, credit, financial, vehicle, background, and personally identifying information only as specifically assigned by Company and only for lawful, documented business purposes.

3. Confidentiality and Security.
As a condition of employment, you must sign and comply with the Company’s Confidentiality, Nondisclosure, and Data Security Agreement, together with all privacy, records-access, and information-security policies adopted by Company from time to time.

4. No Unauthorized Access.
You shall not access, request, copy, transmit, store, discuss, or disclose any user/client information unless:
(a) the access is required for your assigned duties;
(b) Company has confirmed the necessary written authorization is on file; and
(c) the access is lawful and approved by Company.

5. Compliance and Incident Reporting.
You must immediately report any suspected misuse, unauthorized access, loss, breach, fraud, security event, or compliance concern involving Company information or any user/client information.

6. Compensation.
You will be paid at the rate of $________________ per [hour / year / month], less all lawful deductions, on the Company’s regular designated payday(s) and in compliance with applicable wage laws.

7. Employment Relationship.
Your employment shall be [AT-WILL / FOR A DEFINITE TERM ENDING __________________]. No oral statement changes this status. Any change must be in a written agreement signed by an authorized Company representative.

8. Conditions of Employment.
This offer is conditioned on your completion of all onboarding documents, including payroll forms, confidentiality documents, background-check forms, and any other required acknowledgments.

9. Acknowledgment.
By signing below, you acknowledge that your role may involve highly sensitive records and that Company will allow access only when required consents and authorizations are in place.

COMPANY:

Pushing Capital, {{company_entity_type}}
By: _______________________________________
Name: _____________________________________
Title: ______________________________________
Date: ______________________________________

EMPLOYEE:

Signature: _________________________________
Print Name: ________________________________
Date: ______________________________________`,
  },
  {
    id: "pc-employee-confidentiality-data-security-agreement",
    title: "Employee Confidentiality, Nondisclosure, and Data Security Agreement",
    shortTitle: "Employee Confidentiality Agreement",
    category: "compliance",
    summary:
      "Standalone confidentiality and data-security agreement for employees with access to sensitive records and systems.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["employee", "company_representative"],
    requiresNotary: false,
    attachments: [],
    notes: [
      "Use alongside role-specific security policies and annual access attestations.",
    ],
    placeholders: [
      "agreement_date",
      "company_entity_type",
      "employee_name",
      "employee_signature_date",
      "company_signer_name",
      "company_signer_title",
      "company_signature_date",
    ],
    docuSignTemplateId: null,
    body: `CONFIDENTIALITY, NONDISCLOSURE, AND DATA SECURITY AGREEMENT

This Agreement is entered as of __________________ by and between Pushing Capital, {{company_entity_type}} ("Company") and ______________________________ ("Employee").

1. Confidential Information.
"Confidential Information" includes all nonpublic information obtained by Employee through employment, including user/client names, addresses, dates of birth, social security numbers, driver information, DMV records, credit information, financial information, tax-related information, reports, documents, logins, passwords, policies, operating procedures, pricing, vendor information, and trade secrets.

2. Non-Disclosure.
Employee shall keep all Confidential Information strictly confidential and shall not disclose it to any third party except as expressly authorized in writing by Company and as required in the ordinary course of Employee’s assigned duties.

3. Limited Use.
Employee shall use Confidential Information solely for Company business and only for lawful, assigned purposes. Employee shall not access any record out of curiosity, convenience, personal interest, or for any purpose not expressly authorized by Company.

4. Security Obligations.
Employee shall follow all Company security rules, including password protection, device security, restricted access, secure transmission, secure storage, clean-desk practices, and immediate reporting of any suspected misuse, breach, or unauthorized disclosure.

5. No Copying or Removal.
Employee shall not remove, download, print, photograph, screenshot, forward, or retain Confidential Information except as required for assigned work and only through Company-approved systems and procedures.

6. Return and Destruction.
Upon request by Company, or immediately upon termination of employment, Employee shall return all Company property and Confidential Information and shall not retain any copies in any form.

7. Survival.
Employee’s confidentiality obligations survive the end of employment and continue for so long as the information remains confidential, and indefinitely as to trade secrets.

8. Remedies.
Employee acknowledges that unauthorized use or disclosure may cause irreparable harm to Company and/or its users/clients, and that Company may seek injunctive relief and any other lawful remedy.

9. No Non-Compete.
This Agreement is intended only to protect confidential information and does not prohibit lawful future employment or lawful competition.

EMPLOYEE:
Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________

COMPANY:
By: ________________________________________
Name/Title: _________________________________
Date: ______________________________________`,
  },
  {
    id: "pc-background-check-disclosure-authorization",
    title:
      "Stand-Alone Background Check, Identity Verification, and Investigative Consumer Report Disclosure + Authorization",
    shortTitle: "Background Check Disclosure",
    category: "compliance",
    summary:
      "Standalone employment disclosure and authorization for background investigations and investigative consumer reports.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["employee"],
    requiresNotary: false,
    attachments: [
      "A Summary of Your Rights Under the Fair Credit Reporting Act",
      "California Civil Code §1786.22 summary",
    ],
    notes: [
      "Use this as a separate document, not inside the employment letter.",
      "Attach the current FCRA Summary of Rights and California Civil Code §1786.22 summary.",
    ],
    placeholders: [
      "company_entity_type",
      "consumer_reporting_agency_name",
      "consumer_reporting_agency_address",
      "consumer_reporting_agency_phone",
      "consumer_reporting_agency_website",
      "investigation_scope",
      "employee_name",
      "employee_signature_date",
    ],
    docuSignTemplateId: null,
    body: `DISCLOSURE REGARDING BACKGROUND INVESTIGATION
(Standalone Disclosure and Authorization)

Pushing Capital, {{company_entity_type}} ("Company"), may obtain consumer reports and/or investigative consumer reports about you for employment purposes at any time before employment and, if you sign below, during employment, reassignment, retention, promotion, or other employment-related decisions.

Such reports may include, to the extent lawful:
• identity verification;
• social security number trace;
• address history;
• motor vehicle records;
• prior employment verification;
• education verification;
• professional license verification;
• criminal/civil/court record searches;
• and other background information relevant to employment.

If an investigative consumer report is obtained, it may include information regarding your character, general reputation, personal characteristics, and mode of living.

Investigative Consumer Reporting Agency / Consumer Reporting Agency:
Name: ______________________________________
Address: ____________________________________
Telephone: _________________________________
Website: ___________________________________

Nature and Scope of Investigation Requested:
____________________________________________________
____________________________________________________
____________________________________________________

California Copy Request:
[  ] I request to receive a copy of any report obtained about me.

AUTHORIZATION

I authorize Pushing Capital and its authorized agents to obtain consumer reports and/or investigative consumer reports about me for employment purposes as described above. I understand that this authorization may remain in effect throughout my employment to the extent permitted by law, unless I revoke it in writing, subject to any report already ordered before revocation is received.

I acknowledge receipt of:
[  ] A Summary of Your Rights Under the Fair Credit Reporting Act
[  ] A Summary of Rights Under California Civil Code §1786.22

Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________`,
  },
  {
    id: "pc-california-consumer-credit-report-addendum",
    title: "California Consumer Credit Report Addendum",
    shortTitle: "California Credit Addendum",
    category: "compliance",
    summary:
      "California-only consumer credit report notice and authorization for positions that qualify under Labor Code §1024.5.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["employee"],
    requiresNotary: false,
    attachments: [],
    notes: [
      "Use only if the position lawfully qualifies under California Labor Code §1024.5.",
      "State the exact statutory basis before sending.",
    ],
    placeholders: [
      "statutory_basis",
      "other_lawful_basis",
      "company_or_agency_name",
      "company_or_agency_address",
      "company_or_agency_phone",
      "employee_signature_date",
    ],
    docuSignTemplateId: null,
    body: `NOTICE REGARDING PROCUREMENT OF CONSUMER CREDIT REPORT
FOR EMPLOYMENT PURPOSES (CALIFORNIA)

Company intends to obtain a consumer credit report about you for employment purposes.

Specific statutory basis under California Labor Code §1024.5(a):
[  ] Managerial position
[  ] Position for which the information is required by law to be disclosed or obtained
[  ] Position involving regular access to bank/credit card account information, social security number, and date of birth
[  ] Position as a named signatory on the employer’s bank/credit card account
[  ] Position authorized to transfer money on behalf of employer
[  ] Position authorized to enter financial contracts on behalf of employer
[  ] Position involving access to confidential or proprietary information
[  ] Position involving regular access to cash totaling $10,000 or more during the workday
[  ] Other lawful basis: ______________________________________

Source of Report:
Company/Agency Name: _______________________
Address: ____________________________________
Telephone: _________________________________

Copy Request:
[  ] I request a copy of any consumer credit report obtained about me.

Authorization:
I authorize Company to obtain a consumer credit report about me for employment purposes as stated above.

Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________`,
  },
  {
    id: "pc-user-client-authorization-written-instructions-esign-consent",
    title:
      "User/Client Authorization, Written Instructions, Limited Confidentiality Terms, and Electronic Signature Consent",
    shortTitle: "User Authorization and E-Sign Consent",
    category: "client-authorization",
    summary:
      "User/client-facing authorization covering monitoring, record access, written instructions for consumer information, and e-sign consent.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["user", "company_representative", "notary"],
    requiresNotary: true,
    attachments: [],
    notes: [
      "For IRS access, this agreement supplements but does not replace IRS Form 8821 or 2848.",
      "Use written instructions carefully for credit-related access and keep the monthly-access cap explicit.",
    ],
    placeholders: [
      "user_name",
      "user_address",
      "company_entity_type",
      "monthly_credit_access_limit",
      "authorization_start_date",
      "authorization_end_date",
      "company_signer_name",
      "company_signer_title",
      "company_signature_date",
      "user_signature_date",
      "notary_block",
    ],
    docuSignTemplateId: null,
    body: `USER/CLIENT AUTHORIZATION, WRITTEN INSTRUCTIONS,
LIMITED CONFIDENTIALITY TERMS, AND ELECTRONIC SIGNATURE CONSENT

I, ______________________________________ ("User"), residing at
_____________________________________________________________,
authorize Pushing Capital, {{company_entity_type}}, together with its officers, employees, designated contractors, and lawful subagents ("Authorized Company Parties"), to act for the limited purposes stated below.

1. Authorized Purpose.
This authorization is given solely for:
(a) data-security monitoring;
(b) fraud prevention and identity verification;
(c) vehicle title, registration, renewal, release, and related DMV support;
(d) compliance review;
(e) document processing and administration;
(f) monitoring and reviewing records that I specifically authorize in writing.

2. Authorized Information.
Subject to applicable law and agency/institution requirements, I authorize the Authorized Company Parties to request, obtain, inspect, receive, review, use, and maintain records relating to:
• my identity and contact information;
• vehicle, title, registration, lien, plate, and DMV-related records;
• credit or consumer-report information;
• financial-account-related documents or statements that I separately provide or authorize;
• tax-information authorizations and related IRS correspondence;
• and supporting records reasonably necessary to carry out the Authorized Purpose.

3. Written Instructions for Consumer/Credit Information.
I instruct any consumer reporting agency or other lawful source to furnish my consumer report and/or credit-related information to Company for the Authorized Purpose, to the extent permitted by law, no more than ______ times per calendar month, unless additional access is reasonably necessary to:
(a) investigate suspected fraud or misuse;
(b) complete a transaction I requested or authorized;
(c) respond to a legal, regulatory, or agency requirement; or
(d) correct or verify information I submitted.

4. IRS Matters.
I understand and agree that if Company needs access to my IRS tax information, I will execute IRS Form 8821, and if actual representation before the IRS is needed, I will execute IRS Form 2848 designating an eligible individual. I acknowledge that this agreement alone does not replace those IRS forms.

5. Confidentiality and Limited Use.
Company shall use my information only for the Authorized Purpose and shall limit access to personnel with a business need to know. Company shall not sell my information or use it for unrelated purposes. Where agency rules impose stricter limits on retention, storage, destruction, or redisclosure, those stricter limits will control.

6. Electronic Records and Signatures.
I consent to the use of electronic records, electronic signatures, and electronic delivery, including through DocuSign or a similar platform. I agree that my electronic signature is intended to be binding to the same extent as my handwritten signature, to the extent permitted by law.

7. Term.
This authorization begins on __________________ and remains in effect until:
[  ] revoked in writing by me;
[  ] ____________________________;
provided, however, that Company may complete work already in progress and retain records as required by law.

8. Revocation.
I may revoke this authorization by written notice to Company, but the revocation will not affect actions already taken in reliance on this authorization before Company receives the revocation.

USER:
Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________

COMPANY ACKNOWLEDGMENT:
By: ________________________________________
Name/Title: _________________________________
Date: ______________________________________

NOTARY:
[Insert the state-required notarial acknowledgment/jurat here.]`,
  },
  {
    id: "pc-limited-motor-vehicle-poa-dmv-record-authorization",
    title:
      "Limited Motor Vehicle Power of Attorney and DMV Record Authorization",
    shortTitle: "Limited DMV POA",
    category: "dmv",
    summary:
      "Master DMV power of attorney and record authorization for state-specific vehicle transactions, with notary block and state-form caveats.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["principal", "attorney_in_fact", "notary"],
    requiresNotary: true,
    attachments: [],
    notes: [
      "Use the master POA plus the transaction-state form when needed.",
      "State practice varies materially, including secure POA requirements and original-signature rules.",
    ],
    placeholders: [
      "principal_name",
      "principal_address",
      "company_entity_type",
      "designated_officer_name_title",
      "state_list",
      "vehicle_year",
      "vehicle_make",
      "vehicle_model",
      "vehicle_vin",
      "vehicle_plate_number",
      "vehicle_title_number",
      "authorized_transactions",
      "effective_date",
      "termination_date",
      "principal_signature_date",
      "company_signer_name",
      "company_signer_title",
      "company_signature_date",
      "notary_block",
    ],
    docuSignTemplateId: null,
    body: `LIMITED MOTOR VEHICLE POWER OF ATTORNEY
AND DMV RECORD AUTHORIZATION

I, ______________________________________ ("Principal"),
residing at _______________________________________________,
hereby appoint Pushing Capital, {{company_entity_type}}, and the following designated officer/employee (if any):

Name/Title: _______________________________________________

and any lawful substitute or designated employee, to the extent permitted by applicable law, as my true and lawful attorney-in-fact solely for the motor vehicle and DMV matters described below.

1. Scope of Authority.
My attorney-in-fact is authorized, solely for the vehicle(s) and transaction(s) identified below, to:
(a) apply for, renew, transfer, register, title, re-title, or correct vehicle records;
(b) request duplicate title, registration, plate, sticker, or record information;
(c) sign, submit, receive, and correct DMV forms and supporting documents;
(d) obtain, inspect, and receive motor vehicle and driver-related records to the extent permitted by law and needed for the authorized transaction;
(e) release, satisfy, or process lien-related paperwork if separately instructed by me in writing;
(f) complete or acknowledge mileage/odometer disclosures only to the extent specifically permitted by applicable law and required forms;
(g) perform any ministerial act reasonably necessary to complete the authorized DMV transaction.

2. Vehicle / Matter Covered.
State(s): _________________________________________________
Year: __________
Make: _________________________________________________
Model: ________________________________________________
VIN: _________________________________________________
Plate No.: _____________________________________________
Title No. (if known): _____________________________________
Authorized Transaction(s): _________________________________
_______________________________________________________

3. Restrictions.
This power of attorney does NOT authorize my attorney-in-fact to:
(a) receive sale proceeds for my benefit unless separately authorized in writing;
(b) endorse negotiable instruments on my behalf unless separately authorized in writing;
(c) transfer the vehicle to itself or an affiliate for its own benefit unless separately authorized in writing;
(d) act beyond the specific vehicle/matter described above.

4. State-Specific Forms.
I understand that some states require a prescribed DMV form, a secure power of attorney, original signatures, photo identification, or other transaction-specific paperwork. I agree that this master power of attorney supplements, but does not replace, any state-required form, and I agree to sign such additional state-specific documents as reasonably required to complete the authorized transaction.

5. Duration and Revocation.
This power of attorney becomes effective on __________________ and remains effective until:
[  ] completion of the authorized transaction(s);
[  ] revoked by me in writing;
[  ] ____________________________.
Revocation does not affect actions already taken in reliance on this power before notice of revocation is received.

6. Ratification.
I ratify and confirm all lawful acts taken by my attorney-in-fact within the scope of this instrument.

PRINCIPAL:
Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________

ACCEPTED BY ATTORNEY-IN-FACT:
Pushing Capital, {{company_entity_type}}
By: ________________________________________
Name/Title: _________________________________
Date: ______________________________________

NOTARY:
[Insert the state-required notarial acknowledgment/jurat here.]`,
  },
  {
    id: "pc-1099-contractor-agreement",
    title: "1099 Independent Contractor Agreement",
    shortTitle: "1099 Contractor Agreement",
    category: "employment",
    summary:
      "Core agreement establishing an independent contractor relationship, covering services, compensation, confidentiality, and IP ownership.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["contractor", "company_representative"],
    requiresNotary: false,
    attachments: [],
    notes: [
      "Ensure all compensation terms and project scopes are properly finalized.",
    ],
    placeholders: [
      "agreement_date",
      "company_legal_name",
      "company_entity_type",
      "contractor_name",
      "contractor_address",
      "services_description",
      "compensation_rate",
      "company_signer_name",
      "company_signer_title",
      "company_signature_date",
      "contractor_signature_date",
    ],
    docuSignTemplateId: null,
    body: `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is made effective as of __________________ by and between Pushing Capital, {{company_entity_type}} ("Company"), and ______________________________ ("Contractor"), located at ________________________________________________.

1. Services.
Company engages Contractor to provide the following services (the "Services"):
______________________________________________________________________.
Contractor agrees to perform the Services in a professional manner and in accordance with industry standards.

2. Compensation.
In consideration for the Services, Company will pay Contractor at the rate of $__________________. Contractor shall be responsible for all expenses incurred while performing the Services unless otherwise agreed in writing.

3. Independent Contractor Status.
Contractor is an independent contractor, not an employee, partner, or joint venturer of Company. Contractor alone controls the method and manner of performing the Services. Contractor is responsible for all federal, state, and local taxes on amounts paid under this Agreement.

4. Confidentiality.
Contractor acknowledges that during the engagement, Contractor will have access to Company’s confidential information. Contractor agrees to keep such information strictly confidential and use it solely for the purpose of providing the Services.

5. Intellectual Property.
Any work products, deliverables, ideas, or intellectual property created by Contractor in the course of providing the Services shall be considered "work made for hire" and shall become the exclusive property of Company.

6. Term and Termination.
This Agreement may be terminated by either party at any time upon written notice. Upon termination, Company shall pay Contractor for any Services completed up to the termination date.

CONTRACTOR:
Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________

COMPANY:
{{company_legal_name}}
By: ________________________________________
Name/Title: _________________________________
Date: ______________________________________`,
  },
  {
    id: "pc-direct-deposit-authorization",
    title: "Direct Deposit Authorization",
    shortTitle: "Direct Deposit Form",
    category: "compliance",
    summary:
      "Authorization for the Company to initiate direct deposits to the individual's provided bank account.",
    brand: {
      companyName: "Pushing Capital",
      logoPath: PUSHING_CAPITAL_LOGO_PATH,
    },
    signerRoles: ["employee"], // Could also be used for contractors
    requiresNotary: false,
    attachments: [],
    notes: [
      "Make sure the recipient attaches a voided check or provides accurate routing and account numbers.",
    ],
    placeholders: [
      "payee_name",
      "bank_name",
      "routing_number",
      "account_number",
      "account_type",
      "payee_signature_date",
    ],
    docuSignTemplateId: null,
    body: `DIRECT DEPOSIT AUTHORIZATION

Payee Name: ______________________________

I authorize Pushing Capital LLC ("Company") to initiate credit entries, and if necessary, debit entries and adjustments for any credit entries made in error, to my account at the financial institution listed below:

Bank Name: ______________________________
Routing Number: _________________________
Account Number: _________________________
Account Type: [  ] Checking   [  ] Savings

This authorization will remain in effect until the Company receives written notice of its termination in a manner that affords the Company a reasonable opportunity to act on it.

PAYEE:
Signature: __________________________________
Print Name: _________________________________
Date: ______________________________________`,
  },
];

export function listDocumentTemplateSummaries() {
  return PUSHING_CAPITAL_DOCUMENT_TEMPLATES.map((template) => ({
    id: template.id,
    title: template.title,
    shortTitle: template.shortTitle,
    category: template.category,
    summary: template.summary,
    signerRoles: template.signerRoles,
    requiresNotary: template.requiresNotary,
    attachments: template.attachments,
    docuSignTemplateId: template.docuSignTemplateId,
  }));
}

export function getDocumentTemplateById(templateId: string) {
  return (
    PUSHING_CAPITAL_DOCUMENT_TEMPLATES.find(
      (template) => template.id === templateId,
    ) ?? null
  );
}

export async function listResolvedDocumentTemplateSummaries() {
  const bindings = await listDocumentTemplateBindings();
  const bindingMap = new Map(bindings.map((binding) => [binding.templateId, binding]));

  return listDocumentTemplateSummaries().map((template) => {
    const binding = bindingMap.get(template.id) ?? null;

    return {
      ...template,
      docuSignTemplateId: binding?.externalTemplateId ?? template.docuSignTemplateId,
      docuSignBinding: binding,
    } satisfies ResolvedDocumentTemplateSummary;
  });
}

export async function getResolvedDocumentTemplateById(templateId: string) {
  const template = getDocumentTemplateById(templateId);

  if (!template) {
    return null;
  }

  const binding = await getDocumentTemplateBinding(template.id);

  return {
    ...template,
    docuSignTemplateId: binding?.externalTemplateId ?? template.docuSignTemplateId,
    docuSignBinding: binding,
  } satisfies ResolvedDocumentTemplate;
}
