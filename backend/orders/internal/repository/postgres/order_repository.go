package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/joyvixtor/dock-scheduling-system/backend/orders/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) PendingDemandBySKU(ctx context.Context, sku string) (int, error) {
	const query = `
		SELECT COALESCE(SUM(quantity), 0)
		FROM orders
		WHERE sku = $1 AND status = 'PENDING_BACKORDER'
	`

	var total int64
	if err := r.pool.QueryRow(ctx, query, sku).Scan(&total); err != nil {
		return 0, fmt.Errorf("query pending demand by sku: %w", err)
	}

	return int(total), nil
}

func (r *Repository) PendingOrdersBySKU(ctx context.Context, sku string) ([]domain.Order, error) {
	const query = `
		SELECT id, sku, quantity, status
		FROM orders
		WHERE sku = $1 AND status = 'PENDING_BACKORDER'
		ORDER BY id
	`

	rows, err := r.pool.Query(ctx, query, sku)
	if err != nil {
		return nil, fmt.Errorf("query pending orders by sku: %w", err)
	}
	defer rows.Close()

	orders := make([]domain.Order, 0)
	for rows.Next() {
		var order domain.Order
		var status string
		if err := rows.Scan(&order.ID, &order.SKU, &order.Quantity, &status); err != nil {
			return nil, fmt.Errorf("scan pending order: %w", err)
		}
		order.Status = domain.OrderStatus(status)
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate pending orders: %w", err)
	}

	return orders, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Order, error) {
	const query = `
		SELECT id, sku, quantity, status
		FROM orders
		WHERE id = $1
	`

	var order domain.Order
	var status string
	if err := r.pool.QueryRow(ctx, query, id).Scan(&order.ID, &order.SKU, &order.Quantity, &status); err != nil {
		return nil, fmt.Errorf("find order by id: %w", err)
	}

	order.Status = domain.OrderStatus(status)
	return &order, nil
}
