import os
import boto3
import duckdb
from dotenv import dotenv_values
from datetime import datetime, timezone

env = dotenv_values('.imessage_sender_runtime/.env')

ACCESS_KEY = env.get('WASABI_ACCESS_KEY') or os.environ.get('WASABI_ACCESS_KEY', 'BJURADO85BGPFP3LZ4JN')
SECRET_KEY = env.get('WASABI_SECRET_KEY') or os.environ.get('WASABI_SECRET_KEY', '4bV0cptigcEENGlFzebXsSubF7h2ygGJKlUlQZzD')
ENDPOINT = env.get('WASABI_ENDPOINT', 'https://s3.us-east-1.wasabisys.com')
ENDPOINT_CLEAN = ENDPOINT.replace('https://', '').replace('http://', '')

s3 = boto3.client('s3', 
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY
)

print("Scanning corp-data-silver for the most recent Parquet files (prioritizing DMV/Documents)...")

paginator = s3.get_paginator('list_objects_v2')
most_recent_any = None
most_recent_target = None

try:
    for page in paginator.paginate(Bucket='corp-data-silver'):
        for obj in page.get('Contents', []):
            key = obj['Key']
            if not key.endswith('.parquet'):
                continue
                
            last_modified = obj['LastModified']
            
            # Track absolute most recent
            if most_recent_any is None or last_modified > most_recent_any['LastModified']:
                most_recent_any = obj
                
            # Track most recent target match
            key_lower = key.lower()
            if 'dmv_forms' in key_lower or 'documents' in key_lower:
                if most_recent_target is None or last_modified > most_recent_target['LastModified']:
                    most_recent_target = obj

except Exception as e:
    print('Error listing objects:', e)
    exit(1)

best_match = most_recent_target if most_recent_target else most_recent_any

if not best_match:
    print("No Parquet files found in corp-data-silver!")
    exit(1)

target_key = best_match['Key']
print(f"\nFound target Parquet file: {target_key}")
print(f"Last Modified: {best_match['LastModified']}")

parquet_path = f"s3://corp-data-silver/{target_key}"

print("\nConnecting to DuckDB to audit Silver Parquet...")
con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs;")

con.execute(f'''
    CREATE SECRET wasabi_secret (
        TYPE S3,
        KEY_ID '{ACCESS_KEY}',
        SECRET '{SECRET_KEY}',
        ENDPOINT '{ENDPOINT_CLEAN}'
    );
''')

print(f"\n--- Reading Silver Schema ---")
schema_df = con.execute(f"DESCRIBE SELECT * FROM '{parquet_path}'").df()
print(schema_df)

print(f"\n--- Checking Specific Columns (If present) ---")
columns = schema_df['column_name'].tolist()

cols_to_select = []
if 'source_file' in columns: cols_to_select.append('source_file')
elif 'key' in columns: cols_to_select.append('key as source_file')

if 'sensitivity_level' in columns: cols_to_select.append('sensitivity_level')
if 'pii_redaction_applied' in columns: cols_to_select.append('pii_redaction_applied')
if 'pii_redaction_summary' in columns: cols_to_select.append('pii_redaction_summary')
if 'origin_fidelity_score' in columns: cols_to_select.append('origin_fidelity_score')
if 'truth_score' in columns: cols_to_select.append('truth_score')
if 'doc_family' in columns: cols_to_select.append('doc_family')
if 'extraction_method' in columns: cols_to_select.append('extraction_method')

if 'content' in columns: cols_to_select.append('substring(content, 1, 100) as content_snippet')
elif 'text' in columns: cols_to_select.append('substring(text, 1, 100) as text_snippet')

if not cols_to_select:
    cols_to_select = ['*']

select_clause = ", ".join(cols_to_select)
query = f"SELECT {select_clause} FROM '{parquet_path}' LIMIT 3"

print(f"\nExecuting: {query}")
try:
    print(con.execute(query).df().to_string(index=False))
except Exception as e:
    print("Error querying specific columns:", e)

print(f"\n--- Full First Row Preview (Transposed) ---")
print(con.execute(f"SELECT * FROM '{parquet_path}' LIMIT 1").df().T)
