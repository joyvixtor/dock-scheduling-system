CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_sku_status ON orders (sku, status);