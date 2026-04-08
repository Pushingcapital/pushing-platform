# PushingP Launch: System Design Master Map

## 1. The Federated Backend (Whole Database)
- **Registry**: pc_gold.db (Worker IDs, Projects, Tasks)
- **Evidence Vault**: michael_ogulnik_case_catalog/ (Evidence, Valuation, Timeline)
- **Ingestion Log**: p_adk_ingest_agent.sqlite (Daily Ingest Packets)
- **Operations**: codex_sessions.db, push_p_responder.db

## 2. The Interaction Surface (The Voice of P)
- **Input**: imessage_listener (Active on PID 84566)
- **Voice Agents**: pcrm-voice-codex, pcrm-voice-debate, pcrm-voice-media
- **Control**: pipeline_architect.py (Spawn-Driven Design)

## 3. The Truth Engine (Normalized Nodes)
- **Bronze (Raw)**: Wasabi S3
- **Silver (Cleaned)**: Parquet Extraction
- **Gold (Proven)**: SQL Vector Search
