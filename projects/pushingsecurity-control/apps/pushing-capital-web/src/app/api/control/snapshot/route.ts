import { getOperatorSession } from "@/lib/control/session";
import { getControlSnapshot } from "@/lib/control/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getControlSnapshot();

  return Response.json({ snapshot });
}
