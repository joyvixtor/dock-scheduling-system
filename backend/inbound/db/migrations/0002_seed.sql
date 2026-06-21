INSERT INTO products (sku, name, category) VALUES
('SKU-123', 'Macbook Pro M3', 'Electronics'),
('SKU-456', 'iPhone 15 Pro', 'Electronics'),
('SKU-789', 'Logitech MX Master 3', 'Peripherals');

INSERT INTO inbound_docks (id, dock_number, is_refrigerated, status) VALUES
('d1111111-2222-3333-4444-555555555555', 'DOCK-01', false, 'AVAILABLE'),
('d2222222-3333-4444-5555-666666666666', 'DOCK-02', true, 'OCCUPIED'),
('d3333333-4444-5555-6666-777777777777', 'DOCK-03', false, 'MAINTENANCE');
