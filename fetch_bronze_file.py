import boto3
import sys
from dotenv import dotenv_values

env = dotenv_values('worker_fresh.env')
s3 = boto3.client(
    's3',
    aws_access_key_id=env['WASABI_ACCESS_KEY'],
    aws_secret_access_key=env['WASABI_SECRET_KEY'],
    endpoint_url=env['WASABI_ENDPOINT']
)

def fetch_file(key):
    try:
        obj = s3.get_object(Bucket='corp-data-bronze', Key=key)
        return obj['Body'].read().decode('utf-8')
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(fetch_file(sys.argv[1]))
