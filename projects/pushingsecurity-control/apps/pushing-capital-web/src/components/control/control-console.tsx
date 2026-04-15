"use client";

import { type FormEvent, useState, useTransition } from "react";

import type {
  ControlSnapshot,
  ManagedBookmark,
  PlaybookStatus,
  PlaybookSurface,
  RunMode,
} from "@/lib/control/types";
import { formatDateTime, formatStorageModeLabel } from "@/lib/utils";

type ControlConsoleProps = {
  initialSnapshot: ControlSnapshot;
  operatorEmail: string;
};

const panelClass =
  "rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(2,8,15,0.35)]";
const labelClass =
  "mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400";
const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:bg-white/10";
const textareaClass = `${inputClass} min-h-[136px] resize-y`;
const subtleButtonClass =
  "rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white transition hover:bg-white/12";
const primaryButtonClass =
  "rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-500";

function splitMultiline(value: string) {
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseBookmarks(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length === 3) {
        return {
          folder: parts[0],
          title: parts[1],
          url: parts[2],
        } satisfies ManagedBookmark;
      }

      if (parts.length === 2) {
        return {
          folder: "Managed",
          title: parts[0],
          url: parts[1],
        } satisfies ManagedBookmark;
      }

      throw new Error(
        "Bookmarks must use 'Folder | Title | URL' or 'Title | URL' per line.",
      );
    });
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "None linked";
}

export function ControlConsole({
  initialSnapshot,
  operatorEmail,
}: ControlConsoleProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function pushMutation(
    url: string,
    payload: object,
    successMessage: string,
  ) {
    setError(null);
    setNotice(null);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as
      | { snapshot: ControlSnapshot }
      | { error: string };

    if (!response.ok || !("snapshot" in result)) {
      throw new Error(
        "error" in result ? result.error : "The control console request failed.",
      );
    }

    startTransition(() => {
      setSnapshot(result.snapshot);
      setNotice(successMessage);
    });
  }

  async function handleSecretSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await pushMutation(
        "/api/control/secrets",
        {
          provider: String(formData.get("provider") ?? ""),
          label: String(formData.get("label") ?? ""),
          keyName: String(formData.get("keyName") ?? ""),
          secretValue: String(formData.get("secretValue") ?? ""),
          notes: String(formData.get("notes") ?? ""),
          scopes: splitMultiline(String(formData.get("scopes") ?? "")),
        },
        "Provider key stored in the encrypted vault.",
      );
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to store provider key.",
      );
    }
  }

  async function handlePlaybookSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await pushMutation(
        "/api/control/playbooks",
        {
          name: String(formData.get("name") ?? ""),
          surface: String(formData.get("surface") ?? "identity") as PlaybookSurface,
          status: String(formData.get("status") ?? "draft") as PlaybookStatus,
          description: String(formData.get("description") ?? ""),
          providerRefs: splitMultiline(String(formData.get("providerRefs") ?? "")),
          steps: splitMultiline(String(formData.get("steps") ?? "")),
        },
        "Automation playbook saved.",
      );
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save playbook.",
      );
    }
  }

  async function handleBrowserBundleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await pushMutation(
        "/api/control/browser-bundles",
        {
          name: String(formData.get("name") ?? ""),
          description: String(formData.get("description") ?? ""),
          homepageUrl: String(formData.get("homepageUrl") ?? ""),
          startupUrls: splitMultiline(String(formData.get("startupUrls") ?? "")),
          extensionIds: splitMultiline(
            String(formData.get("extensionIds") ?? ""),
          ),
          managedBookmarks: parseBookmarks(
            String(formData.get("managedBookmarks") ?? ""),
          ),
        },
        "Browser policy bundle saved.",
      );
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save browser bundle.",
      );
    }
  }

  async function handleRunSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await pushMutation(
        "/api/control/runs",
        {
          playbookId: String(formData.get("playbookId") ?? ""),
          mode: String(formData.get("mode") ?? "dry-run") as RunMode,
          notes: String(formData.get("notes") ?? ""),
        },
        "Automation run queued.",
      );
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to queue the automation run.",
      );
    }
  }

  async function handlePackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Simulate frontend UI behavior for sending the pack.
    const packType = String(formData.get("packType") ?? "");
    const email = String(formData.get("email") ?? "");
    
    startTransition(() => {
      setNotice(`Queued ${packType} dispatch for ${email}. Document templates are being bundled.`);
    });
    
    form.reset();
  }

  const metrics = [
    {
      label: "Vault Secrets",
      value: String(snapshot.secrets.length).padStart(2, "0"),
      detail: "Encrypted provider credentials",
    },
    {
      label: "Playbooks",
      value: String(snapshot.playbooks.length).padStart(2, "0"),
      detail: "Automation definitions",
    },
    {
      label: "Browser Bundles",
      value: String(snapshot.browserBundles.length).padStart(2, "0"),
      detail: "Managed Chrome policy sets",
    },
    {
      label: "Queued Runs",
      value: String(snapshot.runs.length).padStart(2, "0"),
      detail: "Dry-run and live launch history",
    },
  ];

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-8">
        {snapshot.meta.warnings.length > 0 ? (
          <section className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-amber-100">
              Setup Warnings
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/90">
              {snapshot.meta.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {notice ? (
          <section className="rounded-[1.5rem] border border-emerald-300/25 bg-emerald-300/10 px-5 py-4 text-sm text-emerald-50">
            {notice}
          </section>
        ) : null}

        {error ? (
          <section className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className={panelClass}>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                {metric.label}
              </p>
              <p className="mt-4 text-4xl font-semibold text-white">
                {metric.value}
              </p>
              <p className="mt-3 text-sm text-slate-400">{metric.detail}</p>
            </div>
          ))}
        </section>

        <section className={panelClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
                Vault
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Store provider credentials
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Use <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">docusign</code>{" "}
                with <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">DOCUSIGN_CLIENT_ID</code>{" "}
                plus either <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">DOCUSIGN_CLIENT_SECRET</code>{" "}
                for Authorization Code or <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">DOCUSIGN_PRIVATE_KEY</code>{" "}
                for JWT, or <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">google-workspace</code>{" "}
                with <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">GOOGLE_WORKSPACE_CLIENT_EMAIL</code>{" "}
                and <code className="rounded bg-slate-950/70 px-2 py-1 text-xs">GOOGLE_WORKSPACE_PRIVATE_KEY</code>.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.26em] text-slate-300">
              {snapshot.meta.encryptionReady
                ? `Encryption ready · ${formatStorageModeLabel(snapshot.meta.storageMode)}`
                : "Awaiting master key"}
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSecretSubmit}>
            <label className="block">
              <span className={labelClass}>Provider</span>
              <input className={inputClass} name="provider" placeholder="google-workspace or docusign" />
            </label>
            <label className="block">
              <span className={labelClass}>Label</span>
              <input className={inputClass} name="label" placeholder="Workspace service account or DocuSign OAuth app" />
            </label>
            <label className="block">
              <span className={labelClass}>Key Name</span>
              <input className={inputClass} name="keyName" placeholder="DOCUSIGN_CLIENT_ID, DOCUSIGN_PRIVATE_KEY, or GOOGLE_WORKSPACE_CLIENT_EMAIL" />
            </label>
            <label className="block">
              <span className={labelClass}>Scopes</span>
              <input className={inputClass} name="scopes" placeholder="users.read, users.write" />
            </label>
            <label className="block md:col-span-2">
              <span className={labelClass}>Secret Value</span>
              <input
                className={inputClass}
                type="password"
                name="secretValue"
                placeholder="Paste the provider key"
              />
            </label>
            <label className="block md:col-span-2">
              <span className={labelClass}>Notes</span>
              <textarea
                className={textareaClass}
                name="notes"
                placeholder="Rotation notes, ownership, callback URL requirements, or operational constraints."
              />
            </label>
            <div className="md:col-span-2">
              <button className={primaryButtonClass} disabled={isPending} type="submit">
                Save encrypted secret
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {snapshot.secrets.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/12 px-5 py-6 text-sm text-slate-400">
                No provider keys stored yet.
              </div>
            ) : (
              snapshot.secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="rounded-3xl border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">{secret.label}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {secret.provider} · {secret.keyName}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                      Fingerprint {secret.fingerprint}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {secret.notes || "No notes recorded."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Scopes: {formatList(secret.scopes)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
            Playbooks
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Define automation control tracks
          </h2>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handlePlaybookSubmit}>
            <label className="block">
              <span className={labelClass}>Playbook Name</span>
              <input className={inputClass} name="name" placeholder="Phone possession gate" />
            </label>
            <label className="block">
              <span className={labelClass}>Surface</span>
              <select className={inputClass} name="surface" defaultValue="identity">
                <option value="identity">Identity</option>
                <option value="workspace">Workspace</option>
                <option value="browser">Browser</option>
                <option value="notary">Notary</option>
                <option value="security">Security</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Status</span>
              <select className={inputClass} name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Provider Refs</span>
              <input className={inputClass} name="providerRefs" placeholder="google-workspace, docusign-notary" />
            </label>
            <label className="block md:col-span-2">
              <span className={labelClass}>Description</span>
              <textarea
                className={textareaClass}
                name="description"
                placeholder="Describe the decision gate, side effects, and handoff point."
              />
            </label>
            <label className="block md:col-span-2">
              <span className={labelClass}>Steps</span>
              <textarea
                className={textareaClass}
                name="steps"
                placeholder="One step per line"
              />
            </label>
            <div className="md:col-span-2">
              <button className={primaryButtonClass} disabled={isPending} type="submit">
                Save playbook
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {snapshot.playbooks.map((playbook) => (
              <article
                key={playbook.id}
                className="rounded-3xl border border-white/8 bg-white/4 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">{playbook.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {playbook.surface} · {playbook.status}
                    </p>
                  </div>
                  <button className={subtleButtonClass} type="button">
                    {playbook.providerRefs.length} refs
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {playbook.description}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  {playbook.steps.map((step) => (
                    <div key={step} className="rounded-2xl bg-slate-950/50 px-4 py-3">
                      {step}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className={panelClass}>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
            Browser Bundles
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Wire the Chrome bookmark and startup policy here
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This replaces the placeholder-only setup from the older repo. Save
            homepage, startup URLs, extension IDs, and the exact managed bookmark map in one bundle.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleBrowserBundleSubmit}>
            <label className="block">
              <span className={labelClass}>Bundle Name</span>
              <input className={inputClass} name="name" placeholder="Field Onboarding Default" />
            </label>
            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                className={textareaClass}
                name="description"
                placeholder="Who this policy bundle serves and what it configures."
              />
            </label>
            <label className="block">
              <span className={labelClass}>Homepage URL</span>
              <input className={inputClass} name="homepageUrl" placeholder="https://admin.google.com" />
            </label>
            <label className="block">
              <span className={labelClass}>Startup URLs</span>
              <textarea
                className={textareaClass}
                name="startupUrls"
                placeholder="One URL per line"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Extension IDs</span>
              <textarea
                className={textareaClass}
                name="extensionIds"
                placeholder="One extension ID per line"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Managed Bookmarks</span>
              <textarea
                className={textareaClass}
                name="managedBookmarks"
                placeholder="Folder | Title | URL"
              />
            </label>
            <button className={primaryButtonClass} disabled={isPending} type="submit">
              Save browser bundle
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {snapshot.browserBundles.map((bundle) => (
              <article
                key={bundle.id}
                className="rounded-3xl border border-white/8 bg-white/4 p-5"
              >
                <h3 className="text-lg font-medium text-white">{bundle.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {bundle.description}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Homepage
                </p>
                <p className="mt-1 break-all text-sm text-slate-200">{bundle.homepageUrl}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Startup URLs
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-300">
                      {bundle.startupUrls.map((url) => (
                        <li key={url} className="rounded-2xl bg-slate-950/50 px-4 py-3 break-all">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Extensions
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-300">
                      {bundle.extensionIds.map((extensionId) => (
                        <li
                          key={extensionId}
                          className="rounded-2xl bg-slate-950/50 px-4 py-3 break-all"
                        >
                          {extensionId}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Managed bookmarks
                  </p>
                  <div className="mt-2 space-y-2">
                    {bundle.managedBookmarks.map((bookmark) => (
                      <div
                        key={`${bookmark.folder}-${bookmark.title}-${bookmark.url}`}
                        className="rounded-2xl bg-slate-950/50 px-4 py-3 text-sm text-slate-300"
                      >
                        <span className="text-emerald-200">{bookmark.folder}</span> ·{" "}
                        {bookmark.title} · {bookmark.url}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
            Document Packs
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Dispatch onboarding arrays
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Send unified document collections to recipients. Includes automated tracking,
            reminders, and webhook completion mirroring back into the data warehouse.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handlePackSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className={labelClass}>Document Pack Set</span>
                <select className={inputClass} name="packType" defaultValue="">
                  <option value="" disabled>Select document array</option>
                  <option value="W-2 Employee Onboarding">W-2 Employee Onboarding Array</option>
                  <option value="1099 Independent Contractor">1099 Independent Contractor Array</option>
                  <option value="Client Authorization">Client/User Authorization Array</option>
                  <option value="Security Operations Only">Security Operations Only Array</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Target First Name</span>
                <input className={inputClass} name="firstName" placeholder="Jane" required />
              </label>

              <label className="block">
                <span className={labelClass}>Target Last Name</span>
                <input className={inputClass} name="lastName" placeholder="Doe" required />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Target Email</span>
              <input className={inputClass} type="email" name="email" placeholder="jane@example.com" required />
            </label>

            <label className="block">
              <span className={labelClass}>Dispatch Notes (Optional)</span>
              <textarea
                className={`${inputClass} min-h-[90px]`}
                name="notes"
                placeholder="Include deal references, background context, or instructions for the memory orchestrator."
              />
            </label>

            <button className={primaryButtonClass} disabled={isPending} type="submit">
              Dispatch Secure Array
            </button>
          </form>

          {/* Dummy visual layout for dispatched arrays to show intent */}
          <div className="mt-8 space-y-4">
              <article className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      1099 Independent Contractor Array
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Dispatched · Pending Signature
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-100">
                    JUST NOW
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Target: sysadmin-consultant@example.com
                </p>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  Includes: 1099 Agreement, Employee Confidentiality, Direct Deposit
                </div>
              </article>
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80">
            Run Queue
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Launch a dry run or operator-reviewed live run
          </h2>

          <form className="mt-6 space-y-4" onSubmit={handleRunSubmit}>
            <label className="block">
              <span className={labelClass}>Playbook</span>
              <select className={inputClass} name="playbookId" defaultValue="">
                <option value="" disabled>
                  Select playbook
                </option>
                {snapshot.playbooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Mode</span>
              <select className={inputClass} name="mode" defaultValue="dry-run">
                <option value="dry-run">Dry run</option>
                <option value="live">Live run</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Operator Notes</span>
              <textarea
                className={textareaClass}
                name="notes"
                placeholder={`Run context, applicant identifier, or ticket URL. Operator: ${operatorEmail}`}
              />
            </label>
            <button className={primaryButtonClass} disabled={isPending} type="submit">
              Queue run
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {snapshot.runs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/12 px-5 py-6 text-sm text-slate-400">
                No runs queued yet.
              </div>
            ) : (
              snapshot.runs.map((run) => (
                <article
                  key={run.id}
                  className="rounded-3xl border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {run.playbookName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {run.mode} · {run.status}
                      </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                      {formatDateTime(run.requestedAt)}
                  </div>
                </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Requested by {run.requestedBy}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {run.notes || "No notes attached."}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
