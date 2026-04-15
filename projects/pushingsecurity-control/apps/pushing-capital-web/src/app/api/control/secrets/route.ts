import { getOperatorSession } from "@/lib/control/session";
import { upsertSecret } from "@/lib/control/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      provider?: string;
      label?: string;
      keyName?: string;
      secretValue?: string;
      notes?: string;
      scopes?: string[];
    };
    const snapshot = await upsertSecret({
      provider: payload.provider ?? "",
      label: payload.label ?? "",
      keyName: payload.keyName ?? "",
      secretValue: payload.secretValue ?? "",
      notes: payload.notes ?? "",
      scopes: payload.scopes ?? [],
    });

    return Response.json({ snapshot });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to store provider key.",
      },
      { status: 400 },
    );
  }
}
