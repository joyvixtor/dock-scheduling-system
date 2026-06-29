CREATE TABLE IF NOT EXISTS inbound_docks (
  id UUID PRIMARY KEY,
  dock_number TEXT NOT NULL,
  is_refrigerated BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL,
  location_x INT NOT NULL DEFAULT 0,
  location_y INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_docks_status ON inbound_docks (status);