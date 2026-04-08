import subprocess
import os
import re
import boto3
import duckdb

def get_credentials():
    # Try clipboard first since they were there recently
    try:
        clip = subprocess.run(['pbpaste'], capture_output=True, text=True).stdout
        creds = {}
        for line in clip.splitlines():
            line = line.strip()
            if 'export WASABI_ACCESS_KEY' in line or 'access-key' in line.lower():
                match = re.search(r"['\"]?([A-Z0-9]{15,30})['\"]?", line)
                if match: creds['aws_access_key_id'] = match.group(1)
            if 'export WASABI_SECRET_KEY' in line or 'secret-key' in line.lower():
                match = re.search(r"['\"]?([a-zA-Z0-9+/]{30,50})['\"]?", line)
                if match: creds['aws_secret_access_key'] = match.group(1)
            if 'Endpoint' in line or 'endpoint' in line.lower():
                match = re.search(r"(https?://[^\s]+)", line)
                if match: creds['endpoint_url'] = match.group(1)
        if 'endpoint_url' not in creds:
            creds['endpoint_url'] = "https://s3.us-east-1.wasabisys.com"
        
        if 'aws_access_key_id' in creds and 'aws_secret_access_key' in creds:
            return creds
    except Exception:
        pass
    
    # Fallback to .env
    from dotenv import dotenv_values
    env = dotenv_values('.imessage_sender_runtime/.env')
    return {
        'aws_access_key_id': env.get('WASABI_ACCESS_KEY') or env.get('AWS_ACCESS_KEY_ID') or os.environ.get('WASABI_ACCESS_KEY'),
        'aws_secret_access_key': env.get('WASABI_SECRET_KEY') or env.get('AWS_SECRET_ACCESS_KEY') or os.environ.get('WASABI_SECRET_KEY'),
        'endpoint_url': env.get('WASABI_ENDPOINT') or os.environ.get('WASABI_ENDPOINT') or 'https://s3.us-east-1.wasabisys.com'
    }

def main():
    creds = get_credentials()
    if not creds or not creds.get('aws_access_key_id') or not creds.get('aws_secret_access_key'):
        print("Could not find Wasabi credentials in clipboard or .env.")
        return

    s3 = boto3.client('s3', **creds)
    silver_bucket = None
    
    try:
        response = s3.list_buckets()
        buckets = [b['Name'] for b in response['Buckets']]
        print(f"Available buckets: {buckets}")
        for b in buckets:
            if 'silver' in b.lower():
                silver_bucket = b
                break
    except Exception as e:
        print(f"Error listing buckets: {e}")
        return
        
    if not silver_bucket:
        print("Could not find a 'silver' bucket.")
        return
        
    print(f"Target Bucket: {silver_bucket}")
    
    # Identify the file extension in the silver bucket
    try:
        res = s3.list_objects_v2(Bucket=silver_bucket, MaxKeys=5)
        if 'Contents' not in res or len(res['Contents']) == 0:
            print(f"Bucket {silver_bucket} is empty.")
            return
            
        sample_key = res['Contents'][0]['Key']
        print(f"Found sample object: {sample_key}")
        
        if sample_key.endswith('.jsonl') or sample_key.endswith('.json'):
            glob_path = f"s3://{silver_bucket}/{sample_key}"
        elif sample_key.endswith('.parquet'):
            glob_path = f"s3://{silver_bucket}/{sample_key}"
        else:
            glob_path = f"s3://{silver_bucket}/{sample_key}"
            
    except Exception as e:
        print(f"Error listing objects in bucket: {e}")
        return
        
    print(f"Attempting to read with DuckDB: {glob_path}")
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    
    # Strip protocol for DuckDB S3 configuration
    endpoint_clean = creds['endpoint_url'].replace('https://', '').replace('http://', '')
    
    con.execute(f'''
        CREATE SECRET wasabi_secret (
            TYPE S3,
            KEY_ID '{creds["aws_access_key_id"]}',
            SECRET '{creds["aws_secret_access_key"]}',
            ENDPOINT '{endpoint_clean}'
        );
    ''')
    
    try:
        print("\n--- Database Schema ---")
        if 'json' in glob_path:
            print(con.execute(f"DESCRIBE SELECT * FROM read_json_auto('{glob_path}')").df())
            print("\n--- Data Preview (Limit 10) ---")
            print(con.execute(f"SELECT * FROM read_json_auto('{glob_path}') LIMIT 10").df())
        else:
            print(con.execute(f"DESCRIBE SELECT * FROM '{glob_path}'").df())
            print("\n--- Data Preview (Limit 10) ---")
            print(con.execute(f"SELECT * FROM '{glob_path}' LIMIT 10").df())
    except Exception as e:
        print(f"Error querying data with DuckDB: {e}")

if __name__ == '__main__':
    main()
