import { createHmac, timingSafeEqual } from "node:crypto";

import { handleDocuSignWorkspaceWebhook } from "@/lib/onboarding/docusign-workspace-automation";

export const dynamic = "force-dynamic";

function trimNullable(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function readBearerToken(request: Request) {
  const authorization = trimNullable(request.headers.get("authorization"));

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return trimNullable(authorization.slice("bearer ".length));
}

function verifyWebhookAuth(request: Request, rawBody: string) {
  const hmacSecret = trimNullable(process.env.DOCUSIGN_CONNECT_HMAC_SECRET);
  const bearerToken = trimNullable(process.env.DOCUSIGN_WEBHOOK_BEARER_TOKEN);

  if (hmacSecret) {
    const receivedSignature = trimNullable(
      request.headers.get("x-docusign-signature-1"),
    );

    if (!receivedSignature) {
      return {
        ok: false,
        error: "Missing DocuSign signature header.",
      } as const;
    }

    const expectedSignature = createHmac("sha256", hmacSecret)
      .update(rawBody, "utf8")
      .digest("base64");

    if (!safeEquals(receivedSignature, expectedSignature)) {
      return {
        ok: false,
        error: "DocuSign webhook signature verification failed.",
      } as const;
    }

    return {
      ok: true,
      verified: true,
      mode: "hmac",
    } as const;
  }

  if (bearerToken) {
    const receivedToken = readBearerToken(request);

    if (!receivedToken || !safeEquals(receivedToken, bearerToken)) {
      return {
        ok: false,
        error: "DocuSign webhook bearer token was not recognized.",
      } as const;
    }

    return {
      ok: true,
      verified: true,
      mode: "bearer",
    } as const;
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      verified: false,
      mode: "development-open",
    } as const;
  }

  return {
    ok: false,
    error:
      "Configure DOCUSIGN_CONNECT_HMAC_SECRET or DOCUSIGN_WEBHOOK_BEARER_TOKEN before exposing the DocuSign webhook route.",
  } as const;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const authResult = verifyWebhookAuth(request, rawBody);

  if (!authResult.ok) {
    return Response.json({ error: authResult.error }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return Response.json(
      { error: "DocuSign webhook body must be valid JSON." },
      { status: 400 },
    );
  }

  try {
    const result = await handleDocuSignWorkspaceWebhook({
      payload,
      verified: authResult.verified,
    });

    return Response.json(
      {
        authMode: authResult.mode,
        result,
      },
      { status: result.handled ? 200 : 202 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process the DocuSign webhook.",
      },
      { status: 500 },
    );
  }
}
