import sqlite3
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

DB_PATH = 'pc_gold.db'

def create_gold_schema():
    logging.info(f"Creating Golden Database Schematics at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    schema = """
    -- DATABASE 1: THE CANONICAL SERVICES CATALOG ("The 72 Hub")
    CREATE TABLE IF NOT EXISTS pc_service_categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_code VARCHAR(10) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        total_services INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pc_services (
        service_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code VARCHAR(20) UNIQUE NOT NULL,
        category_id INTEGER NOT NULL REFERENCES pc_service_categories(category_id),
        service_name VARCHAR(200) NOT NULL,
        division VARCHAR(50),
        sub_category VARCHAR(100),
        pricing_type VARCHAR(20),
        base_price DECIMAL(12, 2),
        pipeline_route VARCHAR(100),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pc_service_pipeline_routes (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_name VARCHAR(100) NOT NULL,
        route_type VARCHAR(30),
        sla_hours INTEGER,
        portal_access VARCHAR(50),
        description TEXT
    );

    -- DATABASE 2: THE GOLDEN RECORD SYSTEM
    CREATE TABLE IF NOT EXISTS pc_users (
        user_id TEXT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        employment_type VARCHAR(10) DEFAULT 'W-2',
        platform_status VARCHAR(50),
        retainer_tier VARCHAR(50),
        retainer_start_date DATE,
        retainer_end_date DATE,
        onboarding_complete BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pc_golden_records (
        record_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES pc_users(user_id) ON DELETE CASCADE,
        source_score INTEGER,
        record_version INTEGER DEFAULT 1,
        verification_status VARCHAR(50),
        verified_at DATETIME,
        is_auction_eligible BOOLEAN DEFAULT 0,
        dob DATE,
        dl_number VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS pc_user_vehicles (
        vehicle_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES pc_users(user_id) ON DELETE CASCADE,
        vin VARCHAR(17) UNIQUE NOT NULL,
        year INTEGER,
        make VARCHAR(50),
        model VARCHAR(100),
        trim VARCHAR(100),
        mileage INTEGER,
        color VARCHAR(50),
        vehicle_condition VARCHAR(50),
        ownership_status VARCHAR(50),
        current_payoff DECIMAL(12, 2),
        current_rate DECIMAL(5, 2),
        remaining_term INTEGER,
        monthly_payment DECIMAL(12, 2),
        title_status VARCHAR(50),
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pc_vehicle_reports (
        report_id TEXT PRIMARY KEY,
        vehicle_id TEXT NOT NULL REFERENCES pc_user_vehicles(vehicle_id) ON DELETE CASCADE,
        report_type VARCHAR(50),
        provider VARCHAR(50),
        report_reference VARCHAR(150),
        accidents_reported INTEGER DEFAULT 0,
        owners_reported INTEGER,
        title_brands TEXT,
        odometer_rollback BOOLEAN DEFAULT 0,
        salvage_history BOOLEAN DEFAULT 0,
        report_clean BOOLEAN,
        pc_fee_charged DECIMAL(12, 2),
        pulled_at DATETIME,
        expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS pc_service_requests (
        request_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES pc_users(user_id),
        service_id INTEGER NOT NULL REFERENCES pc_services(service_id),
        vehicle_id TEXT REFERENCES pc_user_vehicles(vehicle_id),
        request_status VARCHAR(50),
        priority_level VARCHAR(20),
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
    );

    -- DATABASE 4: TRANSACTION ORCHESTRATION & SUBCONTRACTOR LEDGER
    CREATE TABLE IF NOT EXISTS pc_deal_architects (
        da_id TEXT PRIMARY KEY,
        agent_code VARCHAR(20) UNIQUE NOT NULL,
        territory_state VARCHAR(5),
        territory_region VARCHAR(100),
        status VARCHAR(20),
        total_deals_closed INTEGER DEFAULT 0,
        lifetime_volume DECIMAL(15, 2) DEFAULT 0,
        profit_split_pct DECIMAL(5, 2) DEFAULT 90.0,
        onboarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pc_transactions (
        transaction_id TEXT PRIMARY KEY,
        service_request_id TEXT REFERENCES pc_service_requests(request_id),
        user_id TEXT NOT NULL REFERENCES pc_users(user_id),
        da_id TEXT REFERENCES pc_deal_architects(da_id),
        transaction_type VARCHAR(50),
        transaction_status VARCHAR(50),
        gross_amount DECIMAL(12, 2) NOT NULL,
        pc_margin_amount DECIMAL(12, 2),
        net_to_participant DECIMAL(12, 2),
        currency VARCHAR(3) DEFAULT 'USD',
        staged_at DATETIME,
        released_at DATETIME,
        completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS pc_project_ledger (
        ledger_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL REFERENCES pc_transactions(transaction_id) ON DELETE CASCADE,
        service_request_id TEXT REFERENCES pc_service_requests(request_id),
        ledger_status VARCHAR(50),
        total_project_budget DECIMAL(12, 2) NOT NULL,
        amount_staged DECIMAL(12, 2) DEFAULT 0,
        amount_released DECIMAL(12, 2) DEFAULT 0,
        amount_remaining DECIMAL(12, 2),
        subcontractor_visible BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """

    cursor.executescript(schema)
    conn.commit()
    conn.close()
    logging.info("Golden Database Schema created successfully.")

if __name__ == "__main__":
    create_gold_schema()
