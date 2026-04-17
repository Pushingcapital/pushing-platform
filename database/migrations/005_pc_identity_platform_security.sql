-- Migration 005: pc_identity_platform & pc_operator_security_runtime
-- Created: 2026-04-16
-- Purpose: Support Epoch 0 Foundation (pushingSecurity)

-- 🟢 Database: pc_identity_platform (Central Identity)

CREATE TABLE IF NOT EXISTS security_profiles (
    id VARCHAR(64) PRIMARY KEY,
    party_id VARCHAR(64) NOT NULL, -- Link to pc_parties_core.party
    clearance_level INT DEFAULT 0,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_audit_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- active, locked, suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_permissions (
    id SERIAL PRIMARY KEY,
    profile_id VARCHAR(64) REFERENCES security_profiles(id),
    resource_path VARCHAR(255) NOT NULL, -- e.g., 'vault/*', 'control/jobs'
    action VARCHAR(20) NOT NULL, -- READ, WRITE, DELETE, EXECUTE
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔵 Database: pc_operator_security_runtime (Operational State)

CREATE TABLE IF NOT EXISTS secure_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    entry_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, terminated
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(64) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(64),
    success BOOLEAN DEFAULT TRUE,
    payload_json JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secure_sessions_user_id ON secure_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_id ON audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_type ON audit_trail(resource_type);
