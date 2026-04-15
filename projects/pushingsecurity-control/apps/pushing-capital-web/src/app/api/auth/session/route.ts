import { getOperatorSession } from "@/lib/control/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ authenticated: false });
  }

  return Response.json({
    authenticated: true,
    subject: session.subject,
    expiresAt: session.expiresAt,
  });
}
