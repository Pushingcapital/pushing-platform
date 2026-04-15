import { getOperatorSession } from "@/lib/control/session";
import { readSecretValue } from "@/lib/control/store";
import { getGoogleWorkspaceStatus } from "@/lib/providers/google-workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getGoogleWorkspaceStatus({
      readSecretValue,
    });

    return Response.json({ status });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to build Google Workspace readiness status.",
      },
      { status: 500 },
    );
  }
}
