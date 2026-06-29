package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/joyvixtor/dock-scheduling-system/backend/outbound/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ActiveOutboundDocks(ctx context.Context) ([]domain.OutboundDock, error) {
	const query = `
		SELECT id, dock_number, is_refrigerated, status, location_x, location_y
		FROM outbound_docks
		ORDER BY dock_number
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query active outbound docks: %w", err)
	}
	defer rows.Close()

	docks := make([]domain.OutboundDock, 0)
	for rows.Next() {
		var dock domain.OutboundDock
		var status string
		if err := rows.Scan(&dock.ID, &dock.DockNumber, &dock.IsRefrigerated, &status, &dock.LocationX, &dock.LocationY); err != nil {
			return nil, fmt.Errorf("scan outbound dock: %w", err)
		}
		dock.Status = domain.DockStatus(status)
		docks = append(docks, dock)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate outbound docks: %w", err)
	}

	return docks, nil
}



func (r *Repository) FindOutboundDockByID(ctx context.Context, id string) (*domain.OutboundDock, error) {
	const query = `
		SELECT id, dock_number, is_refrigerated, status, location_x, location_y
		FROM outbound_docks
		WHERE id = $1
	`

	var dock domain.OutboundDock
	var status string
	if err := r.pool.QueryRow(ctx, query, id).Scan(&dock.ID, &dock.DockNumber, &dock.IsRefrigerated, &status, &dock.LocationX, &dock.LocationY); err != nil {
		return nil, fmt.Errorf("find outbound dock by id: %w", err)
	}

	dock.Status = domain.DockStatus(status)
	return &dock, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status domain.DockStatus) error {
	const query = `
		UPDATE outbound_docks
		SET status = $1
		WHERE id = $2
	`

	res, err := r.pool.Exec(ctx, query, string(status), id)
	if err != nil {
		return fmt.Errorf("update outbound dock status: %w", err)
	}

	if res.RowsAffected() == 0 {
		return fmt.Errorf("outbound dock not found")
	}

	return nil
}
