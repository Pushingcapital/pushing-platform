# PushingTransport Canary Seed Pack

Date: 2026-04-03
Owner: Manny + Codex
Status: Dry-run execution pack
Purpose: Turn the transport mapping work into a concrete, reviewable PCRM mutation bundle without touching production state yet.

## Core Rule

This file is an execution companion, not a record of mutations already performed.

Use it to:

- review the strongest live transport seed records
- decide which association labels are ready to become canonical
- run one small canary at a time
- stop if the first write does not produce the expected graph

Do not run the whole pack blind.

## Companion Docs

- `/Users/emmanuelhaddad/transport_end_to_end_map.md`
- `/Users/emmanuelhaddad/pushing_transport_bundle_contract.md`
- `/Users/emmanuelhaddad/pushing_namespace_layer_map.md`
- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`

## Live Seed Records

### Intake-side seeds

| object | id | label | why it matters |
|---|---|---|---|
| `p242835887_service_requests` | `187341444847` | `C300 transport NY-OC` | cleanest transport intake shell with phase and status already present |
| `p242835887_service_requests` | `163625935584` | `Transport - Audi Q5` | strong transport request name but metadata is under-normalized |

### Execution-side seeds

| object | id | label | why it matters |
|---|---|---|---|
| `deals` | `126036980423` | `Aston Vantage Black one` | strongest transport commercial shell |
| `tickets` | `235401700037` | `Auto Transport: Aston Vantage Black one` | strongest existing transport execution ticket |
| `tasks` | `290833799923` | `Follow up on BOL` | strongest transport document task |
| `tasks` | `292869757668` | `access to transport` | transport access/support task |
| `quotes` | `138662677194` | transport quote with scheduled transport note | strongest payment-side transport artifact |

### Workflow-definition seeds

| object | id | label | why it matters |
|---|---|---|---|
| `tickets` | `235912606402` | `Workflow: Transport phases -> Tickets + Tasks` | explicit workflow-design anchor |
| `tickets` | `235951861480` | `Tooling: Transport Request intake -> HubSpot objects` | explicit intake-tooling anchor |

### Worker seeds

| object | id | label | state |
|---|---|---|---|
| `worker_profiles` | `worker_profile_pushingcap_orchestrator` | `pushingcap_orchestrator` | `active`, `provisioned` |
| `worker_profiles` | `worker_profile_google_run_brain_ingestion` | `google_run_brain_ingestion` | `ready`, `provisioned` |
| `worker_profiles` | `worker_profile_google_run_pc_paygate_bridge` | `google_run_pc_paygate_bridge` | `ready`, `provisioned` |
| `worker_profiles` | `worker_profile_pushingcap_sick_memory_dude` | `pushingcap_sick_memory_dude` | `active`, `provisioned` |

### Existing transport object shell

| object | id | label | note |
|---|---|---|---|
| `p242835887_transport` | `P24-1772715012308-212e50` | skeletal transport object | exists but has no meaningful mapped fields in the export |

## Recommended Canary Strategy

### Canary A: Intake normalization

Goal:
- normalize one transport intake shell before deeper graph writes

Best record:
- `p242835887_service_requests / 163625935584`

Why:
- it is clearly transport-related
- it still lacks `current_phase` and `service_status`
- it is a safer first write than creating a brand-new object

### Canary B: Execution graph binding

Goal:
- stitch one already-real transport deal into a visible execution graph

Best records:
- `deals / 126036980423`
- `tickets / 235401700037`
- `tasks / 290833799923`
- `quotes / 138662677194`

Why:
- these are already transport-facing and operationally legible
- they let us map deal -> ticket -> task -> quote without inventing fake work

### Canary C: New transport object shell

Goal:
- create the first clean transport object expressly tied to a live intake record

Best parent:
- `p242835887_service_requests / 187341444847`

Why:
- this record already has `current_phase=intake`
- it already has `service_status=new`
- it is the cleanest starting point for a proper `p242835887_transport` object

This should happen only after Canary A and Canary B look good.

## Exact Dry-Run Payloads

These match the live `pcrm_*` tool contract:

- `pcrm_update_record`: `obj`, `id`, `field`, `value`
- `pcrm_create_record`: `obj`, `id`, `fields`
- `pcrm_add_association`: `from_obj`, `from_id`, `to_obj`, `to_id`, `label`

### 1. Intake normalization payloads

Normalize the Audi transport request first.

```json
{
  "tool": "pcrm_update_record",
  "args": {
    "obj": "p242835887_service_requests",
    "id": "163625935584",
    "field": "current_phase",
    "value": "intake"
  }
}
```

```json
{
  "tool": "pcrm_update_record",
  "args": {
    "obj": "p242835887_service_requests",
    "id": "163625935584",
    "field": "service_status",
    "value": "new"
  }
}
```

Optional if you want the subtype to speak transport more clearly:

```json
{
  "tool": "pcrm_update_record",
  "args": {
    "obj": "p242835887_service_requests",
    "id": "163625935584",
    "field": "request_name",
    "value": "Transport - Audi Q5"
  }
}
```

### 2. Confirmed worker-assignment payloads

These use already-confirmed worker objects and the confirmed `assigned_to` label on tickets.

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "tickets",
    "from_id": "235951861480",
    "to_obj": "worker_profiles",
    "to_id": "worker_profile_pushingcap_orchestrator",
    "label": "assigned_to"
  }
}
```

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "tickets",
    "from_id": "235912606402",
    "to_obj": "worker_profiles",
    "to_id": "worker_profile_pushingcap_orchestrator",
    "label": "assigned_to"
  }
}
```

### 3. Safe graph-binding payloads

These are the lowest-risk relationship writes for the Aston transport bundle.

`blocked_by` is already a confirmed live label in the codebase.

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "tasks",
    "from_id": "290833799923",
    "to_obj": "tickets",
    "to_id": "235401700037",
    "label": "blocked_by"
  }
}
```

Use the default safe label if you want the graph before you finalize transport-specific taxonomy:

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "deals",
    "from_id": "126036980423",
    "to_obj": "tickets",
    "to_id": "235401700037",
    "label": "associated"
  }
}
```

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "deals",
    "from_id": "126036980423",
    "to_obj": "quotes",
    "to_id": "138662677194",
    "label": "associated"
  }
}
```

### 4. Target-contract graph payloads

These are the better long-term transport labels from the bundle contract, but they should be tested only after one safe `associated` canary succeeds.

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "p242835887_service_requests",
    "from_id": "187341444847",
    "to_obj": "deals",
    "to_id": "126036980423",
    "label": "converted_to"
  }
}
```

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "deals",
    "from_id": "126036980423",
    "to_obj": "p242835887_transport",
    "to_id": "P24-1772715012308-212e50",
    "label": "fulfilled_by_transport"
  }
}
```

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "p242835887_transport",
    "from_id": "P24-1772715012308-212e50",
    "to_obj": "tasks",
    "to_id": "290833799923",
    "label": "tracked_by"
  }
}
```

### 5. Optional new transport object creation

This is the cleanest future-facing payload, but it is intentionally last because it creates new state.

Note:
- the `id` below is a proposed deterministic seed id
- do not run this until you decide the transport object id convention you want

```json
{
  "tool": "pcrm_create_record",
  "args": {
    "obj": "p242835887_transport",
    "id": "transport_seed_sr_ghada_a_t_001",
    "fields": [
      { "key": "transport_job_name", "value": "C300 transport NY-OC" },
      { "key": "transport_status", "value": "new_lead" },
      { "key": "transport_type", "value": "scheduled_transport" },
      { "key": "quote_amount", "value": "" },
      { "key": "carrier_driver_assigned", "value": "" },
      { "key": "bill_of_lading", "value": "" }
    ]
  }
}
```

If that create succeeds, the follow-on association is:

```json
{
  "tool": "pcrm_add_association",
  "args": {
    "from_obj": "p242835887_service_requests",
    "from_id": "187341444847",
    "to_obj": "p242835887_transport",
    "to_id": "transport_seed_sr_ghada_a_t_001",
    "label": "requests_transport"
  }
}
```

## Validation Checklist

After each canary write:

1. run `pcrm_list_associations` on the mutated record
2. verify the association label actually persisted
3. verify the target record still resolves cleanly in list/get flows
4. only then move to the next payload

## What Success Looks Like

Success is not "many writes happened."

Success is:

- one transport intake record is normalized
- one transport workflow ticket is visibly owned
- one transport deal, ticket, task, and quote are visibly connected
- one future transport-object creation path is documented and ready

That is enough to start teaching PCRM the route without creating graph chaos.
