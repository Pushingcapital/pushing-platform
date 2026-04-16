import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * System health check — returns status of all integrations.
 */
export async function GET() {
  const start = Date.now();
  const checks: Record<string, { ok: boolean; ms: number; error?: string }> = {};

  // ── Google Drive ────────────────────────────────────────────────────
  try {
    const t = Date.now();
    const { searchCreditReportFiles } = await import("@/lib/google-drive");
    await searchCreditReportFiles();
    checks.googleDrive = { ok: true, ms: Date.now() - t };
  } catch (e) {
    checks.googleDrive = { ok: false, ms: 0, error: e instanceof Error ? e.message : "unknown" };
  }

  // ── BigQuery ────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    const { queryBigQuery } = await import("@/lib/bigquery");
    await queryBigQuery("SELECT 1 AS ping");
    checks.bigQuery = { ok: true, ms: Date.now() - t };
  } catch (e) {
    checks.bigQuery = { ok: false, ms: 0, error: e instanceof Error ? e.message : "unknown" };
  }

  // ── Google Vision ───────────────────────────────────────────────────
  try {
    const t = Date.now();
    const hasKey = !!process.env.GOOGLE_VISION_PRIVATE_KEY;
    checks.googleVision = { ok: hasKey, ms: Date.now() - t, ...(hasKey ? {} : { error: "No API key" }) };
  } catch (e) {
    checks.googleVision = { ok: false, ms: 0, error: e instanceof Error ? e.message : "unknown" };
  }

  // ── Google Speech ───────────────────────────────────────────────────
  try {
    const t = Date.now();
    const hasKey = !!process.env.GOOGLE_WORKSPACE_PRIVATE_KEY;
    checks.googleSpeech = { ok: hasKey, ms: Date.now() - t, ...(hasKey ? {} : { error: "No API key" }) };
  } catch (e) {
    checks.googleSpeech = { ok: false, ms: 0, error: e instanceof Error ? e.message : "unknown" };
  }

  // ── Environment ─────────────────────────────────────────────────────
  const envKeys = [
    "GOOGLE_VISION_CLIENT_EMAIL",
    "GOOGLE_VISION_PRIVATE_KEY",
    "GOOGLE_VISION_PROJECT_ID",
    "GOOGLE_WORKSPACE_CLIENT_EMAIL",
    "GOOGLE_WORKSPACE_PRIVATE_KEY",
    "NEXTAUTH_SECRET",
    "DOCUSIGN_INTEGRATION_KEY",
    "STRIPE_SECRET_KEY",
  ];
  const envStatus: Record<string, boolean> = {};
  for (const key of envKeys) {
    envStatus[key] = !!process.env[key];
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json({
    ok: allOk,
    status: allOk ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    latency: Date.now() - start,
    checks,
    env: envStatus,
    version: "1.0.0",
    service: "pushingSecurity",
  });
}
