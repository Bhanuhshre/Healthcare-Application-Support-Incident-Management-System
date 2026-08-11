-- Healthcare Application Support & Incident Management System
-- PostgreSQL schema. This mirrors what the SQLAlchemy models create
-- automatically, and is provided so the database can also be provisioned
-- directly with psql, or reviewed by a DBA without reading Python code.

CREATE TYPE user_role AS ENUM ('admin', 'support_agent', 'viewer');
CREATE TYPE application_status AS ENUM ('operational', 'degraded', 'down', 'maintenance');
CREATE TYPE application_environment AS ENUM ('production', 'staging', 'test');
CREATE TYPE incident_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE incident_status AS ENUM ('open', 'in_progress', 'on_hold', 'resolved', 'closed');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    owner_team VARCHAR(150) NOT NULL,
    environment application_environment NOT NULL DEFAULT 'production',
    status application_status NOT NULL DEFAULT 'operational',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_name ON applications (name);

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    severity incident_severity NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'open',
    reported_by_id INTEGER NOT NULL REFERENCES users (id),
    assigned_to_id INTEGER REFERENCES users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_application ON incidents (application_id);
CREATE INDEX idx_incidents_status ON incidents (status);
CREATE INDEX idx_incidents_severity ON incidents (severity);
CREATE INDEX idx_incidents_assigned_to ON incidents (assigned_to_id);

CREATE TABLE incident_comments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents (id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users (id),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_incident ON incident_comments (incident_id);

-- Keeps updated_at current whenever an incident row changes.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Seed a default administrator account so the system is usable immediately
-- after provisioning. Password is "ChangeMe123" hashed with bcrypt.
-- Change this password on first login in any real deployment.
INSERT INTO users (full_name, username, email, hashed_password, role)
VALUES (
    'System Administrator',
    'admin',
    'admin@example.com',
    '$2b$12$6Lg3Bz/L8i5o./9KSeBn5efFjAx6n2WRn4rbcycDTF2xsqyeTdriW',
    'admin'
);
