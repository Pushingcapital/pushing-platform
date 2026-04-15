import {
  runPracticeTextAgent,
  type PracticeTextMessage,
} from "@/lib/practice-text-agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      messages?: Array<{
        role?: "assistant" | "user";
        content?: string;
      }>;
    };

    const messages: PracticeTextMessage[] = Array.isArray(payload.messages)
      ? payload.messages
          .map(
            (message): PracticeTextMessage => ({
              role: message.role === "assistant" ? "assistant" : "user",
              content: typeof message.content === "string" ? message.content : "",
            }),
          )
          .filter((message) => message.content.trim().length > 0)
      : [];

    if (!messages.length) {
      return Response.json(
        { error: "At least one message is required." },
        { status: 400 },
      );
    }

    return Response.json(runPracticeTextAgent(messages));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run the practice text agent.",
      },
      { status: 400 },
    );
  }
}
