import { getOperatorSession } from "@/lib/control/session";
import { listResolvedDocumentTemplateSummaries } from "@/lib/document-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    templates: await listResolvedDocumentTemplateSummaries(),
  });
}
