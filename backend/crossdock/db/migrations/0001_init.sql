CREATE TABLE IF NOT EXISTS transfer_tasks (
  id UUID PRIMARY KEY,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  inbound_dock_id TEXT NOT NULL,
  outbound_dock_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  operator_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfer_tasks_status_created_at ON transfer_tasks (status, created_at DESC);