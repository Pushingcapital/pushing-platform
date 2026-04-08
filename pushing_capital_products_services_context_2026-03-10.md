# Pushing Capital Products And Services Context

Generated: 2026-03-10

## High-confidence business framing

- Pushing Capital is described in Apple Notes as a "sovereign data clearinghouse and transaction orchestrator" and as an operating system for high-friction workflows across automotive, finance, and business operations.
- A recurring internal concept is `UserOne`, explicitly described in notes as Pushing Capital's automotive software division.
- The cleanest current structured catalog shows **72 total services**:
  - **44 automotive**
  - **28 finance**
- Multiple sources frame the business as vertically integrated rather than a single narrow service line.
- User clarification for this pass: **HubSpot is deprecated** and the **local A relations management platform/platform is the current system of record**.

## Canonical service inventory

Primary structured source:
- `/Users/emmanuelhaddad/Downloads/pushing-capital-services-database.md`

Supporting machine-readable sources:
- `/Users/emmanuelhaddad/pc-data-platform/artifacts/catalog/pushpush_automotive_products.json`
- `/Users/emmanuelhaddad/pc-data-platform/artifacts/catalog/pushpush_finance_products.json`
- `/Users/emmanuelhaddad/pc-data-platform/artifacts/catalog/d1_products.json`

### Automotive categories

- Vehicle Sales: New Car Sales, Used Car Sales, Consignment, Elite Vehicle Purchase Solutions
- Inspection/Appraisal: Body Inspection, Complete Vehicle Scan, Pre-purchase Inspection, Safety Inspection, Vehicle Appraisal, Standalone Inspection Package, Standalone Appraisal Package
- DMV: Title & Registration, VIN/Odometer Verification, Notary Services, Standalone DMV Package
- Transport: Emergency Towing, Scheduled Transport, Standalone Transport Package
- Glass: Chip Repair, Windshield Replacement, Side/Rear Glass Replacement
- Body Work: Dent Repair, Panel Repair/Replacement, Paint Refinishing
- Repair: Mechanical Repair, Electrical Repair
- Tires/Wheels: Tire Sales, Mounting & Balancing, Tire Rotation, Wheel Alignment, Wheel Repair - Cosmetic, Wheel Repair - Straightening
- Keys: Key Cutting, Key Fob Programming
- Mobile Services: Mobile Car Wash, Detail Service, Complete Detail, Pre-photograph Wash, Standalone Mobile Services Package
- Parts: Parts (New), Parts (Used), Parts (Refurbished), Standalone Parts Package
- Labor: Standalone Labor Package

### Finance categories

- Credit Services: Credit Strategy Discovery, Credit Strategy, Tradeline Validation, MyScoreIQ 7-day trial, MyScoreIQ Monthly Subscription, MyScoreIQ On-Demand Pull
- Auto Finance: Loan Acquisition, Funding Options Review, Rate & Term Review, Refinance/Consolidation Options, Readiness Checklist, Curated Lender Introductions, Standalone Auto Finance Package, Standalone Retail/Broker Package, Standalone Wholesale/Broker Package
- Business Formation: LLC Formation, Corporation (C/S-Corp), DBA Registration, Nonprofit Formation, EIN Registration, Business Credit Setup
- Bookkeeping & Tax: Monthly Reconciliation, Invoices & Bills Tracking, Profit & Loss (P&L), Balance Sheet, Tax Summary, Document Gathering, Audit Packet Preparation

## Operating model and delivery lanes

Sources:
- `/Users/emmanuelhaddad/Downloads/pushing-capital-gold-handoff/03_demo_query_report.md`
- Apple Notes `# PUSHING CAPITAL - COMPREHENSIVE KNOWLEDGE BASE AUDIT`
- Apple Notes `Pushing Capital: Strategic & Operational Source of Truth`

Observed operating lanes and pipeline names include:

- Master Customer Journey
- Client Onboarding
- Customer Pipeline
- Service Request Pipeline
- Auto Transport
- Auto Repair Pipeline
- Service Dispatch Pipeline
- Auto Consignment Services Pipeline
- DMV Concierge Pipeline
- Credit Strategy Personal Pipeline
- Financial Preparation & Lender Matching
- Legal Consultation & Attorney Network
- BLOC

Notes and retrieval artifacts also describe:

- 4 distinct user interfaces:
  - Deal Architect portal
  - Client portal
  - Subcontractor portal
  - Internal ops
- 600+ Deal Architects nationwide
- 90/10 profit split with Deal Architects
- multi-lender arbitrage / simultaneous lender submissions

## What the training material suggests

Source:
- `/Users/emmanuelhaddad/Library/CloudStorage/GoogleDrive-manny@pushingcap.com/Shared drives/Pushing Capital/Training Modules`

Training modules imply real or intended operational coverage in:

- Advertising
- Appraisals
- DMV
- Desk / deal architecture
- Finance
- Inspections
- Mobile Repair
- Parts
- Recon
- Transport / logistics

The file names are especially revealing:

- `Advertising Anchored to VIN Truth`
- `Wholesale Listing & Packet Distribution`
- `Strategic Blueprint for the Deal Architect Training Module`
- inspection modules for scan tools, alignment evidence, electrical diagnostics, SRS verification, ADAS programming
- mobile service modules for glass, keys, PDR, upholstery, wheels

## HubSpot and A relations management platform context tied to products/services

Sources:
- Apple Note `B5 - HubSpot: Explore Properties & Objects`
- Apple Note `PUSHING CAPITAL - COMPLETE TECH STACK DEVELOPER AUDIT`

Product/service-related A relations management platform structure observed in notes:

- HubSpot account `242835887`
- Custom objects called out repeatedly:
  - Financial Profiles
  - Credit Tradelines
  - Service Requests
  - Vehicles
- One note claims 400+ contact properties built
- Another audit note claims HubSpot Enterprise with 33 custom objects and 8,672 properties
- Current-state correction from the user: treat this HubSpot material as **historical / migration context**, not the active production A relations management platform.

## Decoded Apple Notes attachments

The two finance-related Apple Notes attachments were resolved to on-disk markdown files under the Notes media store:

- `/Users/emmanuelhaddad/Library/Group Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/950E4B54-1052-4E87-AEF3-A93BDF7D8693/1_E64A2B24-6E78-4641-ABCC-5CE52802B81F/pushing_capital_financial_products.md`
- `/Users/emmanuelhaddad/Library/Group Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/5F3A7FE8-AFE8-4075-A4A2-CDD22C8D9860/1_7EA0E325-7404-4C61-A626-E810E65B4045/pushing_capital_all_banking_products.md`

These appear to be reference universes, not the local canonical service catalog:

- `pushing_capital_financial_products.md` catalogs dealer/auto-finance and F&I product types.
- `pushing_capital_all_banking_products.md` catalogs a broader lending universe across consumer, mortgage, commercial, revolving credit, and specialty lending.

Derived searchable export:

- `/Users/emmanuelhaddad/pushing_capital_notes_finance_reference_products_2026-03-10.csv`

Current canonical local products export:

- `/Users/emmanuelhaddad/pushing_capital_products_catalog_2026-03-10.csv`

## Notes-derived strategic framing

Highest-signal Apple Notes bodies recovered from `NoteStore.sqlite`:

- `Pushing Capital: Strategic & Operational Source of Truth`
- `# PUSHING CAPITAL - COMPREHENSIVE KNOWLEDGE BASE AUDIT`
- `These are hubspot research that pertains to Pushing Capital`

Important claims from those notes:

- "72 distinct automotive and financial services"
- flat-rate user retainer / subscription model
- zero-commission lender matching / reverse-auction framing
- transaction payment orchestration as a core business function
- custom A relations management platform / sovereign infrastructure emphasis
- AI-mediated ingestion and structured JSON extraction
- user data protection and source-scoring as central product principles

## Tensions and contradictions worth tracking

- Some notes say Pushing Capital relies on a fully custom in-house A relations management platform and explicitly "does not use HubSpot."
- Other notes and audits clearly describe an active HubSpot Enterprise environment with major custom-object investment.
- Best interpretation before user clarification was that the business was transitioning from heavy HubSpot usage toward a custom A relations management platform / sovereign stack.
- Updated interpretation with user clarification: the transition is complete enough that HubSpot should now be treated as deprecated legacy context.

- Some materials describe Pushing Capital broadly across automotive, finance, and business operations.
- The clearest machine-readable catalog presently covers automotive plus finance only.
- Best interpretation: automotive + finance are the best-structured current domains, while broader "business operations" remains a strategic umbrella.

- UserOne is clearly treated as the automotive division in planning notes, but I did not find a single definitive current architecture document in the local live paths I checked.

## Most useful source files for next passes

- `/Users/emmanuelhaddad/Downloads/pushing-capital-services-database.md`
- `/Users/emmanuelhaddad/pc-data-platform/artifacts/catalog/pushpush_automotive_products.json`
- `/Users/emmanuelhaddad/pc-data-platform/artifacts/catalog/pushpush_finance_products.json`
- `/Users/emmanuelhaddad/Downloads/pushing-capital-gold-handoff/03_demo_query_report.md`
- `/Users/emmanuelhaddad/pc-data-platform/README.md`
- `/Users/emmanuelhaddad/Library/CloudStorage/GoogleDrive-manny@pushingcap.com/Shared drives/Pushing Capital/Training Modules`
- Apple Notes DB:
  - `/Users/emmanuelhaddad/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite`

## Recommended next extraction passes

- Expand the Notes attachment pass beyond `pushing_capital_financial_products.md` and `pushing_capital_all_banking_products.md` into adjacent UserOne / credit-decision / operating-bible attachments.
- Walk the shared-drive training modules and convert the module names into a product capability map.
- Extract current A relations management platform object schemas to map products/services to their operational records.
