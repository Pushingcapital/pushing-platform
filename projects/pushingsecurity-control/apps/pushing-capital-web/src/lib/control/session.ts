import "server-only";

import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

import type { OperatorSession } from "@/lib/control/types";

const SESSION_COOKIE_NAME = "pushingsecurity_control_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return (
    process.env.PUSHINGSECURITY_SESSION_SECRET ??
    process.env.PUSHINGSECURITY_MASTER_KEY ??
    null
  );
}

function digestValue(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEquals(left: string, right: string) {
  return timingSafeEqual(digestValue(left), digestValue(right));
}

function encodeSession(payload: OperatorSession) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()!)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

function decodeSession(token: string | undefined) {
  if (!token || !getSessionSecret()) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac("sha256", getSessionSecret()!)
    .update(encoded)
    .digest("base64url");

  if (!safeEquals(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as OperatorSession;

    if (Date.parse(payload.expiresAt) <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getCredentialWarnings() {
  const warnings: string[] = [];

  if (!process.env.PUSHINGSECURITY_ADMIN_EMAIL) {
    warnings.push("Set PUSHINGSECURITY_ADMIN_EMAIL before inviting operators.");
  }

  if (!process.env.PUSHINGSECURITY_ADMIN_PASSWORD) {
    warnings.push(
      "Set PUSHINGSECURITY_ADMIN_PASSWORD before using the internal sign-in form.",
    );
  }

  if (!getSessionSecret()) {
    warnings.push(
      "Set PUSHINGSECURITY_SESSION_SECRET to sign operator sessions securely.",
    );
  }

  return warnings;
}

export function hasCredentialBootstrap() {
  return getCredentialWarnings().length === 0;
}

export async function verifyOperatorCredentials(
  email: string,
  password: string,
) {
  const warnings = getCredentialWarnings();

  if (warnings.length > 0) {
    return {
      ok: false,
      message: warnings[0],
    };
  }

  if (!email || !password) {
    return {
      ok: false,
      message: "Enter the operator email and password.",
    };
  }

  const expectedEmail = process.env.PUSHINGSECURITY_ADMIN_EMAIL!;
  const expectedPassword = process.env.PUSHINGSECURITY_ADMIN_PASSWORD!;

  const emailMatches = safeEquals(
    email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase(),
  );
  const passwordMatches = safeEquals(password, expectedPassword);

  if (!emailMatches || !passwordMatches) {
    return {
      ok: false,
      message: "Operator credentials were not recognized.",
    };
  }

  return {
    ok: true,
  };
}

export async function createOperatorSession(subject: string) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_TTL_MS);
  const payload: OperatorSession = {
    subject,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    nonce: randomUUID(),
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearOperatorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getOperatorSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
