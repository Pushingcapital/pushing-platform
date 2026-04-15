import { getOperatorSession } from "@/lib/control/session";
import { upsertPlaybook } from "@/lib/control/store";
import type { PlaybookStatus, PlaybookSurface } from "@/lib/control/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      surface?: PlaybookSurface;
      status?: PlaybookStatus;
      description?: string;
      providerRefs?: string[];
      steps?: string[];
    };

    const snapshot = await upsertPlaybook({
      name: payload.name ?? "",
      surface: payload.surface ?? "identity",
      status: payload.status ?? "draft",
      description: payload.description ?? "",
      providerRefs: payload.providerRefs ?? [],
      steps: payload.steps ?? [],
    });

    return Response.json({ snapshot });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to save playbook.",
      },
      { status: 400 },
    );
  }
}
