# Program Deployment Worker Contracts

## Purpose
This file defines the specialist worker identities required for architecting and executing the deployment of new business programs.

---

## 1. Pipeline Architect

### Role Summary
Designs the structural logic, record associations, stage-gate requirements, and handoff contracts for any new program or operational lane.

### Worker Identity Profile
- **Worker Name**: `pipeline_architect`
- **Purpose**: Design durable stage-gate logic and record stacks.
- **Primary Owner**: `pushingcap_orchestrator`
- **Support Workers**: `retool_product_manager`, `retool_data_engineer`

### Contract Details
- **Primary Inputs**: Program Brief, Domain Objects, Service Level Expectations.
- **Primary Outputs**: Formal Pipeline Definition, Stage Map, Exit Gate Criteria.
- **Subscription Type**: `request_response_service`
- **Control Surface**: `worker_control_api`

### Core Responsibilities
- Define the parent-child record graph for the program.
- Map exactly which fields are required at each stage (Exit Gates).
- Define the next-step logic (Smallest Safe Move).
- Design the "Practice Drill" protocol for the lane.

---

## 2. Deployment Executor

### Role Summary
Executes the technical build-out of a designed program. Mutates PCRM schemas, configures active pipelines, subscribes workers, and updates UI routing.

### Worker Identity Profile
- **Worker Name**: `deployment_executor`
- **Purpose**: Technical execution of program build-out and launch.
- **Primary Owner**: `pushingcap_orchestrator`
- **Support Workers**: `postman_api`, `retool_full_stack_developer`

### Contract Details
- **Primary Inputs**: Approved Architecture, API Surfaces, Target UI Routes.
- **Primary Outputs**: Active Pipeline Records, Subscribed Workers, Routing Updates.
- **Subscription Type**: `request_response_service`
- **Control Surface**: `worker_control_api`

### Core Responsibilities
- Create necessary A relations management platform properties and objects.
- Instantiate the pipeline and stages in the live system.
- Hook workers into the appropriate stage callbacks.
- Update the UI routing tables to point to the new program portal.
- Hand off to the `pipeline_architect` for final validation/drills.
