from google.cloud import storage
import os

def upload_to_gcs(local_path, bucket_name, gcs_path):
    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(gcs_path)
        blob.upload_from_filename(local_path)
        print(f"Successfully uploaded {local_path} to gs://{bucket_name}/{gcs_path}")
    except Exception as e:
        print(f"Upload failed: {e}")

if __name__ == "__main__":
    local_file = "/Users/emmanuelhaddad/Downloads/UserOne_Documents/PUSHING_CAPITAL_MASTER_BRAIN.md"
    bucket = "pc-coo-agent-master-brain"
    destination = "PUSHING_CAPITAL_MASTER_BRAIN.md"
    upload_to_gcs(local_file, bucket, destination)
