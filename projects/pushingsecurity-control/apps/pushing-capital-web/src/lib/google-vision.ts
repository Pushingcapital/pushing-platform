import "server-only";

import { createPrivateKey } from "node:crypto";
import { google } from "googleapis";

import type { DriverLicenseParseResult } from "@/lib/control/types";
import {
  resolveProviderSecret,
  trimNullable,
  type ProviderSecretReader,
} from "@/lib/providers/config";

const GOOGLE_VISION_PROVIDER = "google-vision";
const GOOGLE_VISION_DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
];

function isoNow() {
  return new Date().toISOString();
}

function normalizeGooglePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeDate(value: string | null) {
  return value ? normalizeWhitespace(value) : null;
}

function isLikelyDateValue(value: string) {
  return /\b\d{1,2}[\/-]\d{1,2}[\/-](?:\d{2}|\d{4})\b/.test(value);
}

function extractFirstMatch(value: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    const captured = trimNullable(match?.[1]);

    if (captured) {
      return normalizeWhitespace(captured);
    }
  }

  return null;
}

function sanitizeNameLineValue(value: string) {
  return normalizeWhitespace(
    value
      .replace(/^[,:#-]+/, "")
      .replace(/\b(?:FN|LN|FIRST NAME|LAST NAME|SURNAME|GIVEN NAME)\b/gi, "")
      .trim(),
  );
}

function splitGivenNames(value: string | null) {
  const normalized = trimNullable(value);

  if (!normalized) {
    return {
      firstName: null,
      middleName: null,
    };
  }

  const parts = normalized
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    middleName: parts.slice(1).join(" ") || null,
  };
}

function extractLabeledValue(
  lines: string[],
  labels: string[],
  validator?: (value: string) => boolean,
) {
  const inlinePattern = new RegExp(
    `^(?:${labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b[\\s:#-]*(.+)$`,
    "i",
  );

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const inlineMatch = line.match(inlinePattern);

    if (inlineMatch?.[1]) {
      const candidate = sanitizeNameLineValue(inlineMatch[1]);

      if (candidate && (!validator || validator(candidate))) {
        return candidate;
      }
    }

    const normalizedLine = line.trim().toUpperCase();

    if (!labels.some((label) => normalizedLine === label.toUpperCase())) {
      continue;
    }

    const nextLine = trimNullable(lines[index + 1]);

    if (nextLine && (!validator || validator(nextLine))) {
      return normalizeWhitespace(nextLine);
    }
  }

  return null;
}

function extractLabeledNameParts(lines: string[]) {
  const lastName = extractLabeledValue(lines, ["LN", "LAST NAME", "SURNAME"]);
  const givenNames = extractLabeledValue(lines, [
    "FN",
    "FIRST NAME",
    "GIVEN NAME",
  ]);

  if (!lastName && !givenNames) {
    return null;
  }

  const splitGiven = splitGivenNames(givenNames);
  const fullName = [
    splitGiven.firstName,
    splitGiven.middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    fullName: fullName || null,
    firstName: splitGiven.firstName,
    middleName: splitGiven.middleName,
    lastName,
  };
}

function extractLabeledDate(lines: string[], labels: string[]) {
  return normalizeDate(
    extractLabeledValue(lines, labels, (value) => isLikelyDateValue(value)),
  );
}

function extractStreetAddress(lines: string[]) {
  return (
    lines.find((line) =>
      /^\d{1,6}\s+[A-Z0-9.'# -]+(?:ST|STREET|AVE|AVENUE|BLVD|ROAD|RD|LANE|LN|DR|DRIVE|WAY|CT|COURT|PL|PLACE|HWY|HIGHWAY)\b/i.test(
        line,
      ),
    ) ?? null
  );
}

function extractCityStatePostal(lines: string[]) {
  for (const line of lines) {
    const match = line.match(
      /\b([A-Z][A-Z .'-]+?)[,\s]+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/i,
    );

    if (match) {
      return {
        city: normalizeWhitespace(match[1]),
        state: normalizeWhitespace(match[2]).toUpperCase(),
        postalCode: normalizeWhitespace(match[3]),
      };
    }
  }

  return {
    city: null,
    state: null,
    postalCode: null,
  };
}

function sanitizeLicenseCandidate(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[^A-Z0-9-]/gi, "").toUpperCase().trim();
  return normalized.length > 0 ? normalized : null;
}

function scoreLicenseCandidate(value: string) {
  let score = 0;

  if (/^[A-Z]\d{4,}$/.test(value)) {
    score += 80;
  } else if (/^[A-Z]{2}\d{4,}$/.test(value)) {
    score += 70;
  } else if (/^\d{5,}$/.test(value)) {
    score += 60;
  } else if (/^[A-Z0-9-]{5,20}$/.test(value)) {
    score += 25;
  }

  if (/^(?:DL|ID|LIC|LICENSE|NUMBER|CUSTOMER)/.test(value)) {
    score -= 40;
  }

  if (value.length >= 6 && value.length <= 10) {
    score += 10;
  }

  return score;
}

function pickBestLicenseCandidate(candidates: Array<string | null | undefined>) {
  const normalizedCandidates = Array.from(
    new Set(
      candidates
        .map((candidate) => sanitizeLicenseCandidate(candidate))
        .filter((candidate): candidate is string =>
          Boolean(candidate && /^[A-Z0-9-]{5,20}$/.test(candidate)),
        ),
    ),
  );

  if (normalizedCandidates.length === 0) {
    return null;
  }

  return normalizedCandidates.sort((left, right) => {
    const scoreDelta = scoreLicenseCandidate(right) - scoreLicenseCandidate(left);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.length - right.length;
  })[0]!;
}

function buildPrefixedLicenseCandidates(
  prefix: string | null | undefined,
  numericPortion: string | null | undefined,
) {
  const normalizedPrefix = sanitizeLicenseCandidate(prefix);
  const normalizedNumericPortion = sanitizeLicenseCandidate(numericPortion);

  if (!normalizedNumericPortion) {
    return [];
  }

  if (!normalizedPrefix) {
    return [normalizedNumericPortion];
  }

  const candidates = [normalizedPrefix + normalizedNumericPortion];

  if (normalizedPrefix.length > 1) {
    for (let index = 1; index < normalizedPrefix.length; index += 1) {
      candidates.push(normalizedPrefix.slice(index) + normalizedNumericPortion);
    }
  }

  return candidates;
}

function extractAddressLine2(lines: string[], addressLine1: string | null) {
  if (!addressLine1) {
    return null;
  }

  const normalizedAddressLine1 = normalizeWhitespace(addressLine1);
  const addressIndex = lines.findIndex(
    (line) => normalizeWhitespace(line) === normalizedAddressLine1,
  );

  if (addressIndex < 0) {
    return null;
  }

  const candidate = trimNullable(lines[addressIndex + 1]);

  if (!candidate) {
    return null;
  }

  if (
    /\b([A-Z][A-Z .'-]+?)[,\s]+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/i.test(candidate)
  ) {
    return null;
  }

  if (
    /\b(?:DOB|EXP|ISS|SEX|HEIGHT|WEIGHT|EYES|CLASS|RESTR|ENDORSE|DRIVER|LICENSE)\b/i.test(
      candidate,
    )
  ) {
    return null;
  }

  return normalizeWhitespace(candidate);
}

function extractLicenseNumber(lines: string[], rawText: string) {
  const labeledPatterns = [
    /^(?:DLN?|LIC(?:ENSE)?|ID|ID#|ID NO\.?|ID CARD|CUSTOMER ID|NUMBER|NO\.?)\s*([A-Z]{0,3})[\s:#-]+([A-Z0-9-]{4,20})$/i,
    /(?:^|\n)\s*(?:DLN?|LIC(?:ENSE)?|ID|ID#|ID NO\.?|ID CARD|CUSTOMER ID|NUMBER|NO\.?)\s*([A-Z]{0,3})[\s:#-]+([A-Z0-9-]{4,20})\b/gim,
  ] as const;

  const candidates: string[] = [];

  for (const line of lines.map((line) => normalizeWhitespace(line))) {
    const match = line.match(labeledPatterns[0]);

    if (!match) {
      continue;
    }

    candidates.push(
      ...buildPrefixedLicenseCandidates(match[1], match[2]),
      sanitizeLicenseCandidate(match[2]) ?? "",
    );
  }

  for (const match of rawText.matchAll(labeledPatterns[1])) {
    candidates.push(
      ...buildPrefixedLicenseCandidates(match[1], match[2]),
      sanitizeLicenseCandidate(match[2]) ?? "",
    );
  }

  return pickBestLicenseCandidate(candidates);
}

function splitName(fullName: string | null) {
  if (!fullName) {
    return {
      firstName: null,
      middleName: null,
      lastName: null,
    };
  }

  const parts = fullName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      middleName: null,
      lastName: null,
    };
  }

  if (parts.length === 2) {
    return {
      firstName: parts[0],
      middleName: null,
      lastName: parts[1],
    };
  }

  return {
    firstName: parts[0] ?? null,
    middleName: parts.slice(1, -1).join(" ") || null,
    lastName: parts[parts.length - 1] ?? null,
  };
}

function extractFullName(rawText: string, lines: string[]) {
  const labeledName = extractFirstMatch(rawText, [
    /(?:^|\n)\s*NAME\s*[:#]?\s*([A-Z][A-Z ,.'-]{4,})/im,
  ]);

  if (labeledName) {
    return labeledName;
  }

  const candidate = lines.find((line) => {
    const normalized = normalizeWhitespace(line);
    const upper = normalized.toUpperCase();

    if (upper.includes("DRIVER") || upper.includes("LICENSE")) {
      return false;
    }

    if (
      upper.includes("CLASS") ||
      upper.includes("SEX") ||
      upper.includes("HEIGHT") ||
      upper.includes("WEIGHT") ||
      upper.includes("EYES") ||
      upper.includes("DOB") ||
      upper.includes("EXP") ||
      upper.includes("ISS")
    ) {
      return false;
    }

    return /^[A-Z][A-Z ,.'-]{5,}$/.test(upper) && normalized.split(/\s+/).length >= 2;
  });

  return candidate ? normalizeWhitespace(candidate) : null;
}

function computeConfidence(annotation: Record<string, unknown>) {
  const pages = Array.isArray(
    (annotation.fullTextAnnotation as { pages?: Array<{ confidence?: number }> })
      ?.pages,
  )
    ? (
        annotation.fullTextAnnotation as {
          pages?: Array<{ confidence?: number }>;
        }
      ).pages ?? []
    : [];

  const confidences = pages
    .map((page) => page.confidence)
    .filter((value): value is number => typeof value === "number");

  if (confidences.length === 0) {
    return null;
  }

  return Math.round(
    (confidences.reduce((sum, value) => sum + value, 0) / confidences.length) *
      1000,
  ) / 1000;
}

function isHighLikelihood(value: unknown) {
  return value === "LIKELY" || value === "VERY_LIKELY";
}

function buildDocumentSignals(annotation: {
  faceAnnotations?: Array<{
    blurredLikelihood?: string | null;
    underExposedLikelihood?: string | null;
    headwearLikelihood?: string | null;
  }>;
}) {
  const faces = Array.isArray(annotation.faceAnnotations)
    ? annotation.faceAnnotations
    : [];
  const warnings: string[] = [];
  let faceDetectionStatus: DriverLicenseParseResult["documentSignals"]["faceDetectionStatus"] =
    "not-available";
  let reviewStatus: DriverLicenseParseResult["documentSignals"]["reviewStatus"] = "ok";

  if (faces.length === 0) {
    faceDetectionStatus = "not-detected";
    reviewStatus = "needs-review";
    warnings.push(
      "No portrait face was detected on the uploaded ID image. Manual review may still be needed for low-resolution cards.",
    );
  } else if (faces.length === 1) {
    faceDetectionStatus = "detected";
  } else {
    faceDetectionStatus = "multiple";
    reviewStatus = "needs-review";
    warnings.push(
      "Multiple faces were detected in the uploaded image. The ID image should show only the document itself.",
    );
  }

  const strongestFace = faces[0];

  if (strongestFace) {
    if (isHighLikelihood(strongestFace.blurredLikelihood)) {
      reviewStatus = "needs-review";
      warnings.push("The uploaded ID image appears blurry.");
    }

    if (isHighLikelihood(strongestFace.underExposedLikelihood)) {
      reviewStatus = "needs-review";
      warnings.push("The uploaded ID image appears underexposed or too dark.");
    }

    if (isHighLikelihood(strongestFace.headwearLikelihood)) {
      warnings.push(
        "Vision flagged headwear on the portrait image. Confirm the ID image is unobstructed.",
      );
    }
  }

  return {
    faceCount: faces.length,
    faceDetectionStatus,
    reviewStatus,
    warnings,
  } satisfies DriverLicenseParseResult["documentSignals"];
}

export function parseDriverLicenseText(input: {
  rawText: string;
  fileName: string | null;
  mimeType: string | null;
  confidence: number | null;
  documentSignals?: DriverLicenseParseResult["documentSignals"];
}): DriverLicenseParseResult {
  const parsedAt = isoNow();
  const rawText = input.rawText.replace(/\r/g, "").trim();
  const documentSignals =
    input.documentSignals ??
    ({
      faceCount: null,
      faceDetectionStatus: "not-available",
      reviewStatus: "ok",
      warnings: [],
    } satisfies DriverLicenseParseResult["documentSignals"]);

  if (!rawText) {
    return {
      provider: "google-vision",
      status: "failed",
      fileName: input.fileName,
      mimeType: input.mimeType,
      rawText: "",
      confidence: input.confidence,
      fields: {
        fullName: null,
        firstName: null,
        middleName: null,
        lastName: null,
        licenseNumber: null,
        dateOfBirth: null,
        issueDate: null,
        expirationDate: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
      },
      documentSignals,
      warnings: [
        "No OCR text was returned from Google Vision.",
        ...documentSignals.warnings,
      ],
      parsedAt,
    };
  }

  const lines = rawText
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  const labeledNameParts = extractLabeledNameParts(lines);
  const fullName = labeledNameParts?.fullName ?? extractFullName(rawText, lines);
  const nameParts = labeledNameParts ?? splitName(fullName);
  const licenseNumber = extractLicenseNumber(lines, rawText);
  const dateOfBirth =
    extractLabeledDate(lines, ["DOB", "DATE OF BIRTH", "BIRTH DATE"]) ??
    normalizeDate(
      extractFirstMatch(rawText, [
        /(?:DOB|DATE OF BIRTH|BIRTH DATE)\s*[:#]?\s*([A-Z0-9,\/ -]{6,20})/i,
      ]),
    );
  const expirationDate =
    extractLabeledDate(lines, ["EXP", "EXPIRES", "EXPIRATION"]) ??
    normalizeDate(
      extractFirstMatch(rawText, [
        /(?:EXP|EXPIRES|EXPIRATION)\s*[:#]?\s*([A-Z0-9,\/ -]{6,20})/i,
      ]),
    );
  const issueDate =
    extractLabeledDate(lines, ["ISS", "ISSUED", "ISSUE DATE"]) ??
    normalizeDate(
      extractFirstMatch(rawText, [
        /(?:ISS|ISSUED|ISSUE DATE)\s*[:#]?\s*([A-Z0-9,\/ -]{6,20})/i,
      ]),
    );
  const addressLine1 = extractStreetAddress(lines);
  const addressLine2 = extractAddressLine2(lines, addressLine1);
  const cityStatePostal = extractCityStatePostal(lines);

  const warnings: string[] = [];

  if (!fullName) {
    warnings.push("Full name was not extracted confidently.");
  }

  if (!licenseNumber) {
    warnings.push("License number was not extracted confidently.");
  }

  if (!dateOfBirth) {
    warnings.push("Date of birth was not extracted confidently.");
  }

  if (!addressLine1) {
    warnings.push("Street address was not extracted confidently.");
  }

  warnings.push(...documentSignals.warnings);

  const status =
    fullName &&
    licenseNumber &&
    dateOfBirth &&
    documentSignals.reviewStatus !== "needs-review"
      ? "parsed"
      : "needs-review";

  return {
    provider: "google-vision",
    status,
    fileName: input.fileName,
    mimeType: input.mimeType,
    rawText,
    confidence: input.confidence,
    fields: {
      fullName,
      firstName: nameParts.firstName,
      middleName: nameParts.middleName,
      lastName: nameParts.lastName,
      licenseNumber,
      dateOfBirth,
      issueDate,
      expirationDate,
      addressLine1,
      addressLine2,
      city: cityStatePostal.city,
      state: cityStatePostal.state,
      postalCode: cityStatePostal.postalCode,
    },
    documentSignals,
    warnings,
    parsedAt,
  };
}

export async function parseDriversLicenseWithGoogleVision({
  bytes,
  fileName,
  mimeType,
  readSecretValue,
}: {
  bytes: Buffer;
  fileName: string | null;
  mimeType: string | null;
  readSecretValue: ProviderSecretReader;
}) {
  const clientEmail = await resolveProviderSecret({
    provider: GOOGLE_VISION_PROVIDER,
    keyName: "GOOGLE_VISION_CLIENT_EMAIL",
    envValue:
      process.env.GOOGLE_VISION_CLIENT_EMAIL ??
      process.env.GOOGLE_WORKSPACE_CLIENT_EMAIL,
    warningPrefix: "Google Vision",
    readSecretValue,
  });
  const privateKey = await resolveProviderSecret({
    provider: GOOGLE_VISION_PROVIDER,
    keyName: "GOOGLE_VISION_PRIVATE_KEY",
    envValue:
      process.env.GOOGLE_VISION_PRIVATE_KEY ??
      process.env.GOOGLE_WORKSPACE_PRIVATE_KEY,
    warningPrefix: "Google Vision",
    readSecretValue,
  });
  const projectId =
    trimNullable(process.env.GOOGLE_VISION_PROJECT_ID) ??
    trimNullable(process.env.GOOGLE_WORKSPACE_PROJECT_ID);

  if (!clientEmail.value) {
    throw new Error(
      "Google Vision is not configured yet. Set GOOGLE_VISION_CLIENT_EMAIL or reuse the Google Workspace service account credentials.",
    );
  }

  if (!privateKey.value) {
    throw new Error(
      "Google Vision is not configured yet. Set GOOGLE_VISION_PRIVATE_KEY or reuse the Google Workspace service account credentials.",
    );
  }

  if (!projectId) {
    throw new Error(
      "Google Vision is not configured yet. Set GOOGLE_VISION_PROJECT_ID to a billing-enabled Google Cloud project.",
    );
  }

  const normalizedPrivateKey = normalizeGooglePrivateKey(privateKey.value);

  try {
    createPrivateKey({
      key: normalizedPrivateKey,
      format: "pem",
    });
  } catch {
    throw new Error("Google Vision private key is not valid PEM data.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail.value,
    key: normalizedPrivateKey,
    scopes: GOOGLE_VISION_DEFAULT_SCOPES,
    subject: undefined,
  });

  const vision = google.vision({
    version: "v1",
    auth,
  });

  const response = await vision.images.annotate({
    requestBody: {
      requests: [
        {
          image: {
            content: bytes.toString("base64"),
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 1,
            },
            {
              type: "FACE_DETECTION",
              maxResults: 5,
            },
          ],
          imageContext: {
            languageHints: ["en"],
          },
        },
      ],
      parent: `projects/${projectId}`,
    },
  });

  const annotation = response.data.responses?.[0];

  if (!annotation) {
    throw new Error("Google Vision did not return an OCR response.");
  }

  if (annotation.error?.message) {
    throw new Error(annotation.error.message);
  }

  const rawText =
    annotation.fullTextAnnotation?.text ??
    annotation.textAnnotations?.[0]?.description ??
    "";

  return parseDriverLicenseText({
    rawText,
    fileName,
    mimeType,
    confidence: computeConfidence(annotation as Record<string, unknown>),
    documentSignals: buildDocumentSignals(annotation),
  });
}
