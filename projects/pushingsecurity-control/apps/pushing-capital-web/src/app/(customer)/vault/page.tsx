"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VaultDashboard from "@/components/vault/vault-dashboard";

function VaultContent() {
  const params = useSearchParams();
  const user = params.get("user") || undefined;
  return <VaultDashboard userName={user} />;
}

export default function VaultPage() {
  return (
    <Suspense>
      <VaultContent />
    </Suspense>
  );
}
