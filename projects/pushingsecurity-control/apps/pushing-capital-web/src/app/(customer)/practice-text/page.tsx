import type { Metadata } from "next";

import { PracticeTextConsole } from "@/components/forms/practice-text-console";
import { ActionLink } from "@/components/ui/action-link";

export const metadata: Metadata = {
  title: "Pushing Capital | Push P",
  description:
    "Text P through the first public conversational surface and let the hidden routing layer prepare the company-side structure.",
};

export default function PracticeTextPage() {
  return (
    <main className="relative overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-3rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(55,245,241,0.24),rgba(55,245,241,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-wrap items-end justify-between gap-4 rounded-[2.2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] px-6 py-6 shadow-[0_30px_90px_rgba(3,10,18,0.34)] backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
              Pushing P
            </p>
            <h1 className="mt-3 text-[clamp(2.7rem,6vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
              Push P.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Text P the same way a client would. He keeps the conversation simple,
              listens for what matters, and prepares the routing logic quietly in the
              background.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionLink href="/onboard" label="Formal onboarding" tone="secondary" />
            <ActionLink href="/collab" label="Collaboration browser" tone="blue" />
            <ActionLink href="#push-p-input" label="Push P!" tone="blue" />
            <ActionLink href="/" label="Back to landing" tone="primary" />
          </div>
        </section>

        <PracticeTextConsole />
      </div>
    </main>
  );
}
