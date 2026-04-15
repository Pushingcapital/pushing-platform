import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import type { EncryptedSecretValue } from "@/lib/control/types";

const IV_LENGTH = 12;

function getMasterKey() {
  const rawSecret = process.env.PUSHINGSECURITY_MASTER_KEY;

  if (!rawSecret) {
    throw new Error(
      "Missing PUSHINGSECURITY_MASTER_KEY. Set it before storing provider credentials.",
    );
  }

  return createHash("sha256").update(rawSecret).digest();
}

export function hasMasterKey() {
  return Boolean(process.env.PUSHINGSECURITY_MASTER_KEY);
}

export function fingerprintSecret(secretValue: string) {
  return createHash("sha256")
    .update(secretValue)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
}

export function encryptSecretValue(secretValue: string): EncryptedSecretValue {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secretValue, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64url"),
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
  };
}

export function decryptSecretValue(payload: EncryptedSecretValue) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getMasterKey(),
    Buffer.from(payload.iv, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
