# Pushing Cap Keyword Inventory

Generated: 2026-03-05
Scope: `/Volumes/Pushing Cap`

## Exact keyword result

I did not find exact phrase hits on the mounted volume for:

- `golden record`
- `single source of truth`
- `data integrity`
- `business plan`
- `operating bible`
- `user one`

The closest authoritative equivalents on the volume are `system of record`, `canonical`, `inventory`, `drive map`, and move-manifest files.

## Closest authoritative files on the mounted volume

| File | Date | Size | Version | Similarities | What's different |
| --- | --- | ---: | --- | --- | --- |
| `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/00_README/README.md` | 2026-01-11 22:21:11 | 1,013 B | pointer-only | Same "single source of truth" theme as the canonical DB and drive map assets. | Explicitly says the SSD is **not** the system of record; it points to local Mac Studio SoR paths. |
| `/Volumes/Pushing Cap/drive_map_report/drive_map.md` | 2026-01-09 11:18:56 | 68,617 B | full metadata report | Same dataset/time as `drive_map_redacted_summary.md`; both are mapping/index files. | Full detail report with concrete paths, timestamps, and notable file locations. |
| `/Volumes/Pushing Cap/drive_map_report/drive_map_redacted_summary.md` | 2026-01-09 11:18:56 | 3,331 B | redacted summary | Same generator and timestamp as `drive_map.md`. | Short, redacted subset of the full drive map. |
| `/Volumes/Pushing Cap/databases/crm_query/crm_query_catalog_LATEST.db` | 2026-02-11 14:26:10 | 2,801,664 B | `LATEST` | Same build set as the summary JSON and README; all describe the canonical A relations management platform asset inventory. | Queryable SQLite catalog; 791 canonical rows and 288 rows marked with duplicates. |
| `/Volumes/Pushing Cap/databases/crm_query/crm_query_catalog_LATEST.summary.json` | 2026-02-11 14:26:10 | 3,722 B | `LATEST` | Same build timestamp and source signature family as the DB. | Lightweight counts/summary only, not queryable. |
| `/Volumes/Pushing Cap/databases/crm_query/README.md` | 2026-02-11 14:26:58 | 2,050 B | build doc | Same canonical asset set as the DB/summary. | Explains build/sync workflow and tables like `crm_assets_canonical` and `volume_cleanup_inventory`. |
| `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/04_STAGING/macstudio_cleanup_20260211-195937/manifests/google_drive_root_moves.tsv` | 2026-02-11 20:37:48 | 16,218 B | move manifest | Same mapping/log role as `moved_items.csv`; both are source-to-destination manifests. | Maps Google Drive root moves into shortcut folders like `_01_DOCS_SHORTCUTS` and `_02_SHEETS_SHORTCUTS`. |
| `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/04_STAGING/macstudio_cleanup_20260211-195937/manifests/moved_items.csv` | 2026-02-11 20:44:00 | 3,962 B | move manifest | Same staging batch as `google_drive_root_moves.tsv`. | Tracks local-to-SSD moves with size and status, not Google Drive document reorganizations. |
| `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/02_EXPORTS/drive_downloads/drive-download-20250917T231457Z-1-001/Inventory.xlsx` | 2024-03-21 12:45:04 | 214,892 B | base file | Same file stem as `Inventory(1).xlsx`; both are inventory spreadsheets. | Main workbook: 10 sheets and about 8,129 sampled rows across sheets. |
| `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/02_EXPORTS/drive_downloads/drive-download-20250917T231457Z-1-001/Inventory(1).xlsx` | 2021-06-07 10:48:01 | 4,918 B | `(1)` | Same naming family as `Inventory.xlsx`. | Tiny derivative/older variant: 1 sheet and 3 sampled rows. |

## File-location mappings found

Primary mapping/index files on the volume:

- `/Volumes/Pushing Cap/drive_map_report/drive_map.md`
- `/Volumes/Pushing Cap/drive_map_report/drive_map_redacted_summary.md`
- `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/04_STAGING/macstudio_cleanup_20260211-195937/manifests/google_drive_root_moves.tsv`
- `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/04_STAGING/macstudio_cleanup_20260211-195937/manifests/moved_items.csv`
- `/Volumes/Pushing Cap/PUSHING_CAPITAL_CANONICAL/02_EXPORTS/drive_downloads/drive-download-20250917T231457Z-1-001/Inventory.xlsx`

Examples of mapped business/data-plan titles captured inside `google_drive_root_moves.tsv`:

- `Stack Audit and Inventory.gsheet`
- `Workflow Development For Subscription Data.gdoc`
- `Programmatic Strategy Implementation Guidance.gdoc`
- `P.C. Sovereign Data Architecture: Segmentation & Token Economics.gdoc`
- `Advanced Tech Integration Plan.gdoc`
- `Strategic Operating Master Plan Creation.gdoc`
- `Unified AI & Data Strategy Across Your Apple Devices (1).pdf`
- `Information about data 27 MODULES FOR WORK orchestration and modules.gdoc`
- `Executive implementation playbook — actionable, step-by-step game plan.gdoc`

Examples of concrete mapped locations inside `drive_map.md`:

- `/Users/emmanuelhaddad/Downloads/pushing-capital-live-system-map.lucid`
- `/Users/emmanuelhaddad/Downloads/pushing-capital-live-system-map (1).lucid`
- `/Users/emmanuelhaddad/Library/Mobile Documents/com~apple~CloudDocs/Downloads/PUSHING_CAPITAL_SERVICES_CATALOG.md`
- `/Users/emmanuelhaddad/Library/Mobile Documents/com~apple~CloudDocs/Downloads/pushing_capital_financial_products 2.md`
- `/Users/emmanuelhaddad/Library/Mobile Documents/com~apple~CloudDocs/Downloads/pushing_capital_roles_primitive 2.md`

## Databases created in the last 6 days

Checked against the current date `2026-03-05`, so the cutoff was `2026-02-27`.

Result: no database files were found on the mounted `Pushing Cap` volume in the searched database areas with creation/modification dates on or after `2026-02-27`.

Most recent database I found in the main volume database area:

- `/Volumes/Pushing Cap/databases/crm_query/crm_query_catalog_LATEST.db` — 2026-02-11 14:26:10 — 2,801,664 B

Additional note:

- The quarantine database archive under `/Volumes/Pushing Cap/DATABASES_QUARANTINE_RESEARCH/copies/by_created_date/` only showed dated folders through `2026-01-12`, so it also did not contain anything from the last 6 days.

## Out-of-scope cross-reference

I found one `user one` reference in the catalog DB, but it points to a local file, not a file stored on the mounted `Pushing Cap` volume:

- `/Users/emmanuelhaddad/Documents/system_of_record/build_user_one_orchestration_ingest_pack.py`
