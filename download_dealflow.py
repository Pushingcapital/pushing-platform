import boto3
from dotenv import dotenv_values
import os

env = dotenv_values('worker_fresh.env')
s3 = boto3.client(
    's3',
    aws_access_key_id=env['WASABI_ACCESS_KEY'],
    aws_secret_access_key=env['WASABI_SECRET_KEY'],
    endpoint_url=env['WASABI_ENDPOINT']
)

key = "ingest/mdm-2026-02-18-a/PushingCap/Full_User_Evacuation_20260213-145519/Users/emmanuelhaddad/MAC TRANSFER FROM OLD COMPUTER/deal-flow-0b88def4.zip"

print(f"Downloading {key}...")
s3.download_file('corp-data-bronze', key, 'deal-flow.zip')
print("Done.")
