-- Habilita a extensão necessária para restrições de sobreposição (GIST)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE docks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    identifier VARCHAR(50) NOT NULL,
    is_refrigerated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_facility_dock UNIQUE (facility_id, identifier)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dock_id UUID NOT NULL REFERENCES docks(id) ON DELETE CASCADE,
    carrier_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint que impede agendamentos simultâneos na mesma doca (Double-booking) [1]
    CONSTRAINT prevent_dock_time_overlap EXCLUDE USING GIST (
        dock_id WITH =,
        tsrange(start_time, end_time) WITH &&
    )
);

-- Tabela Ledger de Auditoria (Append-only) [1]
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    operator_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);