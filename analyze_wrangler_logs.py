import os
import duckdb
from dotenv import load_dotenv

# Load explicit credentials from the .env file if they exist
load_dotenv('.imessage_sender_runtime/.env')

ACCESS_KEY = os.getenv('WASABI_ACCESS_KEY') or os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('WASABI_SECRET_KEY') or os.getenv('AWS_SECRET_ACCESS_KEY')
ENDPOINT = 's3.us-east-1.wasabisys.com'

TARGET_PATH = 's3://corp-data-silver/ingest/mdm-2026-02-18-a/Extreme/EMMANUEL_HOME_BACKUP_2026-01-11/.wrangler/**/*.parquet'

def main():
    print("Connecting to local DuckDB instance...")
    con = duckdb.connect()
    
    print("Installing and loading httpfs extension for S3/Wasabi access...")
    con.execute("INSTALL httpfs;")
    con.execute("LOAD httpfs;")
    
    # Configure Wasabi credentials
    if ACCESS_KEY and SECRET_KEY:
        print("Configuring Wasabi using credentials found in environment...")
        con.execute(f"""
            CREATE SECRET wasabi_secret (
                TYPE S3,
                KEY_ID '{ACCESS_KEY}',
                SECRET '{SECRET_KEY}',
                ENDPOINT '{ENDPOINT}'
            );
        """)
    else:
        print("Configuring Wasabi using your existing AWS profile (aws configure)...")
        con.execute(f"""
            CREATE SECRET wasabi_secret (
                TYPE S3,
                PROVIDER CREDENTIAL_CHAIN,
                ENDPOINT '{ENDPOINT}'
            );
        """)
    
    print(f"\nTargeting Path: {TARGET_PATH}\n")
    
    try:
        print("--- Parquet Schema ---")
        con.execute(f"DESCRIBE SELECT * FROM read_parquet('{TARGET_PATH}', union_by_name=true)").show()
        
        print("\n--- Wrangler Logs Preview (First 10 Rows) ---")
        # Pulling a sample to inspect for SQL text, JSON payloads, or migrations
        con.execute(f"SELECT * FROM read_parquet('{TARGET_PATH}', union_by_name=true) LIMIT 10").show()
        
    except Exception as e:
        print(f"\nAn error occurred while querying DuckDB: {e}")
        print("Note: The files might not be uploaded yet, or the path might not contain Parquet files.")

if __name__ == "__main__":
    main()
