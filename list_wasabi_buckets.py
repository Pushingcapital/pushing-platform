import boto3
import os
from dotenv import dotenv_values

env = dotenv_values('worker_fresh.env')

s3 = boto3.client(
    's3',
    aws_access_key_id=env['WASABI_ACCESS_KEY'],
    aws_secret_access_key=env['WASABI_SECRET_KEY'],
    endpoint_url=env['WASABI_ENDPOINT']
)

buckets = s3.list_buckets()
for b in buckets['Buckets']:
    print(b['Name'])
