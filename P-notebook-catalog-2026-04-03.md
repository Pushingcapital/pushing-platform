# P Notebook Catalog

Date: 2026-04-03

## NotebookLM notebooks for `P`

| Label | Title | Notebook ID | NotebookLM resource | Known source count | Role / semantics |
| --- | --- | --- | --- | ---: | --- |
| `ecosystem_corpus` | `Mac Studio Agentic Ecosystem Corpus 2026-04-02` | `ae7a85ae-3574-46f4-98e0-0e84eabb56b7` | `projects/660085746842/locations/us/notebooks/ae7a85ae-3574-46f4-98e0-0e84eabb56b7` | 14 | broad Mac Studio ecosystem corpus |
| `control_plane_atlas` | `PCRM VM GCP Control-Plane Atlas 2026-04-02` | `e25d4029-8ec3-40c6-ae30-4abe6f892520` | `projects/660085746842/locations/us/notebooks/e25d4029-8ec3-40c6-ae30-4abe6f892520` | 11+ appended atlas sources | PCRM, VM, GCP, databases, action registry, and control-plane atlas |
| `p_core_brain` | `P Core Brain 2026-04-02` | `736ddaaf-2b88-4057-8c18-f4cf777a9294` | `projects/660085746842/locations/us/notebooks/736ddaaf-2b88-4057-8c18-f4cf777a9294` | 5 | `P` concept, doctrine, core reasoning corpus |
| `p_runtime_channels_actions` | `P Runtime Channels And Actions 2026-04-02` | `46fd9eab-e871-41b8-ab06-e553d37c472d` | `projects/660085746842/locations/us/notebooks/46fd9eab-e871-41b8-ab06-e553d37c472d` | 8 | `P` runtime channels, bridges, actions, and execution surfaces |

## Recommended usage map

| If `P` needs to answer about... | Preferred notebook |
| --- | --- |
| broad Manny Mac Studio ecosystem materials | `ecosystem_corpus` |
| PCRM, VMs, GCP, databases, action contracts, infrastructure | `control_plane_atlas` |
| `P` concept, role, core behavior, high-level identity | `p_core_brain` |
| `P` runtime channels, bridges, actions, endpoints, integrations | `p_runtime_channels_actions` |

## Current shared support layer outside NotebookLM

| Surface | Identifier | Role |
| --- | --- | --- |
| BigQuery dataset | `brain-481809:agentic_ecosystem_v1` | source registry, chunks, runtime inventories, action contracts, access points |
| GCS prep layer | `gs://pc-bootstrap-imports-brain-481809/agentic-ecosystem-prep/current` | remote shared prep bundle and handoff artifacts |
| Processor VM mirror | `/opt/pc-ecosystem-corpus/prep-layer/current` | mirrored prep layer on `pc-ecosystem-corpus-processor-01` |

## Critical note

If `P` is trying to discover notebooks programmatically, the key identifiers it needs are the notebook IDs and full resource names above.
