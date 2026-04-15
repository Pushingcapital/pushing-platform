import { runCollaborationTurn } from "@/lib/collaboration-agent-bridge";
import type { CollaborationMessage } from "@/lib/collaboration-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeMessages(
  value: unknown,
): CollaborationMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index): CollaborationMessage | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const content =
        typeof record.content === "string" ? record.content.trim() : "";

      if (!content) {
        return null;
      }

      return {
        id:
          typeof record.id === "string" && record.id.trim().length
            ? record.id
            : `message-${index}`,
        role: record.role === "assistant" ? "assistant" : "user",
        content,
        agent:
          record.agent === "adk" || record.agent === "system"
            ? record.agent
            : undefined,
        runtime:
          typeof record.runtime === "string" && record.runtime.trim().length
            ? record.runtime
            : undefined,
      };
    })
    .filter((message): message is CollaborationMessage => Boolean(message));
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      messages?: unknown;
      sessionId?: unknown;
    };

    const messages = sanitizeMessages(payload.messages);
    const sessionId =
      typeof payload.sessionId === "string" && payload.sessionId.trim().length
        ? payload.sessionId
        : crypto.randomUUID();
    if (!messages.length) {
      return Response.json(
        { error: "At least one message is required." },
        { status: 400 },
      );
    }

    return Response.json(
      await runCollaborationTurn({
        messages,
        sessionId,
      }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run the collaboration browser.",
      },
      { status: 400 },
    );
  }
}
