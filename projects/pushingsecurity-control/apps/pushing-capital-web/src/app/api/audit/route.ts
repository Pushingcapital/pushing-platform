import { NextRequest, NextResponse } from "next/server";
import { queryBigQuery } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

const PROJECT = "brain-481809";

/**
 * GET /api/audit
 * Retrieve audit trail events.
 * Query: ?limit=50&source=pushingSecurity&tag=pushingcap
 *
 * POST /api/audit
 * Log a new audit event.
 * Body: { event, source, actor, details, tags }
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const source = url.searchParams.get("source");
    const tag = url.searchParams.get("tag");

    let sql = `
      SELECT *
      FROM \`${PROJECT}.pc_operations.communication_registry\`
      WHERE 1=1
    `;
    const params: Record<string, unknown> = {};

    if (source) {
      sql += " AND source = @source";
      params.source = source;
    }
    if (tag) {
      sql += " AND tag = @tag";
      params.tag = tag;
    }

    sql += " ORDER BY timestamp DESC LIMIT @limit";
    params.limit = limit;

    const rows = await queryBigQuery(sql, params);

    return NextResponse.json({
      ok: true,
      count: rows.length,
      events: rows,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[audit] GET error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, source, actor, details, tags } = body;

    if (!event || !source) {
      return NextResponse.json(
        { ok: false, error: "Missing required: event, source" },
        { status: 400 },
      );
    }

    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = new Date().toISOString();

    const sql = `
      INSERT INTO \`${PROJECT}.pc_operations.communication_registry\`
      (id, event, source, actor, details, tag, timestamp)
      VALUES (@id, @event, @source, @actor, @details, @tag, @timestamp)
    `;

    await queryBigQuery(sql, {
      id,
      event,
      source: source || "pushingSecurity",
      actor: actor || "system",
      details: JSON.stringify(details || {}),
      tag: Array.isArray(tags) ? tags.join(",") : tags || "pushingcap",
      timestamp,
    });

    return NextResponse.json({
      ok: true,
      id,
      message: "Audit event logged",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[audit] POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
