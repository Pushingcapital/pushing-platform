import json
import sqlite3
import sys

def process_file(file_path, session_id, cursor):
    print(f"Processing {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                timestamp = data.get("timestamp")
                type_ = data.get("type")
                
                if type_ == "response_item":
                    payload = data.get("payload", {})
                    msg_type = payload.get("type")
                    role = payload.get("role")
                    content = payload.get("content", [])
                    
                    # Extract text representations
                    content_str_parts = []
                    for item in content:
                        if isinstance(item, dict):
                            if item.get("type") == "input_text" or item.get("type") == "text":
                                content_str_parts.append(item.get("text", ""))
                            elif "tool_use" in item.get("type", ""):
                                content_str_parts.append(f"[TOOL_USE] {item.get('name')}: {json.dumps(item.get('input', {}))}")
                            elif "tool_result" in item.get("type", ""):
                                content_str_parts.append(f"[TOOL_RESULT] {item.get('tool_use_id')}: {item.get('content', '')[:200]}...")
                            else:
                                content_str_parts.append(f"[{item.get('type')}]")
                        else:
                            content_str_parts.append(str(item))
                            
                    content_str = "\n".join(content_str_parts)
                    
                    if content_str.strip() or role:
                        cursor.execute("INSERT INTO events (session_id, timestamp, type, role, content) VALUES (?, ?, ?, ?, ?)",
                                       (session_id, timestamp, msg_type, role, content_str))
            except Exception as e:
                pass

def main():
    conn = sqlite3.connect('codex_sessions.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        timestamp TEXT,
        type TEXT,
        role TEXT,
        content TEXT
    )
    ''')
    cursor.execute('DELETE FROM events')
    
    files = [
        ('/Users/emmanuelhaddad/.codex/sessions/2026/02/18/rollout-2026-02-18T01-21-12-019c700d-b4f2-78b1-b2b2-5e10b4a8dd16.jsonl', '019c700d-b4f2-78b1-b2b2-5e10b4a8dd16'),
        ('/Users/emmanuelhaddad/.codex/sessions/2026/02/15/rollout-2026-02-15T20-28-13-019c64b4-c272-7e80-b2b6-6dc40b649b80.jsonl', '019c64b4-c272-7e80-b2b6-6dc40b649b80')
    ]
    
    for path, sid in files:
        process_file(path, sid, cursor)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()
