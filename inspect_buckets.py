import boto3
from dotenv import dotenv_values

env = dotenv_values('worker_fresh.env')

s3 = boto3.client(
    's3',
    aws_access_key_id=env['WASABI_ACCESS_KEY'],
    aws_secret_access_key=env['WASABI_SECRET_KEY'],
    endpoint_url=env['WASABI_ENDPOINT']
)

def list_bucket_contents(bucket_name):
    print(f"--- Contents of {bucket_name} ---")
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket_name)
    count = 0
    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                print(f"{obj['Key']} ({obj['Size']} bytes)")
                count += 1
                if count >= 20:
                    print("... (showing first 20)")
                    return
    print(f"Total objects: {count}")

list_bucket_contents('corp-data-bronze')
list_bucket_contents('corp-data-silver')
