import Image from "next/image";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/actions/auth";
import {
  getCredentialWarnings,
  getOperatorSession,
} from "@/lib/control/session";
import { PUSHING_CAPITAL_LOGO_PATH } from "@/lib/document-templates";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function EmployeeLoginPage({
  searchParams,
}: LoginPageProps) {
  const session = await getOperatorSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorParam = params.error;
  const error =
    typeof errorParam === "string" ? decodeURIComponent(errorParam) : null;
  const warnings = getCredentialWarnings();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/12 bg-white/6 p-8 shadow-[0_30px_100px_rgba(5,10,18,0.35)] backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-1.5">
              <Image
                src={PUSHING_CAPITAL_LOGO_PATH}
                alt="Pushing Capital mark"
                width={60}
                height={60}
                className="h-[60px] w-[60px] rounded-xl object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
                Pushing Capital
              </p>
              <p className="mt-1 text-sm text-slate-400">Private operator surface</p>
            </div>
          </div>

          <h1 className="mt-6 max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Internal controls stay behind the branded login.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Vault credentials, document templates, managed browser bundles, run
            queueing, and operator tooling all live here behind a separate auth
            gate.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Templates
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Packets</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Employment, authorization, and DMV documents are managed here.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Identity
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Vision</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Driver-license OCR and review stay inside the control surface.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                Runs
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Queued</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Live and review-first automation launches share one control plane.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-200/15 bg-slate-950/80 p-8 shadow-[0_30px_100px_rgba(2,8,15,0.5)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-emerald-200/70">
                Operator Sign-In
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Enter the control room
              </h2>
            </div>
            <div className="rounded-full border border-emerald-300/25 bg-emerald-300/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-100">
              Private
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-amber-100">
                Bootstrap Required
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/90">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <form action={signInAction} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.28em] text-slate-400">
                Operator Email
              </span>
              <input
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="amssi@pushingcap.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.28em] text-slate-400">
                Operator Password
              </span>
              <input
                className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Internal access password"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-slate-950 transition hover:bg-emerald-200"
            >
              Open dashboard
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-slate-400">
            Once the operator credentials and storage bridge are configured, this
            becomes the control point for document setup and internal automation.
          </p>
        </section>
      </div>
    </main>
  );
}
