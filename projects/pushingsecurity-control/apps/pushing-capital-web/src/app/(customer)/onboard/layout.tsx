import Image from "next/image";

export default function OnboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen">
      {/* Vault background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/vault-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1af0] via-[#0a0f1ae8] to-[#0a0f1af8]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-1">
            <Image
              src="/brand/p-glass-mark.png"
              alt="P"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-cover"
              priority
            />
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            pushingSecurity
          </span>
        </div>
        <a
          href="/"
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
          }}
        >
          ← Back
        </a>
      </nav>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-4 sm:px-8">
        {children}
      </div>
    </main>
  );
}
