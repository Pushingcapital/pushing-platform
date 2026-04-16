import { NextRequest, NextResponse } from "next/server";
import { queryBigQuery } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

const PROJECT = "brain-481809";
const DATASET = "pushing_capital_warehouse";
const TABLE = "vault_items";

// ── Types ─────────────────────────────────────────────────────────────────

interface VaultItem {
  id: string;
  user_id: string;
  category: string;
  label: string;
  detail: string;
  icon: string;
  masked: boolean;
  encrypted_value: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/vault
 * List vault items for a user.
 * Query: ?user_id=xxx&category=passwords
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id") || "default";
    const category = url.searchParams.get("category");

    let sql = `
      SELECT id, user_id, category, label, detail, icon, masked, metadata, created_at, updated_at
      FROM \`${PROJECT}.${DATASET}.${TABLE}\`
      WHERE user_id = @userId
    `;
    const params: Record<string, unknown> = { userId };

    if (category && category !== "all") {
      sql += " AND category = @category";
      params.category = category;
    }
    sql += " ORDER BY updated_at DESC LIMIT 100";

    const rows = await queryBigQuery<VaultItem>(sql, params);

    return NextResponse.json({
      ok: true,
      count: rows.length,
      items: rows,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[vault] GET error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/vault
 * Create or update a vault item.
 * Body: { user_id, category, label, detail, icon, masked, encrypted_value?, metadata? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, category, label, detail, icon, masked, encrypted_value, metadata } = body;

    if (!user_id || !category || !label) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: user_id, category, label" },
        { status: 400 },
      );
    }

    const id = `vault_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO \`${PROJECT}.${DATASET}.${TABLE}\`
      (id, user_id, category, label, detail, icon, masked, encrypted_value, metadata, created_at, updated_at)
      VALUES (@id, @userId, @category, @label, @detail, @icon, @masked, @encryptedValue, @metadata, @now, @now)
    `;

    await queryBigQuery(sql, {
      id,
      userId: user_id,
      category,
      label,
      detail: detail || "",
      icon: icon || "🔑",
      masked: masked ?? true,
      encryptedValue: encrypted_value || null,
      metadata: JSON.stringify(metadata || {}),
      now,
    });

    return NextResponse.json({
      ok: true,
      id,
      message: "Vault item created",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[vault] POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/vault
 * Remove a vault item.
 * Body: { id, user_id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, user_id } = body;

    if (!id || !user_id) {
      return NextResponse.json({ ok: false, error: "Missing id and user_id" }, { status: 400 });
    }

    const sql = `
      DELETE FROM \`${PROJECT}.${DATASET}.${TABLE}\`
      WHERE id = @id AND user_id = @userId
    `;

    await queryBigQuery(sql, { id, userId: user_id });

    return NextResponse.json({ ok: true, message: "Vault item deleted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[vault] DELETE error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
