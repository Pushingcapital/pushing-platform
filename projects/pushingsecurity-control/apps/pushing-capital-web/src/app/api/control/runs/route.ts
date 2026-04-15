import { getOperatorSession } from "@/lib/control/session";
import { queueAutomationRun } from "@/lib/control/store";
import type { RunMode } from "@/lib/control/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      playbookId?: string;
      mode?: RunMode;
      notes?: string;
    };

    const snapshot = await queueAutomationRun({
      playbookId: payload.playbookId ?? "",
      mode: payload.mode ?? "dry-run",
      notes: payload.notes ?? "",
      requestedBy: session.subject,
    });

    return Response.json({ snapshot });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to queue the run.",
      },
      { status: 400 },
    );
  }
}
