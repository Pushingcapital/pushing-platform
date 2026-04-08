import os

print("""
======================================================
  STEP 3: DEPLOYING THE SQL CONNECTOR CLOUD FUNCTION
======================================================
This script creates the Cloud Function code required 
to give your COO Agent live-query access to the 5 
Golden Databases.
""")

os.makedirs("pc_sql_connector", exist_ok=True)

with open("pc_sql_connector/requirements.txt", "w") as f:
    f.write("functions-framework==3.4.0\npsycopg2-binary==2.9.9\ngoogle-cloud-secret-manager==2.16.2\n")

with open("pc_sql_connector/main.py", "w") as f:
    f.write("""import json
import os
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

import functions_framework
import psycopg2
from google.cloud import secretmanager

# Configuration
PROJECT_ID = "brain-481809"
ROLE_SECRET_ID = os.getenv("DB_ROLE_SECRET_ID", "pc-gold-role-creds")
DB_NAME = os.getenv("DB_NAME", "pc_gold")
DB_USER = os.getenv("DB_USER", "pc_coo_reader")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
API_KEY_HEADER = os.getenv("CONNECTOR_API_KEY_HEADER", "x-api-key")
INSTANCE_CONNECTION_NAME = os.getenv("INSTANCE_CONNECTION_NAME")
WRITE_ORIGIN_HEADER = os.getenv("CONNECTOR_WRITE_ORIGIN_HEADER", "x-pc-origin")
ALLOWED_WRITE_ORIGINS = {
    value.strip()
    for value in os.getenv("CONNECTOR_WRITE_ALLOWED_ORIGINS", "pushing-capital-integration-hub").split(",")
    if value.strip()
}
QUOTE_TO_CASH_ACTION = "quote_to_cash_payment_clear"
PORTAL_USER_UPSERT_ACTION = "portal_user_upsert"


def json_default(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, UUID):
        return str(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def json_response(payload, status=200, extra_headers=None):
    headers = {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"}
    if extra_headers:
        headers.update(extra_headers)
    return (json.dumps(payload, default=json_default), status, headers)


def require_api_key(request):
    expected_api_key = (os.getenv("CONNECTOR_API_KEY") or "").strip()
    if not expected_api_key:
        return None

    supplied_api_key = (request.headers.get(API_KEY_HEADER) or "").strip()
    if supplied_api_key == expected_api_key:
        return None

    return json_response({"error": "Unauthorized"}, 401)


def require_write_origin(request):
    write_origin = (request.headers.get(WRITE_ORIGIN_HEADER) or "").strip()
    if write_origin in ALLOWED_WRITE_ORIGINS:
        return write_origin, None

    return None, json_response({"error": "Unauthorized write origin"}, 401)


def get_db_connection():
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{PROJECT_ID}/secrets/{ROLE_SECRET_ID}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    role_passwords = json.loads(response.payload.data.decode("UTF-8"))
    password = role_passwords.get(DB_USER)
    if not password:
        raise RuntimeError(f"Missing password for database role '{DB_USER}' in secret '{ROLE_SECRET_ID}'")

    connect_kwargs = {
        "database": DB_NAME,
        "user": DB_USER,
        "password": password,
        "port": DB_PORT,
    }
    if INSTANCE_CONNECTION_NAME:
        connect_kwargs["connect_timeout"] = 10
        connect_kwargs["host"] = f"/cloudsql/{INSTANCE_CONNECTION_NAME}"
        return psycopg2.connect(**connect_kwargs)

    raise RuntimeError("INSTANCE_CONNECTION_NAME must be set for Cloud SQL socket access.")


def extract_transaction_id(request_json, parameters):
    transaction_id = request_json.get("transaction_id") if request_json else None
    if isinstance(transaction_id, str) and transaction_id.strip():
        return transaction_id.strip()

    if parameters and isinstance(parameters[0], str) and parameters[0].strip():
        return parameters[0].strip()

    return None


def normalize_optional_text(value):
    if isinstance(value, str):
        trimmed = value.strip()
        return trimmed or None
    return None


def normalize_email(value):
    normalized = normalize_optional_text(value)
    return normalized.lower() if normalized else None


def split_display_name(display_name):
    normalized = normalize_optional_text(display_name)
    if not normalized:
        return None, None

    parts = normalized.split()
    if len(parts) == 1:
        return parts[0], None

    return parts[0], " ".join(parts[1:])


def execute_quote_to_cash(conn, transaction_id, clear_status, request_json):
    cur = conn.cursor()
    try:
        cur.execute(
            \"\"\"
            SELECT transaction_id, transaction_status
              FROM public.pc_transactions
             WHERE transaction_id = %s
             FOR UPDATE
            \"\"\",
            (transaction_id,),
        )
        row = cur.fetchone()
        if not row:
            conn.rollback()
            return json_response({\"error\": f\"pc_transactions row not found for transaction_id {transaction_id}\"}, 404)

        prior_status = row[1]

        cur.execute(
            \"\"\"
            UPDATE public.pc_transactions
               SET transaction_status = %s,
                   completed_at = COALESCE(completed_at, NOW())
             WHERE transaction_id = %s
               AND transaction_status IS DISTINCT FROM %s
            \"\"\",
            (clear_status, transaction_id, clear_status),
        )
        transaction_rows_updated = cur.rowcount

        cur.execute(
            \"\"\"
            UPDATE public.pc_subcontractor_jobs
               SET job_status = 'pending'
             WHERE transaction_id = %s
               AND job_status IN ('awaiting_funds', 'staged')
            \"\"\",
            (transaction_id,),
        )
        jobs_rows_updated = cur.rowcount

        conn.commit()
        return json_response(
            {
                \"success\": True,
                \"action\": QUOTE_TO_CASH_ACTION,
                \"transaction_id\": transaction_id,
                \"provider\": request_json.get(\"context\", {}).get(\"provider\") if request_json else None,
                \"event_id\": request_json.get(\"context\", {}).get(\"event_id\") if request_json else None,
                \"event_type\": request_json.get(\"context\", {}).get(\"event_type\") if request_json else None,
                \"prior_status\": prior_status,
                \"transaction_status\": clear_status,
                \"transaction_rows_updated\": transaction_rows_updated,
                \"jobs_rows_updated\": jobs_rows_updated,
            }
        )
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()


def execute_portal_user_upsert(conn, request_json):
    email = normalize_email(request_json.get("email") if request_json else None)
    if not email:
        return json_response({"error": "email is required for portal_user_upsert"}, 400)

    first_name = normalize_optional_text(request_json.get("first_name") if request_json else None)
    last_name = normalize_optional_text(request_json.get("last_name") if request_json else None)
    if not first_name and not last_name:
        first_name, last_name = split_display_name(request_json.get("name") if request_json else None)

    cur = conn.cursor()
    try:
        cur.execute(
            \"\"\"
            INSERT INTO public.pc_users (
                user_id,
                email,
                first_name,
                last_name,
                created_at,
                updated_at
            )
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE
            SET first_name = COALESCE(EXCLUDED.first_name, public.pc_users.first_name),
                last_name = COALESCE(EXCLUDED.last_name, public.pc_users.last_name),
                updated_at = NOW()
            RETURNING
                user_id,
                email,
                first_name,
                last_name,
                employment_type,
                platform_status,
                onboarding_complete,
                created_at,
                updated_at
            \"\"\",
            (str(uuid4()), email, first_name, last_name),
        )
        row = cur.fetchone()
        if not row:
            conn.rollback()
            return json_response({\"error\": \"Failed to upsert portal user\"}, 500)

        conn.commit()
        return json_response(
            {
                \"success\": True,
                \"action\": PORTAL_USER_UPSERT_ACTION,
                \"user\": {
                    \"user_id\": row[0],
                    \"email\": row[1],
                    \"first_name\": row[2],
                    \"last_name\": row[3],
                    \"employment_type\": row[4],
                    \"platform_status\": row[5],
                    \"onboarding_complete\": row[6],
                    \"created_at\": row[7],
                    \"updated_at\": row[8],
                },
            }
        )
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()


@functions_framework.http
def execute_query(request):
    # Enable CORS for Vertex AI
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': f'Content-Type,{API_KEY_HEADER},{WRITE_ORIGIN_HEADER}',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    auth_error = require_api_key(request)
    if auth_error:
        return auth_error

    request_json = request.get_json(silent=True)
    sql_query = None
    parameters = []
    if request_json:
        sql_query = request_json.get('query') or request_json.get('sql')
        parameters = request_json.get('parameters') or []

    action = request_json.get("action") if request_json else None
    if action in {QUOTE_TO_CASH_ACTION, PORTAL_USER_UPSERT_ACTION}:
        _, origin_error = require_write_origin(request)
        if origin_error:
            return origin_error

        conn = None
        try:
            conn = get_db_connection()

            if action == QUOTE_TO_CASH_ACTION:
                transaction_id = extract_transaction_id(request_json, parameters)
                if not transaction_id:
                    return json_response({\"error\": \"transaction_id is required for quote_to_cash_payment_clear\"}, 400)

                clear_status = request_json.get(\"clear_status\") if request_json else None
                if not isinstance(clear_status, str) or not clear_status.strip():
                    clear_status = \"Cleared\"

                return execute_quote_to_cash(conn, transaction_id, clear_status.strip(), request_json)

            return execute_portal_user_upsert(conn, request_json)
        except Exception as e:
            return json_response({\"error\": str(e)}, 500)
        finally:
            try:
                if conn is not None:
                    conn.close()
            except Exception:
                pass

    if not sql_query:
        return json_response({"error": "No SQL query provided"}, 400)

    # Security Guardrail: Read-only access
    if not sql_query.strip().upper().startswith("SELECT"):
        return json_response({"error": "Only SELECT queries are authorized."}, 403)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(sql_query, parameters)

        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in cur.fetchall()]

        cur.close()
        conn.close()

        return json_response({"data": results})
    except Exception as e:
        return json_response({"error": str(e)}, 500)
""")

print("Successfully created 'pc_sql_connector' directory with main.py and requirements.txt.")
print("To deploy this function, run the following in your terminal:")
print("  cd pc_sql_connector")
print("  gcloud functions deploy pc-sql-connector --gen2 --runtime python311 --trigger-http --entry-point execute_query --region us-central1 --project brain-481809")
print("  gcloud run services update pc-sql-connector --region us-central1 --project brain-481809 --set-cloudsql-instances=brain-481809:us-central1:pc-gold")
