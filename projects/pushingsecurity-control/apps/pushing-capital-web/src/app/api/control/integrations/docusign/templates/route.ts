import { getOperatorSession } from "@/lib/control/session";
import { readSecretValue } from "@/lib/control/store";
import { listDocuSignTemplates } from "@/lib/providers/docusign";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getTemplateCount(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listDocuSignTemplates({
      readSecretValue,
      count: getTemplateCount(searchParams.get("count")),
      searchText: searchParams.get("searchText"),
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to list DocuSign templates.",
      },
      { status: 500 },
    );
  }
}
