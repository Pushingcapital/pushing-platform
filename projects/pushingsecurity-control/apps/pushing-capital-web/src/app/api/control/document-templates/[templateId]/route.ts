import { getOperatorSession } from "@/lib/control/session";
import { getResolvedDocumentTemplateById } from "@/lib/document-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOperatorSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await context.params;
  const template = await getResolvedDocumentTemplateById(templateId);

  if (!template) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ template });
}
