import { NextRequest, NextResponse } from "next/server";
import { queryBigQuery, type CreditReportRow, type CreditTradeline, type CreditInspection } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

const PROJECT = "brain-481809";
const DATASET = "pushing_capital_warehouse";

/**
 * GET /api/clarity
 * Credit intelligence data API — returns real credit data from BQ.
 *
 * Query params:
 *   ?action=summary     → FICO scores, utilization, account counts
 *   ?action=tradelines  → Full tradeline data
 *   ?action=inspections → Credit inspection history
 *   ?action=profile     → Financial profile
 *   ?user_id=xxx        → Filter by user (default: all)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "summary";
    const userId = url.searchParams.get("user_id");

    switch (action) {
      // ── Credit report summary ─────────────────────────────────────
      case "summary": {
        const sql = `
          SELECT
            credit_report_fico_score,
            credit_report_utilization,
            credit_report_total_limit,
            credit_report_total_used,
            credit_report_open_accounts,
            credit_report_closed_accounts,
            credit_report_derog_accounts,
            credit_report_date,
            credit_report_bureau,
            credit_report_prepared_for,
            credit_report_title
          FROM \`${PROJECT}.${DATASET}.credit_report_latest_v1\`
          ${userId ? "WHERE credit_report_prepared_for = @userId" : ""}
          ORDER BY credit_report_date DESC
          LIMIT 10
        `;
        const rows = await queryBigQuery<CreditReportRow>(sql, userId ? { userId } : {});

        return NextResponse.json({
          ok: true,
          action: "summary",
          count: rows.length,
          reports: rows,
        });
      }

      // ── Tradelines ────────────────────────────────────────────────
      case "tradelines": {
        const sql = `
          SELECT
            creditor_name,
            account_number_masked,
            account_status,
            debt_type,
            current_balance,
            credit_limit,
            monthly_payment,
            credit_usage,
            is_derogatory,
            date_opened,
            bureau,
            open_closed,
            total_late_payments,
            ownership
          FROM \`${PROJECT}.${DATASET}.credit_tradelines_latest_v1\`
          ORDER BY current_balance DESC
          LIMIT 50
        `;
        const rows = await queryBigQuery<CreditTradeline>(sql);

        return NextResponse.json({
          ok: true,
          action: "tradelines",
          count: rows.length,
          tradelines: rows,
        });
      }

      // ── Inspections ───────────────────────────────────────────────
      case "inspections": {
        const sql = `
          SELECT
            inspection_id,
            inspection_date,
            inspection_title,
            v8_experian,
            v8_equifax_score,
            v8_transunion_score,
            overall_credit_utilization,
            total_derogatory_accounts,
            inspector_summary__recommendations
          FROM \`${PROJECT}.${DATASET}.credit_inspection_v1\`
          ORDER BY inspection_date DESC
          LIMIT 20
        `;
        const rows = await queryBigQuery<CreditInspection>(sql);

        return NextResponse.json({
          ok: true,
          action: "inspections",
          count: rows.length,
          inspections: rows,
        });
      }

      // ── Financial profile ─────────────────────────────────────────
      case "profile": {
        const sql = `
          SELECT *
          FROM \`${PROJECT}.${DATASET}.financial_profile_latest_v1\`
          ${userId ? "WHERE social_security_number IS NOT NULL" : ""}
          LIMIT 1
        `;
        const rows = await queryBigQuery(sql);

        return NextResponse.json({
          ok: true,
          action: "profile",
          profile: rows[0] || null,
        });
      }

      default:
        return NextResponse.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[clarity] Error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
