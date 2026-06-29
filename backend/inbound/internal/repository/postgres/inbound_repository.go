package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/joyvixtor/dock-scheduling-system/backend/inbound/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ActiveInboundDocks(ctx context.Context) ([]domain.InboundDock, error) {
	const query = `
		SELECT id, dock_number, is_refrigerated, status, location_x, location_y
		FROM inbound_docks
		ORDER BY dock_number
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query active inbound docks: %w", err)
	}
	defer rows.Close()

	docks := make([]domain.InboundDock, 0)
	for rows.Next() {
		var dock domain.InboundDock
		var status string
		if err := rows.Scan(&dock.ID, &dock.DockNumber, &dock.IsRefrigerated, &status, &dock.LocationX, &dock.LocationY); err != nil {
			return nil, fmt.Errorf("scan inbound dock: %w", err)
		}
		dock.Status = domain.DockStatus(status)
		docks = append(docks, dock)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate inbound docks: %w", err)
	}

	return docks, nil
}

func (r *Repository) ProductBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	const query = `
		SELECT sku, name, category
		FROM products
		WHERE sku = $1
	`

	var product domain.Product
	if err := r.pool.QueryRow(ctx, query, sku).Scan(&product.SKU, &product.Name, &product.Category); err != nil {
		return nil, fmt.Errorf("find product by sku: %w", err)
	}

	return &product, nil
}

func (r *Repository) FindInboundDockByID(ctx context.Context, id string) (*domain.InboundDock, error) {
	const query = `
		SELECT id, dock_number, is_refrigerated, status, location_x, location_y
		FROM inbound_docks
		WHERE id = $1
	`

	var dock domain.InboundDock
	var status string
	if err := r.pool.QueryRow(ctx, query, id).Scan(&dock.ID, &dock.DockNumber, &dock.IsRefrigerated, &status, &dock.LocationX, &dock.LocationY); err != nil {
		return nil, fmt.Errorf("find inbound dock by id: %w", err)
	}

	dock.Status = domain.DockStatus(status)
	return &dock, nil
}
