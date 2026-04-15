export type SecretLookupInput = {
  provider: string;
  keyName: string;
};

export type ProviderSecretSource = "vault" | "env" | "missing";

export type ProviderSecretReader = (
  input: SecretLookupInput,
) => Promise<string | null>;

export type ResolvedProviderSecret = {
  keyName: string;
  source: ProviderSecretSource;
  value: string | null;
  warnings: string[];
};

type ResolveProviderSecretInput = {
  provider: string;
  keyName: string;
  envValue?: string | null;
  warningPrefix: string;
  readSecretValue: ProviderSecretReader;
};

export function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  const unwrapped =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  return unwrapped.length > 0 ? unwrapped : null;
}

export function normalizeListEnv(
  value: string | null | undefined,
  fallback: string[] = [],
) {
  const normalized = trimNullable(value);

  if (!normalized) {
    return fallback;
  }

  const values = normalized
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return values.length > 0 ? values : fallback;
}

export async function resolveProviderSecret({
  provider,
  keyName,
  envValue,
  warningPrefix,
  readSecretValue,
}: ResolveProviderSecretInput): Promise<ResolvedProviderSecret> {
  const warnings: string[] = [];

  try {
    const vaultValue = await readSecretValue({ provider, keyName });
    const normalizedVaultValue = trimNullable(vaultValue);

    if (normalizedVaultValue) {
      return {
        keyName,
        source: "vault",
        value: normalizedVaultValue,
        warnings,
      };
    }
  } catch (error) {
    warnings.push(
      `${warningPrefix}: ${keyName} exists in the vault but could not be decrypted. ${
        error instanceof Error
          ? error.message
          : "Check PUSHINGSECURITY_MASTER_KEY and the stored record."
      }`,
    );
  }

  const normalizedEnvValue = trimNullable(envValue);

  if (normalizedEnvValue) {
    return {
      keyName,
      source: "env",
      value: normalizedEnvValue,
      warnings,
    };
  }

  return {
    keyName,
    source: "missing",
    value: null,
    warnings,
  };
}
