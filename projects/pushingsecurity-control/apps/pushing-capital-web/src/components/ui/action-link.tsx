import Link from "next/link";

type ActionLinkProps = {
  href: string;
  label: string;
  tone?: "primary" | "secondary" | "blue";
};

export function ActionLink({
  href,
  label,
  tone = "primary",
}: ActionLinkProps) {
  const className =
    tone === "primary"
      ? "inline-flex min-w-[9.5rem] items-center justify-center rounded-full border border-white/45 bg-[linear-gradient(135deg,#f7fffd_0%,#dbfff5_55%,#b5fff0_100%)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#04111d] shadow-[0_14px_36px_rgba(59,219,195,0.2),inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
      : tone === "blue"
        ? "inline-flex min-w-[9.5rem] items-center justify-center rounded-full border border-sky-200/35 bg-[linear-gradient(135deg,#ecfeff_0%,#dbeafe_42%,#60a5fa_100%)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#03111f] shadow-[0_16px_40px_rgba(59,130,246,0.34),inset_0_1px_0_rgba(255,255,255,0.8)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
        : "inline-flex min-w-[9.5rem] items-center justify-center rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition duration-200 hover:bg-white/12";

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
