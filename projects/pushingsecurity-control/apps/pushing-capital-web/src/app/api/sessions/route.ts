import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/sessions
 * List active secure browse sessions (in-memory for now).
 *
 * POST /api/sessions
 * Create a new secure browse session.
 * Body: { url, user_id }
 *
 * DELETE /api/sessions
 * Terminate a session.
 * Body: { session_id }
 */

interface SecureSession {
  id: string;
  url: string;
  userId: string;
  startedAt: string;
  lastActivity: string;
  requestCount: number;
  status: "active" | "expired" | "terminated";
}

// In-memory session store (production would use Redis/D1)
const sessions = new Map<string, SecureSession>();

// Auto-expire sessions after 30 minutes of inactivity
function cleanExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - new Date(session.lastActivity).getTime() > 30 * 60 * 1000) {
      session.status = "expired";
      sessions.delete(id);
    }
  }
}

export async function GET() {
  cleanExpired();

  const active = Array.from(sessions.values())
    .filter((s) => s.status === "active")
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  return NextResponse.json({
    ok: true,
    count: active.length,
    sessions: active,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url, user_id } = await req.json();

    if (!url) {
      return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
    }

    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const session: SecureSession = {
      id,
      url,
      userId: user_id || "anonymous",
      startedAt: now,
      lastActivity: now,
      requestCount: 0,
      status: "active",
    };

    sessions.set(id, session);

    return NextResponse.json({
      ok: true,
      session,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
    }

    const session = sessions.get(session_id);
    if (!session) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    session.status = "terminated";
    sessions.delete(session_id);

    return NextResponse.json({
      ok: true,
      message: "Session terminated",
      session,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
