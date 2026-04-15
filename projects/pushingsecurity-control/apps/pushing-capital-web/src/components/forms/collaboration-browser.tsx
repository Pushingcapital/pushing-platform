"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  CollaborationMessage,
  CollaborationResponse,
} from "@/lib/collaboration-types";

const composerClass =
  "w-full rounded-[1.8rem] border border-white/12 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/50 focus:bg-slate-950";

const quickPrompts = [
  "Help me organize this idea and tell me what should be saved.",
  "Turn this conversation into the next action and the right structure.",
  "Tell me what fields matter and what is still missing.",
  "Look at this direction and tell me the clearest next move.",
];

type CollaborationResult =
  | CollaborationResponse
  | {
      error: string;
    };

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export function CollaborationBrowser() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<CollaborationMessage[]>([
    {
      id: "intro-adk",
      role: "assistant",
      agent: "adk",
      runtime: "Agent · ADK",
      content:
        "I’m here. Tell me what you’re building or thinking through, and I’ll help organize it, save what matters, and point to the next move.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "pushing-capital-agent-session";
    const existing =
      typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    const nextValue = existing && existing.trim().length ? existing : makeId("agent");

    if (typeof window !== "undefined" && !existing) {
      window.localStorage.setItem(storageKey, nextValue);
    }

    setSessionId(nextValue);
  }, []);

  const visibleMessages = useMemo(() => messages.slice(-18), [messages]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || !sessionId) {
      return;
    }

    const outgoing: CollaborationMessage = {
      id: makeId("user"),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, outgoing];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          sessionId,
        }),
      });

      const result = (await response.json()) as CollaborationResult;

      if (!response.ok || !("turns" in result) || !result.turns.length) {
        throw new Error("error" in result ? result.error : "Unable to reach the agent.");
      }

      const [turn] = result.turns;
      setMessages((current) => [
        ...current,
        {
          id: makeId("adk"),
          role: "assistant",
          agent: "adk",
          runtime: turn.runtime,
          content: turn.answer,
        },
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reach the agent.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-4 shadow-[0_30px_90px_rgba(3,10,18,0.34)] backdrop-blur-xl">
        <div className="rounded-[2.2rem] border border-white/10 bg-[#08121f] p-4">
          <div className="border-b border-white/8 pb-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
              Agent browser
            </p>
            <h2 className="mt-2 text-xl text-white">New agent</h2>
          </div>

          <div className="mt-4 flex max-h-[38rem] min-h-[38rem] flex-col gap-3 overflow-y-auto rounded-[1.9rem] bg-black/18 p-3">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-[1.45rem] border px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "self-end border-emerald-200/20 bg-[linear-gradient(135deg,rgba(220,252,231,0.16),rgba(16,185,129,0.16))] text-white"
                    : "self-start border-emerald-300/18 bg-[linear-gradient(135deg,rgba(220,252,231,0.14),rgba(16,185,129,0.1))] text-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300/90">
                    {message.role === "user" ? "Manny" : "Agent"}
                  </p>
                  {message.runtime ? (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {message.runtime}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/10"
                onClick={() => void sendMessage(prompt)}
                type="button"
              >
                Quick prompt
              </button>
            ))}
          </div>

          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            <textarea
              className={`${composerClass} min-h-32 resize-none`}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder="Tell the agent what you’re building, what you found, or what you need organized."
              value={draft}
            />
            <button
              className="inline-flex items-center justify-center rounded-full border border-emerald-200/35 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_42%,#34d399_100%)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#03111f] shadow-[0_16px_40px_rgba(16,185,129,0.28),inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || !draft.trim() || !sessionId}
              type="submit"
            >
              {isSubmitting ? "Agent is thinking..." : "Ask agent"}
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>
      </article>

      <article className="rounded-[2.6rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
          Direct collaboration
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          One agent, one thread
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          This version keeps it simple. The agent reads the thread, tells you what
          it sees, helps organize the structure, and points you to the next move.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="rounded-[1.7rem] border border-white/10 bg-black/18 p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
              Session
            </p>
            <p className="mt-3 break-all font-mono text-sm text-white">
              {sessionId || "Preparing agent session..."}
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-emerald-300/16 bg-[linear-gradient(160deg,rgba(220,252,231,0.1),rgba(16,185,129,0.08))] p-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-emerald-100">
              Agent role
            </p>
            <p className="mt-3 text-lg text-white">Structure and memory</p>
            <p className="mt-2 text-sm leading-7 text-slate-200">
              It looks at what you say, highlights what should be saved, and helps
              turn ideas into clean structure without dragging extra surfaces into the page.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
