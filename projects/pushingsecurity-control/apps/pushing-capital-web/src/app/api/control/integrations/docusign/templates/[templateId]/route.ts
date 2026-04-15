import { getOperatorSession } from "@/lib/control/session";
import { readSecretValue } from "@/lib/control/store";
import { getDocuSignTemplate } from "@/lib/providers/docusign";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      templateId: string;
    }>;
  },
) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await context.params;

  try {
    const result = await getDocuSignTemplate({
      readSecretValue,
      templateId,
    });

    return Response.json(result);
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to read the requested DocuSign template.",
      },
      { status },
    );
  }
}
