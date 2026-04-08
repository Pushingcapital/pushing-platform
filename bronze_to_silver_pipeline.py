import boto3
import os
import logging
import mimetypes
from dotenv import dotenv_values

try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

env = dotenv_values('worker_fresh.env')

s3 = boto3.client(
    's3',
    aws_access_key_id=env['WASABI_ACCESS_KEY'],
    aws_secret_access_key=env['WASABI_SECRET_KEY'],
    endpoint_url=env['WASABI_ENDPOINT']
)

BRONZE_BUCKET = 'corp-data-bronze'
SILVER_BUCKET = 'corp-data-silver'

CUSTOM_EXTENSIONS = {
    "image/heic": ".heic",
    "video/quicktime": ".mov",
    "application/x-sqlite3": ".sqlite",
    "image/x-sony-arw": ".arw",
    "text/plain": ".txt"
}

def identify_and_transfer():
    logging.info(f"Starting Bronze to Silver Pipeline from {BRONZE_BUCKET} to {SILVER_BUCKET}")
    
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=BRONZE_BUCKET)
    
    processed_count = 0
    transferred_count = 0

    for page in pages:
        if 'Contents' not in page:
            continue
            
        for obj in page['Contents']:
            key = obj['Key']
            filename = os.path.basename(key)
            
            # Skip hidden files or folders
            if not filename or filename.startswith('.') or key.endswith('/'):
                continue
                
            processed_count += 1
            
            # According to the Brain doc, we process files with no extensions
            if "." not in filename:
                # We need to identify it. Read first 2048 bytes.
                try:
                    response = s3.get_object(Bucket=BRONZE_BUCKET, Key=key, Range='bytes=0-2047')
                    file_header = response['Body'].read()
                    
                    mime_type = None
                    if HAS_MAGIC:
                        mime_type = magic.from_buffer(file_header, mime=True)
                    else:
                        # Fallback heuristic or just leave it unknown
                        pass
                        
                    ext = CUSTOM_EXTENSIONS.get(mime_type)
                    if not ext and mime_type:
                        ext = mimetypes.guess_extension(mime_type)
                        
                    if not ext:
                        ext = ".bin" # fallback
                        
                    new_key = f"identified/{key}{ext}"
                    
                    logging.info(f"Identified {key} as {mime_type}. Transferring to {new_key}")
                    
                    # Copy the object
                    copy_source = {'Bucket': BRONZE_BUCKET, 'Key': key}
                    s3.copy_object(CopySource=copy_source, Bucket=SILVER_BUCKET, Key=new_key)
                    transferred_count += 1
                    
                except Exception as e:
                    logging.error(f"Error processing {key}: {e}")
            else:
                # If it already has an extension, we might just want to move it to silver as well
                # depending on exact rules. For now, we will transfer it to a parsed directory
                new_key = f"identified/{key}"
                logging.info(f"Transferring {key} to {new_key}")
                copy_source = {'Bucket': BRONZE_BUCKET, 'Key': key}
                try:
                    s3.copy_object(CopySource=copy_source, Bucket=SILVER_BUCKET, Key=new_key)
                    transferred_count += 1
                except Exception as e:
                    logging.error(f"Error copying {key}: {e}")
                    
            # For safety/demo let's only do a batch
            if transferred_count >= 10:
                logging.info("Batch limit reached for pipeline script execution.")
                return

    logging.info(f"Pipeline complete. Processed {processed_count}, Transferred {transferred_count}")

if __name__ == "__main__":
    if not HAS_MAGIC:
        logging.warning("python-magic is not installed. MIME type identification will be limited.")
    identify_and_transfer()
