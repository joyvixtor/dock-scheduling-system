CREATE TABLE IF NOT EXISTS outbound_docks (
  id UUID PRIMARY KEY,
  dock_number TEXT NOT NULL,
  is_refrigerated BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL,
  location_x INT NOT NULL DEFAULT 0,
  location_y INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE INDEX IF NOT EXISTS idx_outbound_docks_status ON outbound_docks (status);