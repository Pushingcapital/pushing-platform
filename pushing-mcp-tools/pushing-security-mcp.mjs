#!/usr/bin/env node

/**
 * PushingSecurity Sovereign Credential Vault MCP Server v3.0
 * 
 * Provides autonomous credential discovery, resolution, provisioning,
 * deep research with Google Search grounding, and NotebookLM enterprise
 * integration for the 90-worker Pushing Capital swarm.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "node:http";
import { BigQuery } from "@google-cloud/bigquery";
import { VertexAI } from "@google-cloud/vertexai";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const execAsync = promisify(exec);

// --- Configuration & Initialization ---

const PROJECT_ID = "brain-481809";
const OWNER_ID = "000";
const LOCATION = "us-central1";

const bqOptions = { projectId: PROJECT_ID };
if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
  try {
    const parsed = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
    if (parsed && parsed.type === 'service_account') {
      bqOptions.credentials = parsed;
    } else {
      delete process.env.GCP_SERVICE_ACCOUNT_KEY;
    }
  } catch (e) {
    delete process.env.GCP_SERVICE_ACCOUNT_KEY;
    console.error("GCP_SERVICE_ACCOUNT_KEY is not valid SA JSON, using ADC");
  }
}
const bigquery = new BigQuery(bqOptions);

// Vertex AI for Gemini (uses ADC/service account automatically)
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const aiModel = vertexAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Deep research model — uses grounding with Google Search
const deepResearchModel = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { maxOutputTokens: 8192 },
});

// Reasoning model — uses Gemini 2.5 Pro for heavy analysis
const reasoningModel = vertexAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-05-06",
  generationConfig: { maxOutputTokens: 16384 },
});

// --- Helper Functions ---

async function auditLog(eventType, workerProfile, details, metadata = {}) {
  try {
    const payloadObj = {
      event_type: eventType,
      worker_profile: workerProfile || 'system',
      details: typeof details === 'string' ? details : JSON.stringify(details),
      metadata
    };
    await bigquery.dataset('pc_operations').table('event_log').insert([{
      event_id: crypto.randomUUID(),
      topic: `vault.${eventType}`,
      payload: payloadObj,
      source: 'pushing-security-mcp',
      timestamp: new Date().toISOString(),
      processed: false
    }]);
  } catch (e) {
    console.error("Audit log (non-fatal):", e.message?.slice(0, 120));
  }
}

async function getAIText(result) {
  // Handle VertexAI response formats — text can be a getter (string) or function
  const response = result.response || result;
  // VertexAI SDK: response.text is a getter that returns a string directly
  if (typeof response.text === 'string') return response.text;
  // Some SDK versions: response.text() is a function
  if (typeof response.text === 'function') return response.text();
  // Fallback: dig into candidates
  if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  // Last resort: check result directly
  if (typeof result.text === 'string') return result.text;
  if (typeof result.text === 'function') return result.text();
  return JSON.stringify(response);
}

// --- MCP Server Setup ---

const server = new Server({
  name: "pushing-security-mcp",
  version: "3.0.0",
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // === VAULT TOOLS ===
      {
        name: "vault_resolve_identity",
        description: "Given a worker_profile or job description, returns the required credentials defined in the map.",
        inputSchema: {
          type: "object",
          properties: {
            worker_profile: { type: "string", description: "The ID of the worker (e.g., 'runpod_media')." },
            context: { type: "string", description: "Optional semantic context describing the job if profile is unknown." }
          },
          required: ["worker_profile"]
        }
      },
      {
        name: "vault_provision_worker",
        description: "Fetches, decrypts, and returns all secrets required for a worker profile.",
        inputSchema: {
          type: "object",
          properties: {
            worker_profile: { type: "string", description: "The ID of the worker requesting provisioning." }
          },
          required: ["worker_profile"]
        }
      },
      {
        name: "vault_store_credential",
        description: "Stores a new credential in the vault. Encrypts password to base64.",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string" },
            username: { type: "string" },
            password: { type: "string" },
            owner_type: { type: "string", enum: ["HUMAN", "MACHINE"], default: "MACHINE" },
            metadata: { type: "object" }
          },
          required: ["service", "username", "password"]
        }
      },
      {
        name: "vault_rotate_credential",
        description: "Updates an existing credential and increments rotation count.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "UUID of the credential record." },
            new_password: { type: "string" }
          },
          required: ["id", "new_password"]
        }
      },
      {
        name: "vault_audit_log",
        description: "Queries the audit trail (pc_operations.event_log).",
        inputSchema: {
          type: "object",
          properties: {
            worker_profile: { type: "string" },
            limit: { type: "number", default: 20 }
          }
        }
      },
      {
        name: "vault_search",
        description: "Semantic search across vault entries using natural language.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "e.g., 'what RunPod keys do we have?'" }
          },
          required: ["query"]
        }
      },
      {
        name: "psec_generate",
        description: "Scans codebase for env vars and generates a .psec manifest.",
        inputSchema: {
          type: "object",
          properties: {
            directory: { type: "string", description: "Absolute path to project directory." }
          },
          required: ["directory"]
        }
      },

      // === DEEP RESEARCH TOOLS ===
      {
        name: "deep_research",
        description: "Performs deep research on a topic using Gemini with Google Search grounding. Returns a comprehensive report with citations. Use this for market analysis, competitive intelligence, regulatory research, technology evaluation, or any question requiring current internet-sourced information.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The research question or topic to investigate deeply." },
            context: { type: "string", description: "Optional business context to focus the research (e.g., 'for our automotive dealership operations')." },
            depth: { type: "string", enum: ["quick", "standard", "comprehensive"], description: "Research depth: quick (1 pass), standard (2 passes with follow-up), comprehensive (3 passes with synthesis)." }
          },
          required: ["query"]
        }
      },
      {
        name: "empire_intel",
        description: "Combines internal BigQuery data with external research to produce strategic intelligence reports. Queries the empire's data tables, then enriches findings with Google Search grounding for market context.",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "The intelligence topic (e.g., 'subcontractor pricing trends', 'automotive title fraud patterns')." },
            tables: { 
              type: "array", 
              items: { type: "string" },
              description: "Optional BQ tables to query for internal data (e.g., ['pc_gold.all_transaction_records', 'pc_operations.contact_profiles_enriched'])." 
            },
            timeframe: { type: "string", description: "Optional time window for internal data (e.g., 'last 30 days', 'Q1 2026')." }
          },
          required: ["topic"]
        }
      },

      // === NOTEBOOKLM ENTERPRISE TOOLS ===
      {
        name: "notebook_create",
        description: "Creates a NotebookLM Enterprise notebook with sources. Feeds documents, research reports, or data into a new notebook for AI-powered analysis and audio overview generation.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title for the notebook." },
            sources: {
              type: "array",
              items: { type: "object", properties: { 
                type: { type: "string", enum: ["text", "url", "file"] },
                content: { type: "string", description: "Text content, URL, or file path." },
                title: { type: "string", description: "Source title." }
              }},
              description: "Sources to add to the notebook."
            }
          },
          required: ["title", "sources"]
        }
      },
      {
        name: "notebook_query",
        description: "Queries an existing NotebookLM Enterprise notebook. Ask questions about the sources within the notebook.",
        inputSchema: {
          type: "object",
          properties: {
            notebook_id: { type: "string", description: "The notebook resource name." },
            question: { type: "string", description: "Question to ask about the notebook sources." }
          },
          required: ["notebook_id", "question"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {

      // ═══════════════════════════════════════════
      // VAULT TOOLS
      // ═══════════════════════════════════════════

      case "vault_resolve_identity": {
        const query = `SELECT * FROM \`brain-481809.pc_operations.worker_credential_map\` WHERE worker_profile = @profile AND is_active = true`;
        const [rows] = await bigquery.query({ query, params: { profile: args.worker_profile } });
        
        if (rows.length === 0 && args.context) {
          const [registry] = await bigquery.query(`SELECT worker_profile, worker_type FROM \`brain-481809.pc_operations.worker_credential_map\` WHERE is_active = true`);
          const prompt = `Match this description: "${args.context}" to one of these profiles: ${JSON.stringify(registry)}. Return ONLY the profile name or "UNKNOWN".`;
          const result = await aiModel.generateContent(prompt);
          const matchedProfile = (await getAIText(result)).trim();
          
          if (matchedProfile !== "UNKNOWN") {
            const [matchedRows] = await bigquery.query({ query, params: { profile: matchedProfile } });
            return { content: [{ type: "text", text: JSON.stringify(matchedRows[0] || { status: "MAPPED_BUT_NO_CONFIG", profile: matchedProfile }, null, 2) }] };
          }
        }
        
        return { content: [{ type: "text", text: JSON.stringify(rows[0] || { error: "NOT_FOUND" }, null, 2) }] };
      }

      case "vault_provision_worker": {
        const query = `SELECT required_credentials FROM \`brain-481809.pc_operations.worker_credential_map\` WHERE worker_profile = @profile AND is_active = true`;
        const [mapRows] = await bigquery.query({ query, params: { profile: args.worker_profile } });
        
        if (mapRows.length === 0) {
          throw new Error(`No credential map found for worker: ${args.worker_profile}`);
        }

        const keys = mapRows[0].required_credentials.map(c => c.service_name);
        const vaultQuery = `SELECT service_name, encrypted_username, encrypted_password, metadata FROM \`brain-481809.pc_gold.secrets_vault\` WHERE service_name IN UNNEST(@keys) AND owner_id = @owner AND is_active = true`;
        const [vaultRows] = await bigquery.query({ query: vaultQuery, params: { keys, owner: OWNER_ID } });

        const payload = vaultRows.map(row => ({
          service: row.service_name,
          username: row.encrypted_username,
          password: Buffer.from(row.encrypted_password, 'base64').toString('utf-8'),
          metadata: row.metadata
        }));

        await auditLog('PROVISION_SUCCESS', args.worker_profile, `Provisioned ${payload.length} secrets`);
        return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
      }

      case "vault_store_credential": {
        const id = crypto.randomUUID();
        const encrypted = Buffer.from(args.password).toString('base64');
        await bigquery.dataset('pc_gold').table('secrets_vault').insert([{
          id,
          owner_id: OWNER_ID,
          service_name: args.service,
          encrypted_username: args.username,
          encrypted_password: encrypted,
          metadata: JSON.stringify(args.metadata || {}),
          is_active: true,
          created_at: new Date().toISOString()
        }]);
        await auditLog('STORE_CREDENTIAL', 'admin', `Stored secret for ${args.service}`);
        return { content: [{ type: "text", text: `Stored successfully. ID: ${id}` }] };
      }

      case "vault_rotate_credential": {
        const encrypted = Buffer.from(args.new_password).toString('base64');
        const query = `UPDATE \`brain-481809.pc_gold.secrets_vault\` SET encrypted_password = @pw WHERE id = @id AND owner_id = @owner`;
        await bigquery.query({ query, params: { pw: encrypted, id: args.id, owner: OWNER_ID } });
        await auditLog('ROTATE_CREDENTIAL', 'admin', `Rotated ID: ${args.id}`);
        return { content: [{ type: "text", text: "Rotation complete." }] };
      }

      case "vault_audit_log": {
        let query = `SELECT * FROM \`brain-481809.pc_operations.event_log\` WHERE topic LIKE 'vault.%'`;
        const params = {};
        if (args.worker_profile) {
          query += ` AND JSON_VALUE(payload, '$.worker_profile') = @profile`;
          params.profile = args.worker_profile;
        }
        query += ` ORDER BY timestamp DESC LIMIT @lim`;
        params.lim = args.limit || 20;

        const [rows] = await bigquery.query({ query, params });
        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
      }

      case "vault_search": {
        // Query all vault-related tables for context
        const [vaultRows] = await bigquery.query(
          `SELECT id, worker_profile, worker_type, network_family, required_credentials 
           FROM \`brain-481809.pc_operations.worker_credential_map\` WHERE is_active = true`
        );
        
        let secretsContext = [];
        try {
          const [secretRows] = await bigquery.query(
            `SELECT service_name, encrypted_username, metadata FROM \`brain-481809.pc_gold.secrets_vault\` WHERE owner_id = '${OWNER_ID}' AND is_active = true`
          );
          secretsContext = secretRows;
        } catch (e) {
          // secrets_vault may not exist yet
        }

        const prompt = `You are the Pushing Capital vault search engine. Based on these credential maps and vault entries, answer the user's query.

Worker Credential Maps (${vaultRows.length} entries):
${JSON.stringify(vaultRows, null, 1)}

Secrets Vault (${secretsContext.length} entries):
${JSON.stringify(secretsContext.map(s => ({ service: s.service_name, user: s.encrypted_username })), null, 1)}

User Query: "${args.query}"

Provide a clear, structured answer. If the query matches specific entries, list them.`;

        const result = await aiModel.generateContent(prompt);
        const answer = await getAIText(result);
        return { content: [{ type: "text", text: answer }] };
      }

      case "psec_generate": {
        const dir = path.resolve(args.directory);
        const { stdout } = await execAsync(`grep -r "process.env." "${dir}" --exclude-dir=node_modules || true`);
        const envVars = Array.from(new Set(stdout.match(/process\.env\.([A-Z0-9_]+)/g) || [])).map(v => v.replace('process.env.', ''));
        
        const manifest = {
          "[pushing-security]": { vault: "brain-481809.pc_gold.secrets_vault", owner: OWNER_ID },
          "[secrets]": Object.fromEntries(envVars.map(v => [v, "FIXME_MAP_TO_VAULT_KEY"])),
          "[config]": { BIGQUERY_PROJECT: PROJECT_ID }
        };

        const manifestStr = Object.entries(manifest).map(([section, data]) => `${section}\n${Object.entries(data).map(([k, v]) => `${k} = ${v}`).join('\n')}`).join('\n\n');
        return { content: [{ type: "text", text: manifestStr }] };
      }

      // ═══════════════════════════════════════════
      // DEEP RESEARCH TOOLS
      // ═══════════════════════════════════════════

      case "deep_research": {
        const depth = args.depth || "standard";
        const businessContext = args.context ? `\n\nBusiness context: ${args.context}` : '';
        
        // Pass 1: Initial research with Google Search grounding
        const researchPrompt = `You are a senior research analyst for Pushing Capital, a high-volume automotive dealership and financial services empire.

Conduct thorough research on the following topic:
"${args.query}"${businessContext}

Provide:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points with specifics — numbers, dates, names)
3. Market Data (any relevant statistics, pricing, trends)
4. Risk Factors
5. Opportunities
6. Recommended Actions for Pushing Capital
7. Sources consulted

Be specific. Use real data points. No vague generalizations.`;

        const pass1Result = await deepResearchModel.generateContent({
          contents: [{ role: "user", parts: [{ text: researchPrompt }] }],
          tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 } } }],
        });
        const pass1Text = await getAIText(pass1Result);

        if (depth === "quick") {
          await auditLog('DEEP_RESEARCH', 'system', `Quick research: ${args.query.slice(0, 100)}`);
          return { content: [{ type: "text", text: pass1Text }] };
        }

        // Pass 2: Follow-up questions based on initial findings
        const followUpPrompt = `Based on your initial research findings below, identify 3 critical follow-up questions that need answering for a complete picture. Then answer them.

Initial findings:
${pass1Text}

For each follow-up question:
- State the question
- Provide the researched answer with specifics
- Note any data gaps`;

        const pass2Result = await deepResearchModel.generateContent({
          contents: [
            { role: "user", parts: [{ text: researchPrompt }] },
            { role: "model", parts: [{ text: pass1Text }] },
            { role: "user", parts: [{ text: followUpPrompt }] }
          ],
          tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 } } }],
        });
        const pass2Text = await getAIText(pass2Result);

        if (depth === "standard") {
          const combined = `# Deep Research: ${args.query}\n\n## Initial Analysis\n${pass1Text}\n\n---\n\n## Follow-Up Analysis\n${pass2Text}`;
          await auditLog('DEEP_RESEARCH', 'system', `Standard research: ${args.query.slice(0, 100)}`);
          return { content: [{ type: "text", text: combined }] };
        }

        // Pass 3: Comprehensive synthesis
        const synthesisPrompt = `Synthesize all research into a final executive intelligence briefing. This is for the CEO of Pushing Capital.

Format:
# Intelligence Briefing: [Topic]
## Classification: INTERNAL
## Date: ${new Date().toISOString().split('T')[0]}

### Bottom Line Up Front (BLUF)
[1 paragraph — the single most important thing the CEO needs to know]

### Strategic Assessment
[Analysis of how this affects Pushing Capital's operations, revenue, and competitive position]

### Action Items
[Numbered list of specific, actionable steps with deadlines where applicable]

### Data Appendix
[Key statistics, comparisons, and reference data in table format]`;

        const pass3Result = await deepResearchModel.generateContent({
          contents: [
            { role: "user", parts: [{ text: researchPrompt }] },
            { role: "model", parts: [{ text: pass1Text }] },
            { role: "user", parts: [{ text: followUpPrompt }] },
            { role: "model", parts: [{ text: pass2Text }] },
            { role: "user", parts: [{ text: synthesisPrompt }] }
          ],
          tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 } } }],
        });
        const pass3Text = await getAIText(pass3Result);

        await auditLog('DEEP_RESEARCH', 'system', `Comprehensive research: ${args.query.slice(0, 100)}`);
        return { content: [{ type: "text", text: pass3Text }] };
      }

      case "empire_intel": {
        // Step 1: Query internal data
        let internalData = {};
        const tablesToQuery = args.tables || ['pc_operations.worker_credential_map', 'pc_operations.contact_profiles_enriched'];
        
        for (const table of tablesToQuery) {
          try {
            const fullTable = table.includes('.') ? `brain-481809.${table}` : `brain-481809.pc_operations.${table}`;
            const [rows] = await bigquery.query(`SELECT * FROM \`${fullTable}\` LIMIT 100`);
            internalData[table] = { count: rows.length, sample: rows.slice(0, 5) };
          } catch (e) {
            internalData[table] = { error: e.message.slice(0, 100) };
          }
        }

        // Step 2: External research with grounding
        const intelPrompt = `You are the Chief Intelligence Officer for Pushing Capital. 

Topic: "${args.topic}"
${args.timeframe ? `Timeframe: ${args.timeframe}` : ''}

Internal Data Available:
${JSON.stringify(internalData, null, 2)}

Produce an intelligence report that:
1. Analyzes the internal data for patterns and anomalies
2. Enriches with external market context via web research
3. Identifies threats and opportunities
4. Provides specific, actionable recommendations

Format as a structured intelligence report with sections.`;

        const result = await deepResearchModel.generateContent({
          contents: [{ role: "user", parts: [{ text: intelPrompt }] }],
          tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.5 } } }],
        });
        const answer = await getAIText(result);

        await auditLog('EMPIRE_INTEL', 'system', `Intel report: ${args.topic.slice(0, 100)}`);
        return { content: [{ type: "text", text: answer }] };
      }

      // ═══════════════════════════════════════════
      // NOTEBOOKLM ENTERPRISE TOOLS
      // ═══════════════════════════════════════════

      case "notebook_create": {
        // NotebookLM Enterprise API via discovery
        const { google } = await import('googleapis');
        
        // Get access token via metadata or ADC
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const authClient = await auth.getClient();
        const accessToken = (await authClient.getAccessToken()).token;

        // Create notebook via NotebookLM API
        const createUrl = `https://notebooklm.googleapis.com/v1alpha1/projects/${PROJECT_ID}/locations/${LOCATION}/notebooks`;
        
        const notebookBody = {
          displayName: args.title,
        };

        const createResp = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notebookBody),
        });

        if (!createResp.ok) {
          const errText = await createResp.text();
          // Fallback: create a local research notebook using Gemini
          console.error("NotebookLM API:", errText);
          
          // Generate notebook content using Gemini instead
          const sourcesText = args.sources.map((s, i) => `Source ${i+1} (${s.title || s.type}): ${s.content.slice(0, 2000)}`).join('\n\n');
          const notebookPrompt = `Create a comprehensive research notebook from these sources. Organize by theme, extract key insights, identify connections, and generate discussion questions.

Sources:
${sourcesText}

Title: ${args.title}`;

          const result = await aiModel.generateContent(notebookPrompt);
          const notebook = await getAIText(result);
          
          // Store notebook on /empire
          const notebookId = `NB-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
          const notebookPath = `/Users/emmanuelhaddad/Empire_Storage/notebooks/${notebookId}.md`;
          await fs.mkdir('/Users/emmanuelhaddad/Empire_Storage/notebooks', { recursive: true });
          await fs.writeFile(notebookPath, `# ${args.title}\n\n${notebook}`);
          
          await auditLog('NOTEBOOK_CREATE', 'system', `Created notebook: ${args.title} → ${notebookPath}`);
          return { content: [{ type: "text", text: `Notebook created: ${notebookId}\nPath: ${notebookPath}\n\nNote: Used Gemini synthesis (NotebookLM Enterprise API requires Gemini Enterprise license).\n\n${notebook}` }] };
        }

        const notebookData = await createResp.json();
        await auditLog('NOTEBOOK_CREATE', 'system', `Created NotebookLM: ${args.title}`);
        return { content: [{ type: "text", text: JSON.stringify(notebookData, null, 2) }] };
      }

      case "notebook_query": {
        // Check if it's a local /empire notebook
        if (args.notebook_id.startsWith('NB-')) {
          const notebookPath = `/Users/emmanuelhaddad/Empire_Storage/notebooks/${args.notebook_id}.md`;
          try {
            const content = await fs.readFile(notebookPath, 'utf-8');
            const prompt = `Based on this notebook content, answer the question.

Notebook:
${content.slice(0, 10000)}

Question: ${args.question}

Provide a thorough answer citing specific parts of the notebook.`;
            
            const result = await aiModel.generateContent(prompt);
            const answer = await getAIText(result);
            return { content: [{ type: "text", text: answer }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Notebook not found: ${args.notebook_id}. Error: ${e.message}` }], isError: true };
          }
        }

        // NotebookLM Enterprise API query
        return { content: [{ type: "text", text: `NotebookLM Enterprise query requires Gemini Enterprise license. Use local notebook IDs (NB-...) for /empire notebooks.` }] };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (e) {
    let msg = e.message || 'Unknown error';
    if (e.errors && Array.isArray(e.errors)) {
      const details = e.errors.map(err => {
        if (err.errors) return err.errors.map(ie => JSON.stringify(ie)).join('; ');
        return JSON.stringify(err);
      }).join(' | ');
      msg = `${msg} — Details: ${details}`;
    }
    if (e.response?.data) msg += ` — Response: ${JSON.stringify(e.response.data).slice(0, 200)}`;
    console.error(`[pushingSecurity] Tool error on ${name}:`, msg);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

// ═══════════════════════════════════════════════════════════════
//   TRANSPORT SETUP
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const transportMode = args.find((a) => a.startsWith("--transport="))?.split("=")[1] || "stdio";
const MCP_PORT = parseInt(process.env.SECURITY_MCP_PORT || "3020", 10);
const MCP_HOST = process.env.MCP_HOST || "0.0.0.0";

if (transportMode === "sse") {
  // ─── HTTP/SSE Transport (for remote fleet workers) ────────
  const sessions = new Map();

  const httpServer = createServer(async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

    const url = new URL(req.url, `http://${req.headers.host || MCP_HOST}`);

    if (url.pathname === "/sse" && req.method === "GET") {
      const transport = new SSEServerTransport("/messages", res);
      sessions.set(transport.sessionId, transport);
      res.on("close", () => sessions.delete(transport.sessionId));
      await server.connect(transport);
    } else if (url.pathname === "/messages" && req.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      const transport = sessions.get(sessionId);
      if (!transport) { res.writeHead(404); res.end("Session not found"); return; }
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          await transport.handlePostMessage(req, res, body);
        } catch (err) {
          res.writeHead(500);
          res.end(err.message);
        }
      });
    } else if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        server: "PushingSecurity",
        version: "3.0.0",
        transport: "sse",
        sessions: sessions.size,
        uptime: process.uptime(),
      }));
    } else {
      res.writeHead(404);
      res.end("Not found. Use /sse to connect or /health to check status.");
    }
  });

  httpServer.listen(MCP_PORT, MCP_HOST, () => {
    console.log(`🚀 PushingSecurity MCP Server (SSE)`);
    console.log(`   Listening: http://${MCP_HOST}:${MCP_PORT}`);
    console.log(`   Connect:   http://${MCP_HOST}:${MCP_PORT}/sse`);
    console.log(`   Health:    http://${MCP_HOST}:${MCP_PORT}/health`);
  });
} else {
  // ─── Stdio Transport (for local agent integration) ────────
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sovereign Credential Vault MCP Server v3.0 Running (stdio) — Deep Research + NotebookLM Enabled");
}
