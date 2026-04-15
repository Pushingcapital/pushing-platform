import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotEnv } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  createDocuSignTemplate,
  getDocuSignStatus,
  getDocuSignTemplate,
  listDocuSignTemplates,
  sendDocuSignTemplateEnvelope,
  type CreateDocuSignTemplateInput,
  type DocuSignCreateTemplateRecipientInput,
  type DocuSignEnvelopeCustomFieldInput,
  type DocuSignEnvelopeTemplateRoleInput,
} from "@pushingcap/integrations/docusign";
import type { ProviderSecretReader } from "@pushingcap/integrations/provider-secrets";

type StringEnv = Record<string, string | undefined>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ENV_FILE = resolve(
  __dirname,
  "../../../apps/pushing-capital-web/.env.local",
);

const noSecrets: ProviderSecretReader = async () => null;
const tabsSchema = z.record(
  z.string(),
  z.array(z.record(z.string(), z.unknown())),
);

function loadRuntimeEnv() {
  const envFile =
    process.env.DOCUSIGN_MCP_ENV_FILE?.trim() || DEFAULT_ENV_FILE;
  const envFileExists = existsSync(envFile);

  if (envFileExists) {
    loadDotEnv({
      path: envFile,
      override: false,
    });
  }

  return {
    envFile,
    envFileExists,
    env: process.env as StringEnv,
  };
}

const runtime = loadRuntimeEnv();

function asToolResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent:
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : { result: payload },
  };
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "Error",
    message: String(error),
  };
}

async function runTool(name: string, action: () => Promise<unknown>) {
  try {
    const result = await action();
    return asToolResult({
      ok: true,
      tool: name,
      result,
    });
  } catch (error) {
    return asToolResult({
      ok: false,
      tool: name,
      error: formatError(error),
    });
  }
}

function toolEnv() {
  return runtime.env;
}

function createServer() {
  const server = new McpServer({
    name: "pushingcap-docusign-mcp",
    version: "0.1.0",
  });

  server.tool(
    "docusign_status",
    "Show the current DocuSign integration readiness and which env file the MCP bridge loaded.",
    async () =>
      runTool("docusign_status", async () => ({
        envFile: runtime.envFile,
        envFileExists: runtime.envFileExists,
        status: await getDocuSignStatus({
          readSecretValue: noSecrets,
          env: toolEnv(),
        }),
      })),
  );

  server.tool(
    "docusign_list_templates",
    "List DocuSign templates for the configured account.",
    {
      count: z.number().int().min(1).max(100).optional(),
      search_text: z.string().trim().min(1).optional(),
    },
    async ({ count, search_text }) =>
      runTool("docusign_list_templates", async () =>
        listDocuSignTemplates({
          readSecretValue: noSecrets,
          env: toolEnv(),
          count,
          searchText: search_text,
        }),
      ),
  );

  server.tool(
    "docusign_get_template",
    "Fetch a DocuSign template, including roles, tabs, documents, and the normalized field catalog.",
    {
      template_id: z.string().trim().min(1),
    },
    async ({ template_id }) =>
      runTool("docusign_get_template", async () =>
        getDocuSignTemplate({
          readSecretValue: noSecrets,
          env: toolEnv(),
          templateId: template_id,
        }),
      ),
  );

  server.tool(
    "docusign_send_template_envelope",
    "Create or send an envelope from a DocuSign template using explicit template roles and optional hidden custom fields.",
    {
      template_id: z.string().trim().min(1),
      status: z.enum(["created", "sent"]).optional(),
      email_subject: z.string().trim().min(1).optional(),
      email_blurb: z.string().trim().min(1).optional(),
      merge_roles_on_draft: z.boolean().optional(),
      template_roles: z
        .array(
          z.object({
            role_name: z.string().trim().min(1),
            name: z.string().trim().min(1),
            email: z.email(),
            routing_order: z.union([z.string(), z.number()]).optional(),
            tabs: tabsSchema.optional(),
          }),
        )
        .min(1),
      custom_fields: z
        .array(
          z.object({
            name: z.string().trim().min(1),
            value: z.string().trim().min(1),
            show: z.boolean().optional(),
            required: z.boolean().optional(),
          }),
        )
        .optional(),
    },
    async ({
      template_id,
      status,
      email_subject,
      email_blurb,
      merge_roles_on_draft,
      template_roles,
      custom_fields,
    }) =>
      runTool("docusign_send_template_envelope", async () => {
        const templateRoles: DocuSignEnvelopeTemplateRoleInput[] =
          template_roles.map((role) => ({
            roleName: role.role_name,
            name: role.name,
            email: role.email,
            routingOrder: role.routing_order,
            tabs: role.tabs,
          }));

        const customFields: DocuSignEnvelopeCustomFieldInput[] | undefined =
          custom_fields?.map((field) => ({
            name: field.name,
            value: field.value,
            show: field.show,
            required: field.required,
          }));

        return sendDocuSignTemplateEnvelope({
          readSecretValue: noSecrets,
          env: toolEnv(),
          templateId: template_id,
          status,
          emailSubject: email_subject,
          emailBlurb: email_blurb,
          mergeRolesOnDraft: merge_roles_on_draft,
          templateRoles,
          customFields,
        });
      }),
  );

  server.tool(
    "docusign_create_template",
    "Create or update a DocuSign template from base64 PDF documents, recipients, and optional notary recipients.",
    {
      name: z.string().trim().min(1),
      description: z.string().trim().min(1).optional(),
      email_subject: z.string().trim().min(1).optional(),
      email_blurb: z.string().trim().min(1).optional(),
      shared: z.boolean().optional(),
      search_existing_by_name: z.boolean().optional(),
      documents: z
        .array(
          z.object({
            document_id: z.string().trim().min(1),
            name: z.string().trim().min(1),
            document_base64: z.string().trim().min(1),
            file_extension: z.string().trim().min(1).optional(),
            order: z.union([z.string(), z.number()]).optional(),
          }),
        )
        .min(1),
      recipients: z
        .array(
          z.object({
            recipient_type: z.enum(["signer", "notary"]),
            recipient_id: z.string().trim().min(1),
            role_name: z.string().trim().min(1),
            name: z.string().trim().min(1).optional(),
            email: z.email().optional(),
            routing_order: z.union([z.string(), z.number()]),
            default_recipient: z.boolean().optional(),
            tabs: tabsSchema.optional(),
          }),
        )
        .min(1),
    },
    async ({
      name,
      description,
      email_subject,
      email_blurb,
      shared,
      search_existing_by_name,
      documents,
      recipients,
    }) =>
      runTool("docusign_create_template", async () => {
        const mappedRecipients: DocuSignCreateTemplateRecipientInput[] =
          recipients.map((recipient) => ({
            recipientType: recipient.recipient_type,
            recipientId: recipient.recipient_id,
            roleName: recipient.role_name,
            name: recipient.name,
            email: recipient.email,
            routingOrder: recipient.routing_order,
            defaultRecipient: recipient.default_recipient,
            tabs: recipient.tabs,
          }));

        const payload: CreateDocuSignTemplateInput = {
          readSecretValue: noSecrets,
          env: toolEnv(),
          name,
          description,
          emailSubject: email_subject,
          emailBlurb: email_blurb,
          shared,
          searchExistingByName: search_existing_by_name,
          documents: documents.map((document) => ({
            documentId: document.document_id,
            name: document.name,
            documentBase64: document.document_base64,
            fileExtension: document.file_extension,
            order: document.order,
          })),
          recipients: mappedRecipients,
        };

        return createDocuSignTemplate(payload);
      }),
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("DocuSign MCP server failed:", error);
  process.exit(1);
});
