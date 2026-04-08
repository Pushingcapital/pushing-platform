# Program Deployment Formal Pipeline Definition

## Purpose
This is the formal pipeline definition set for the `Program Deployment` lane.
It converts the "Deploy a new business program" workflow into the actual record stacks and stage sequences that PCRM should control.

## Pipeline Set
Program Deployment should run through four coordinated pipeline shells:
1. design pipeline
2. configuration pipeline
3. deployment pipeline
4. validation pipeline

## Pipeline Registry

| Shell | Primary object | Pipeline name | Pipeline key | Status |
| --- | --- | --- | --- | --- |
| Design | `service_requests` | `Program Design` | `workflow_pipeline_service_requests_program_design_default` | proposed |
| Configuration | `deals` | `Program Configuration` | `workflow_pipeline_deals_program_configuration_default` | proposed |
| Deployment | `tickets` | `Program Deployment` | `workflow_pipeline_tickets_program_deployment_default` | proposed |
| Validation | `tasks` | `Program Validation` | `workflow_pipeline_tasks_program_validation_default` | proposed |

## A. Design Pipeline (Intake & Specs)

### Pipeline record
| Field | Value |
| --- | --- |
| pipeline_name | `Program Design` |
| pipeline_key | `workflow_pipeline_service_requests_program_design_default` |
| primary_object | `service_requests` |
| purpose | capture and architect new program specifications |
| controlling_worker | `pipeline_architect` |

### Stages
| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Brief Received` | `workflow_stage_service_requests_program_design_brief_received` | ingest new program brief | brief is structured |
| 20 | `Architecture Draft` | `workflow_stage_service_requests_program_design_arch_draft` | design the pipeline & records | arch spec exists |
| 30 | `Worker Draft` | `workflow_stage_service_requests_program_design_worker_draft` | define worker contracts | worker contracts defined |
| 40 | `Design Approved` | `workflow_stage_service_requests_program_design_approved` | final sign-off for config | approval record exists |

## B. Configuration Pipeline (Build)

### Pipeline record
| Field | Value |
| --- | --- |
| pipeline_name | `Program Configuration` |
| pipeline_key | `workflow_pipeline_deals_program_configuration_default` |
| primary_object | `deals` |
| purpose | own the build of the program in PCRM |
| controlling_worker | `deployment_executor` |

### Stages
| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Schema Build` | `workflow_stage_deals_program_config_schema_build` | create properties & objects | schema confirmed |
| 20 | `Pipeline Build` | `workflow_stage_deals_program_config_pipeline_build` | create pipeline & stages | pipelines active |
| 30 | `Worker Provision` | `workflow_stage_deals_program_config_worker_provision` | subscribe & config workers | workers subscribed |
| 40 | `UI Routing` | `workflow_stage_deals_program_config_ui_routing` | update portal & route keys | routing confirmed |

## C. Deployment Pipeline (Launch)

### Pipeline record
| Field | Value |
| --- | --- |
| pipeline_name | `Program Deployment` |
| pipeline_key | `workflow_pipeline_tickets_program_deployment_default` |
| primary_object | `tickets` |
| purpose | own the launch and rollout of the program |
| controlling_worker | `deployment_executor` |

### Stages
| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Pre-Launch Check` | `workflow_stage_tickets_program_deploy_pre_check` | final sanity check | check passed |
| 20 | `Live Activation` | `workflow_stage_tickets_program_deploy_activation` | enable public/portal access | live link exists |
| 30 | `User Training` | `workflow_stage_tickets_program_deploy_training` | hand off to operators | training complete |

## D. Validation Pipeline (Post-Launch)

### Pipeline record
| Field | Value |
| --- | --- |
| pipeline_name | `Program Validation` |
| pipeline_key | `workflow_pipeline_tasks_program_validation_default` |
| primary_object | `tasks` |
| purpose | execute practice drills and heartbeat checks |
| controlling_worker | `pipeline_architect` |

### Stages
| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Practice Drill` | `workflow_stage_tasks_program_validation_drill` | run synthetic test | drill proof captured |
| 20 | `Heartbeat Monitor` | `workflow_stage_tasks_program_validation_heartbeat` | active monitoring | 48h uptime confirmed |
| 30 | `Program Stable` | `workflow_stage_tasks_program_validation_stable` | final sign-off | stability proof logged |
