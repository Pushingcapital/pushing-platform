import os
import duckdb
from dotenv import load_dotenv

# Load credentials securely from the .env file
load_dotenv('.imessage_sender_runtime/.env')

# Note: Adjust the variable names if your .env file uses different keys (e.g., AWS_ACCESS_KEY_ID)
ACCESS_KEY = os.getenv('WASABI_ACCESS_KEY') or os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('WASABI_SECRET_KEY') or os.getenv('AWS_SECRET_ACCESS_KEY')

# Standard Wasabi endpoint, adjust region if necessary (e.g., s3.us-east-2.wasabisys.com)
ENDPOINT = os.getenv('WASABI_ENDPOINT', 's3.wasabisys.com')

# TODO: Replace with your actual Wasabi bucket and path to the Gold data
# e.g., 's3://my-gold-bucket/path/*.parquet' or 's3://my-gold-bucket/path/*.csv'
GOLD_DATA_PATH = 's3://YOUR_WASABI_BUCKET_NAME/path/to/gold_data.parquet'

def main():
    if not ACCESS_KEY or not SECRET_KEY:
        print("Error: Could not load credentials from .imessage_sender_runtime/.env")
        print("Make sure WASABI_ACCESS_KEY and WASABI_SECRET_KEY (or AWS equivalents) are defined.")
        return

    print("Connecting to DuckDB...")
    con = duckdb.connect()
    
    print("Installing and loading httpfs extension for S3/Wasabi access...")
    con.execute("INSTALL httpfs;")
    con.execute("LOAD httpfs;")
    
    print("Configuring Wasabi S3 credentials...")
    con.execute(f"""
        CREATE SECRET wasabi_secret (
            TYPE S3,
            KEY_ID '{ACCESS_KEY}',
            SECRET '{SECRET_KEY}',
            ENDPOINT '{ENDPOINT}'
        );
    """)
    
    print(f"Querying Wasabi path: {GOLD_DATA_PATH}\n")
    
    try:
        # Print the schema
        print("--- Database Schema ---")
        con.execute(f"DESCRIBE SELECT * FROM '{GOLD_DATA_PATH}'").show()
        
        # Select and preview 10 rows
        print("\n--- Data Preview (Limit 10) ---")
        con.execute(f"SELECT * FROM '{GOLD_DATA_PATH}' LIMIT 10").show()
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
