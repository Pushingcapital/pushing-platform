"use client";

import { useMemo, useState } from "react";

import type {
  PracticeTextMessage,
  PracticeTextSnapshot,
} from "@/lib/practice-text-agent";

const composerClass =
  "w-full rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:bg-slate-950";

const seededScenarios = [
  "Hi, my name is Manny. I need help transporting a 2020 BMW X5 from Phoenix to Beverly Hills. My number is 310-555-0142.",
  "I need funding for my business and I want to get lender-ready. You can reach me at manny@example.com.",
  "I am a subcontractor and I cover Los Angeles and Orange County for inspections.",
  "We want to buy software for workflow automation for Vicasso Motorsports.",
  "We need a programmer and marketing help for a new website and growth campaign for our company.",
];

type PracticeResponse =
  | {
      reply: string;
      snapshot: PracticeTextSnapshot;
    }
  | {
      error: string;
    };

function formatLabel(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function PracticeTextConsole() {
  const [messages, setMessages] = useState<PracticeTextMessage[]>([
    {
      role: "assistant",
      content:
        "P here. Tell me what you need, and I will help while the company-side routing gets prepared behind the scenes.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [snapshot, setSnapshot] = useState<PracticeTextSnapshot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/practice-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const result = (await response.json()) as PracticeResponse;

      if (!response.ok || !("reply" in result)) {
        throw new Error(
          "error" in result ? result.error : "Unable to run P right now.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.reply,
        },
      ]);
      setSnapshot(result.snapshot);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to run P right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-4 shadow-[0_30px_90px_rgba(3,10,18,0.34)] backdrop-blur-xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#08121f] p-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                Text Surface
              </p>
              <h2 className="mt-2 text-lg text-white">Push P</h2>
            </div>
            <div className="rounded-full border border-sky-300/25 bg-sky-400/12 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-sky-100">
              Live text flow
            </div>
          </div>

          <div className="mt-4 flex max-h-[30rem] min-h-[30rem] flex-col gap-3 overflow-y-auto rounded-[1.7rem] bg-black/20 p-3">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "self-start border border-white/10 bg-white/8 text-slate-100"
                    : "self-end border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(219,255,245,0.18),rgba(80,240,220,0.12))] text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {seededScenarios.map((scenario) => (
              <button
                key={scenario}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/10"
                onClick={() => void sendMessage(scenario)}
                type="button"
              >
                Try scenario
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
              autoFocus
              className={`${composerClass} min-h-28 resize-none`}
              id="push-p-input"
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder="Say hello, ask for help, or tell P what you need."
              value={draft}
            />
            <button
              className="inline-flex items-center justify-center rounded-full border border-sky-200/35 bg-[linear-gradient(135deg,#ecfeff_0%,#dbeafe_42%,#60a5fa_100%)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#03111f] shadow-[0_16px_40px_rgba(59,130,246,0.34),inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || !draft.trim()}
              type="submit"
            >
              {isSubmitting ? "P is listening..." : "Push P!"}
            </button>
          </form>

          {error ? (
            <p className="mt-3 text-sm text-rose-300">{error}</p>
          ) : null}
        </div>
      </article>

      <article className="rounded-[2.4rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
          Behind the scenes
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          What P is capturing and routing
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          This is the first native text surface for the flagship conversational agent.
          P listens, captures the likely fields, and shows the workflow handoff so
          the client does not have to repeat themselves.
        </p>

        {snapshot ? (
          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  Lane
                </p>
                <p className="mt-2 text-lg text-white">
                  {formatLabel(snapshot.laneClassification.serviceFamily)} /{" "}
                  {formatLabel(snapshot.laneClassification.routedServiceSlug)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Audience: {formatLabel(snapshot.laneClassification.intakeAudience)}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Login: {snapshot.laneClassification.recommendedLoginPath}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Workflow: {snapshot.laneClassification.recommendedWorkflowKey}
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  Readiness
                </p>
                <p className="mt-2 text-lg text-white">
                  {snapshot.readyForRouting ? "Ready for routing" : "Needs one more move"}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Confidence: {Math.round(snapshot.laneClassification.confidence * 100)}%
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Reason: {snapshot.laneClassification.reason}
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                Captured fields
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {Object.entries(snapshot.capturedFields).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/8 bg-white/6 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                      {formatLabel(key)}
                    </p>
                    <p className="mt-2 text-sm text-white">{value || "Not captured yet"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  Missing fields
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {snapshot.missingFields.length ? (
                    snapshot.missingFields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100"
                      >
                        {formatLabel(field)}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                      Ready
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  Summary
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {snapshot.transcriptSummary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/12 bg-black/12 p-6 text-sm leading-7 text-slate-300">
            Start texting P and I will show the hidden routing, captured fields,
            login target, and workflow decision here.
          </div>
        )}
      </article>
    </section>
  );
}
