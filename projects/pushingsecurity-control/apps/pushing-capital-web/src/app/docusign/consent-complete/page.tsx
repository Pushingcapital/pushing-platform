export default function DocuSignConsentCompletePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-slate-50">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/40">
        <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80">
          DocuSign
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Consent captured
        </h1>
        <p className="mt-6 text-base leading-7 text-slate-300">
          You can close this tab and return to the Pushing Capital control
          workspace. This page exists so local JWT consent and future OAuth
          callbacks have a stable redirect target during setup.
        </p>
      </div>
    </main>
  );
}
