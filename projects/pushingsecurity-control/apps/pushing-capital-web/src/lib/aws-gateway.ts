import "server-only";

type AwsGateRequest = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export function hasAwsGatewayConfig() {
  return Boolean(
    process.env.AWS_GATEWAY_BASE_URL && process.env.AWS_GATEWAY_ACCESS_TOKEN,
  );
}

export async function callAwsGateway({
  path,
  method = "GET",
  body,
}: AwsGateRequest) {
  const baseUrl = process.env.AWS_GATEWAY_BASE_URL;
  const accessToken = process.env.AWS_GATEWAY_ACCESS_TOKEN;

  if (!baseUrl || !accessToken) {
    throw new Error(
      "AWS gateway is not configured. Set AWS_GATEWAY_BASE_URL and AWS_GATEWAY_ACCESS_TOKEN first.",
    );
  }

  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AWS gateway request failed with status ${response.status}.`);
  }

  return response.json();
}
