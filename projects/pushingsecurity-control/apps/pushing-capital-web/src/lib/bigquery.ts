import "server-only";

import { BigQuery } from "@google-cloud/bigquery";

// ── Auth ──────────────────────────────────────────────────────────────────
// Uses the Vision service account (brain-481809 project) which already has
// BigQuery access. Falls back to ADC if available.
// ──────────────────────────────────────────────────────────────────────────

let _bqClient: BigQuery | null = null;

function getBigQueryClient(): BigQuery {
  if (_bqClient) return _bqClient;

  const clientEmail = process.env.GOOGLE_VISION_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_VISION_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.GOOGLE_VISION_PROJECT_ID || "brain-481809";

  if (clientEmail && privateKey) {
    _bqClient = new BigQuery({
      projectId,
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  } else {
    // Fall back to application default credentials
    _bqClient = new BigQuery({ projectId });
  }

  return _bqClient;
}

// ── Typed Results ─────────────────────────────────────────────────────────

export interface CreditReportRow {
  credit_report_fico_score: string;
  credit_report_utilization: number;
  credit_report_total_limit: number;
  credit_report_total_used: number;
  credit_report_open_accounts: string;
  credit_report_closed_accounts: number;
  credit_report_derog_accounts: number;
  credit_report_date: string;
  credit_report_bureau: string;
  credit_report_prepared_for: string;
  credit_report_pdf: string;
  credit_report_title: string;
  [key: string]: unknown;
}

export interface CreditTradeline {
  creditor_name: string;
  account_number_masked: string;
  account_status: string;
  debt_type: string;
  current_balance: number;
  credit_limit: number;
  monthly_payment: number;
  credit_usage: number;
  is_derogatory: string;
  date_opened: string;
  bureau: string;
  open_closed: string;
  total_late_payments: number;
  ownership: string;
  [key: string]: unknown;
}

export interface CreditInspection {
  inspection_id: string;
  inspection_date: string;
  inspection_title: string;
  v8_experian: number;
  v8_equifax_score: number;
  v8_transunion_score: number;
  overall_credit_utilization: number;
  total_derogatory_accounts: number;
  inspector_summary__recommendations: string;
  [key: string]: unknown;
}

export interface FinancialProfileRow {
  social_security_number: string;
  date_of_birth: string;
  monthly_income: number;
  cr_experian_utilization_pct: number;
  cr_equifax_utilization_pct: number;
  cr_transunion_utilization_pct: number;
  cr_experian_inquiry_count: number;
  cr_equifax_inquiry_count: number;
  cr_transunion_inquiry_count: number;
  open_accounts_experian: number;
  open_accounts_equifax: number;
  open_accounts_transunion: number;
  [key: string]: unknown;
}

// ── Query Helpers ─────────────────────────────────────────────────────────

const DATASET = "pushing_capital_warehouse";
const PROJECT = "brain-481809";

/**
 * Get the CRM object property catalog for a given object type.
 */
export async function getCrmProperties(objectKey: string) {
  const bq = getBigQueryClient();
  const query = `
    SELECT property_name, property_label, property_type, field_type, property_group
    FROM \`${PROJECT}.${DATASET}.crm_object_properties_latest_v1\`
    WHERE record_id = @objectKey
    ORDER BY property_group, property_name
  `;

  const [rows] = await bq.query({ query, params: { objectKey } });
  return rows;
}

/**
 * Get all CRM objects in the catalog (for the warehouse inventory).
 */
export async function getCrmObjectCatalog() {
  const bq = getBigQueryClient();
  const query = `
    SELECT object_key, object_label, property_count, has_custom_properties
    FROM \`${PROJECT}.${DATASET}.crm_object_catalog_latest_v1\`
    ORDER BY object_label
  `;

  const [rows] = await bq.query({ query });
  return rows;
}

/**
 * Run an arbitrary read-only query against BigQuery.
 * Used for dynamic queries from the CLARITY dashboard.
 */
export async function queryBigQuery<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  const bq = getBigQueryClient();
  const [rows] = await bq.query({
    query: sql,
    params,
    location: "US",
  });
  return rows as T[];
}
