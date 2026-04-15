const funnelSteps = [
  {
    label: "Step 1",
    title: "Start the application",
    detail:
      "Collect the core basics first so the applicant gets into the queue without unnecessary friction.",
  },
  {
    label: "Step 2",
    title: "Verify documents",
    detail:
      "Review the driver license and supporting details before any sensitive downstream action begins.",
  },
  {
    label: "Step 3",
    title: "Prepare the secure handoff",
    detail:
      "Stage the account, access bundle, and operational next steps only after the earlier checks are green.",
  },
  {
    label: "Step 4",
    title: "Complete the final checkpoint",
    detail:
      "Push the case into the final payment, approval, or notary step only when the application is actually ready.",
  },
];

export function OnboardingFunnelPreview() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(2,8,15,0.35)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-emerald-200/80">
            Application Journey
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            The public flow stays simple while the real review gates stay controlled.
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
          Public front page
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {funnelSteps.map((step) => (
          <article
            key={step.label}
            className="rounded-3xl border border-white/8 bg-white/4 p-5"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">
              {step.label}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
