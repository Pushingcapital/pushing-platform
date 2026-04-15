"use server";

import { redirect } from "next/navigation";

import {
  clearOperatorSession,
  createOperatorSession,
  verifyOperatorCredentials,
} from "@/lib/control/session";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const verification = await verifyOperatorCredentials(email, password);

  if (!verification.ok) {
    redirect(
      `/login?error=${encodeURIComponent(verification.message ?? "Sign-in failed.")}`,
    );
  }

  await createOperatorSession(email);
  redirect("/dashboard");
}

export async function signOutAction() {
  await clearOperatorSession();
  redirect("/login");
}
