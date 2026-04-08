# Company Onboarding Pipeline (B2B)

## Purpose
Automate the verification and instantiation of Organizations/Companies within the Pushing Capital estate.

## Pipeline Registry
| Shell | Primary object | Pipeline name | Pipeline key |
| --- | --- | --- | --- |
| Onboarding | `parties` | `Company Onboarding` | `workflow_pipeline_parties_company_onboarding_default` |

## Stages
| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Organization Intake` | `workflow_stage_parties_org_intake` | Capture EIN & Name | Facts structured |
| 20 | `KYB Verification` | `workflow_stage_parties_kyb_verify` | Verify business standing | `compliance_status` = 'verified' |
| 30 | `Contact Binding` | `workflow_stage_parties_contact_binding` | Link individual to org | `party_relationship` exists |
| 40 | `Portal Provision` | `workflow_stage_parties_portal_provision` | Create company workspace | Workspace ID logged |
| 50 | `Company Active` | `workflow_stage_parties_active` | Final activation | Handed to Account Manager |

## Outreach Logic
- **Success SMS**: "Welcome [Company Name] to the network. Your organizational portal is now active."
- **Missing Docs**: "[Contact Name], we need your Articles of Incorporation to finish the [Company Name] setup."
