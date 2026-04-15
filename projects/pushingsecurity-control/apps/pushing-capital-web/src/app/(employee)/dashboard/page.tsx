import { redirect } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import { ControlConsole } from "@/components/control/control-console";
import { getOperatorSession } from "@/lib/control/session";
import { getControlSnapshot } from "@/lib/control/store";
import { formatStorageModeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const session = await getOperatorSession();

  if (!session) {
    redirect("/login");
  }

  const snapshot = await getControlSnapshot();

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-emerald-200/80">
              PushingSecurity Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              Operator dashboard for vault, playbooks, and managed browser bundles
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              The employee route group is where the secure API bridge, browser policy,
              and automation review surfaces live. Storage is currently running in{" "}
              {formatStorageModeLabel(snapshot.meta.storageMode)} mode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-200">
              Signed in as {session.subject}
            </div>
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-100">
              {formatStorageModeLabel(snapshot.meta.storageMode)}
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <ControlConsole
          initialSnapshot={snapshot}
          operatorEmail={session.subject}
        />
      </div>
    </main>
  );
}
