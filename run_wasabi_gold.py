import subprocess
import os
import re
import boto3

def get_credentials_from_clipboard():
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
            
    # Fallback to defaults
    if 'endpoint_url' not in creds:
        creds['endpoint_url'] = "https://s3.us-east-1.wasabisys.com"
        
    return creds

def find_gold_bucket(creds):
    s3 = boto3.client('s3', **creds)
    try:
        response = s3.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        print(f"Found {len(buckets)} buckets.")
        for bucket in buckets:
            # Check if this bucket has gold_index.lance or anything gold
            res = s3.list_objects_v2(Bucket=bucket, Prefix='gold', MaxKeys=5)
            if 'Contents' in res and len(res['Contents']) > 0:
                print(f"Found gold data in bucket: {bucket}")
                for obj in res['Contents']:
                    if obj['Key'].endswith('.parquet') or obj['Key'].endswith('.lance'):
                        return bucket, obj['Key']
                return bucket, "gold_index.lance"
            
            # fallback: look for ANY .parquet or .lance
            res = s3.list_objects_v2(Bucket=bucket, MaxKeys=100)
            if 'Contents' in res:
                for obj in res['Contents']:
                    if 'gold' in obj['Key'].lower():
                        print(f"Found gold data in bucket: {bucket}")
                        return bucket, obj['Key']
                        
        print("Could not definitively find the gold bucket.")
        return buckets[0] if buckets else None, None
    except Exception as e:
        print(f"Failed to list buckets: {e}")
        return None, None

def main():
    creds = get_credentials_from_clipboard()
    if 'aws_access_key_id' not in creds or 'aws_secret_access_key' not in creds:
        print("Could not parse Wasabi credentials from clipboard.")
        return
        
    print("Credentials loaded successfully from clipboard.")
    
    bucket, key = find_gold_bucket(creds)
    if not bucket:
        print("No buckets found or connection failed.")
        return
        
    print(f"Target Bucket: {bucket}")
    
    # We will try to load it via lancedb since we saw .lance earlier,
    # or duckdb if it's parquet.
    
    # Setup env for lancedb/duckdb
    os.environ['AWS_ACCESS_KEY_ID'] = creds['aws_access_key_id']
    os.environ['AWS_SECRET_ACCESS_KEY'] = creds['aws_secret_access_key']
    os.environ['AWS_ENDPOINT_URL_S3'] = creds['endpoint_url']
    os.environ['AWS_REGION'] = 'us-east-1' # Default for Wasabi usually
    
    if key and (key.endswith('.lance') or '.lance' in key):
        import lancedb
        import duckdb
        print("Data appears to be a Lance dataset. Opening with LanceDB...")
        try:
            # LanceDB needs s3://bucket/path
            base_path = f"s3://{bucket}"
            db = lancedb.connect(base_path, storage_options={
                "aws_access_key_id": creds['aws_access_key_id'],
                "aws_secret_access_key": creds['aws_secret_access_key'],
                "aws_endpoint": creds['endpoint_url'],
                "aws_region": "us-east-1"
            })
            table_names = db.table_names()
            print(f"LanceDB tables found: {table_names}")
            
            table_name = "gold_index"
            if table_name in table_names:
                table = db.open_table(table_name)
                # Query with duckdb
                df = table.to_lance()
                print("\n--- Database Schema ---")
                print(table.schema)
                
                print("\n--- Data Preview (Limit 10) ---")
                duckdb.query("SELECT * FROM df LIMIT 10").show()
            else:
                print(f"Table '{table_name}' not found. Available tables: {table_names}")
        except Exception as e:
            print(f"Error querying Lance dataset: {e}")
            
    else:
        # Default to duckdb + httpfs for parquet/csv
        import duckdb
        path = f"s3://{bucket}/{key}" if key else f"s3://{bucket}/gold/*.parquet"
        print(f"Attempting to read with DuckDB (Parquet/CSV): {path}")
        con = duckdb.connect()
        con.execute("INSTALL httpfs; LOAD httpfs;")
        con.execute(f'''
            CREATE SECRET wasabi_secret (
                TYPE S3,
                KEY_ID '{creds['aws_access_key_id']}',
                SECRET '{creds['aws_secret_access_key']}',
                ENDPOINT '{creds['endpoint_url'].replace("https://", "").replace("http://", "")}'
            );
        ''')
        
        try:
            print("--- Database Schema ---")
            con.execute(f"DESCRIBE SELECT * FROM '{path}'").show()
            print("\n--- Data Preview (Limit 10) ---")
            con.execute(f"SELECT * FROM '{path}' LIMIT 10").show()
        except Exception as e:
            print(f"Error querying Parquet data: {e}")

if __name__ == "__main__":
    main()
