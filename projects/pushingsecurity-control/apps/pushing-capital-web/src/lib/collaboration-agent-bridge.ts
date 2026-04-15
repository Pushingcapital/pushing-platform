import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type {
  CollaborationMessage,
  CollaborationResponse,
  CollaborationTurn,
} from "@/lib/collaboration-types";

const execFileAsync = promisify(execFile);

const ADK_BRIDGE_PYTHON = "/Users/emmanuelhaddad/MyPrivateSpace/venv311/bin/python";
const ADK_BRIDGE_PATH = "/Users/emmanuelhaddad/bin/p_adk_ingest_agent.py";

function buildTranscript(messages: CollaborationMessage[]) {
  return messages
    .slice(-12)
    .map((message) => {
      const speaker =
        message.role === "user"
          ? "Manny"
          : message.agent === "adk"
            ? "Agent"
            : "System";

      return `${speaker}: ${message.content.trim()}`;
    })
    .join("\n\n");
}

function buildAdkBrowserPrompt(messages: CollaborationMessage[]) {
  const transcript = buildTranscript(messages);
  return [
    "You are the ADK ingest agent inside Manny's lightweight React browser.",
    "Tell Manny what you see, what should be saved, what fields or structure matter, and what the next move should be.",
    "Keep the answer short, direct, and collaborative.",
    "Conversation transcript:",
    transcript,
    "Reply to Manny's latest message.",
  ].join("\n\n");
}

function parseJsonFromStdout(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error("The agent returned no output.");
  }

  const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      return JSON.parse(lines[index]) as Record<string, unknown>;
    } catch {
      continue;
    }
  }

  return JSON.parse(trimmed) as Record<string, unknown>;
}

async function runAdkBridge(
  messages: CollaborationMessage[],
  sessionId: string,
): Promise<CollaborationTurn> {
  const prompt = buildAdkBrowserPrompt(messages);
  const { stdout, stderr } = await execFileAsync(
    ADK_BRIDGE_PYTHON,
    [ADK_BRIDGE_PATH, "--prompt", prompt, "--session-id", sessionId],
    {
      timeout: 180_000,
      maxBuffer: 2_000_000,
    },
  );
  const result = parseJsonFromStdout(stdout);

  if (result.status !== "success") {
    const detail =
      typeof result.error === "string" && result.error.trim().length
        ? result.error
        : stderr.trim() || "The ADK agent was unavailable.";
    throw new Error(detail);
  }

  return {
    agent: "adk",
    answer:
      typeof result.final_text === "string" && result.final_text.trim().length
        ? result.final_text.trim()
        : "The ADK agent did not return a message.",
    runtime: "New agent · ADK",
  };
}

export async function runCollaborationTurn(input: {
  messages: CollaborationMessage[];
  sessionId: string;
}): Promise<CollaborationResponse> {
  const { messages, sessionId } = input;

  if (!messages.length) {
    throw new Error("At least one message is required.");
  }

  const turns: CollaborationTurn[] = [await runAdkBridge(messages, sessionId)];

  return {
    sessionId,
    turns,
  };
}
