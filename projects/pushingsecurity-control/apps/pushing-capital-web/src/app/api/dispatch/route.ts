import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL = process.env.DISPATCH_ORCHESTRATOR_URL || "http://localhost:8787";
const DISPATCH_SECRET = process.env.DISPATCH_SECRET || "ps-vault-dispatch-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, params, fingerprint } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    // Forward to orchestrator
    const response = await fetch(`${ORCHESTRATOR_URL}/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: DISPATCH_SECRET,
        action,
        params,
        fingerprint,
      }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[dispatch] Error:", message);
    return NextResponse.json(
      { error: "Dispatch failed", detail: message },
      { status: 500 }
    );
  }
}
