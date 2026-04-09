import os
import sys
import json
import requests

POSTMAN_API_KEY = os.environ.get("POSTMAN_API_KEY", "")

def generate_collection(tools):
    items = []
    for tool in tools:
        name = tool.get("name", "UnknownTool")
        desc = tool.get("description", "")
        params = tool.get("parameters", {}).get("properties", {})
        
        items.append({
            "name": name,
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Accept", "value": "application/json"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{{raw_payload}}"
                },
                "url": {
                    "raw": f"{{{{p_gateway_base_url}}}}/p-execute/{name}",
                    "host": ["{{p_gateway_base_url}}"],
                    "path": ["p-execute", name]
                },
                "description": desc
            }
        })
        
    tool_names = [t.get("name") for t in tools if t.get("name")]

    return {
        "info": {
            "name": "P NATIVE WORKER TOOLS (Orchestration)",
            "description": "Auto-generated collection of P's internal Mac Studio orchestration bindings and gateway executions.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "event": [
            {
                "listen": "prerequest",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        "const target = pm.iterationData.get(\"tool\");",
                        "if (!target) return; // Allow manual execution",
                        "",
                        "// Normalize raw_payload (iteration data object -> JSON string)",
                        "let rp = pm.iterationData.get(\"raw_payload\");",
                        "if (typeof rp === \"object\") {",
                        "  pm.variables.set(\"raw_payload\", JSON.stringify(rp));",
                        "} else if (typeof rp === \"string\") {",
                        "  pm.variables.set(\"raw_payload\", rp);",
                        "}",
                        "",
                        "// Hard safety gates for mutation runs",
                        "const allow = pm.environment.get(\"ALLOW_MUTATIONS\");",
                        "const mutationIntent = pm.iterationData.get(\"mutation_intent\") === \"YES\";",
                        "const destructive = new Set([",
                        "  \"github_create_pr\",",
                        "  \"github_commit_and_push\",",
                        "  \"pcrm_delete_record\",",
                        "  \"notebooklm_delete\",",
                        "  \"notebooklm_write\",",
                        "  \"run_bash_command\",",
                        "  \"execute_local_shell\"",
                        "]);",
                        "",
                        "if (destructive.has(target)) {",
                        "  if (allow !== \"true\" || !mutationIntent) {",
                        "    throw new Error(`[GUARD:READONLY_BLOCK] tool=${target} iter=\"${pm.iterationData.get(\"name\") || \"\"}\" -> mutation denied. Required: env.ALLOW_MUTATIONS=\"true\" AND data.mutation_intent=\"YES\". Observed: env.ALLOW_MUTATIONS=\"${pm.environment.get(\"ALLOW_MUTATIONS\")}\" data.mutation_intent=\"${pm.iterationData.get(\"mutation_intent\")}\".`);",
                        "  }",
                        "} else if (mutationIntent) {",
                        "  throw new Error(`[GUARD:MUTATION_ALLOWLIST] tool=${target} iter=\"${pm.iterationData.get(\"name\") || \"\"}\" -> rejected. This lane only permits destructive tools. If this is intended to be read-only, move it to the canary data file. Allowed destructive tools: ${Array.from(destructive).join(\", \")}`);",
                        "}",
                        "",
                        "const order = JSON.parse(pm.collectionVariables.get(\"request_order\") || \"[]\");",
                        "if (!order.length) throw new Error(\"Collection variable `request_order` is missing/empty.\");",
                        "",
                        "const current = pm.info.requestName;",
                        "const idx = order.indexOf(current);",
                        "if (idx === -1) throw new Error(`Request \"${current}\" not found in request_order.`);",
                        "",
                        "const ranKey = `ran_${pm.info.iteration}`;",
                        "const alreadyRan = pm.collectionVariables.get(ranKey) === \"true\";",
                        "",
                        "if (alreadyRan) {",
                        "  postman.setNextRequest(pm.execution.location.current);",
                        "  return;",
                        "}",
                        "",
                        "if (current !== target) {",
                        "  const nextName = order[idx + 1];",
                        "  postman.setNextRequest(nextName || null);",
                        "} else {",
                        "  pm.collectionVariables.set(ranKey, \"true\");",
                        "  postman.setNextRequest(null);",
                        "}"
                    ]
                }
            },
            {
                "listen": "test",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        "pm.test(\"Status is 200 OK\", function () {",
                        "    pm.response.to.have.status(200);",
                        "});",
                        "pm.test(\"Response body is non-empty\", function () {",
                        "    pm.expect(pm.response.text()).to.be.a(\"string\").and.not.eql(\"\");",
                        "});",
                        "pm.test(\"If JSON, it parses\", function () {",
                        "    const ct = (pm.response.headers.get(\"Content-Type\") || \"\").toLowerCase();",
                        "    if (ct.includes(\"application/json\") || ct.includes(\"+json\")) {",
                        "        pm.response.json();",
                        "    }",
                        "});"
                    ]
                }
            }
        ],
        "variable": [
            {
                "key": "p_gateway_base_url",
                "value": "http://localhost:8080",
                "type": "string"
            },
            {
                "key": "request_order",
                "value": json.dumps(tool_names),
                "type": "string"
            }
        ],
        "item": items
    }

def main():
    print("[*] Reading P_TOOLS.json...")
    try:
        with open(os.path.expanduser("~/bin/P_TOOLS.json"), "r") as f:
            tools = json.load(f)
    except Exception as e:
        print(f"[!] Failed to read P_TOOLS.json: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Parsed {len(tools)} physical worker tool bindings.")
    
    collection = generate_collection(tools)
    
    export_path = os.path.expanduser("~/P_TOOLS_COLLECTION.json")
    print(f"[*] Writing Postman Collection securely to local disk: {export_path}")
    
    with open(export_path, "w") as f:
        json.dump(collection, f, indent=4)
        
    print("[+] SUCCESS! Safe local deployment complete. You can now securely import P_TOOLS_COLLECTION.json into Postman!")

if __name__ == "__main__":
    main()
