import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pushing Capital | Four Panel Canvas",
  description: "Blank four-panel canvas.",
};

export default function CollaborationPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="grid min-h-screen grid-cols-2 grid-rows-2">
        <div className="border border-neutral-200" aria-label="Panel 1" />
        <div className="border border-neutral-200" aria-label="Panel 2" />
        <div className="border border-neutral-200" aria-label="Panel 3" />
        <div className="border border-neutral-200" aria-label="Panel 4" />
      </section>
    </main>
  );
}
