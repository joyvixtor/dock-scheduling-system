package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joyvixtor/dock-scheduling-system/backend/appointments/internal/domain"
)

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) domain.AppointmentsRepository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, appt *domain.Appointment) error {
	query := `
		INSERT INTO appointments (id, dock_id, carrier, reference_code, start_time, end_time, sku, quantity, pallets_count, status, order_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.Exec(ctx, query,
		appt.ID,
		appt.DockID,
		appt.Carrier,
		appt.ReferenceCode,
		appt.StartTime,
		appt.EndTime,
		appt.SKU,
		appt.Quantity,
		appt.PalletsCount,
		appt.Status,
		appt.OrderID,
	)
	if err != nil {
		return fmt.Errorf("insert appointment: %w", err)
	}
	return nil
}

func (r *repository) HasOverlap(ctx context.Context, dockID string, start, end time.Time) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM appointments
			WHERE dock_id = $1
			AND status != 'CANCELLED'
			AND start_time < $3 
			AND end_time > $2
		)
	`
	var exists bool
	err := r.db.QueryRow(ctx, query, dockID, start, end).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check overlap: %w", err)
	}
	return exists, nil
}

func (r *repository) FindByID(ctx context.Context, id string) (*domain.Appointment, error) {
	query := `
		SELECT id, dock_id, carrier, reference_code, start_time, end_time, sku, quantity, pallets_count, status, order_id
		FROM appointments
		WHERE id = $1
	`
	a := &domain.Appointment{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&a.ID,
		&a.DockID,
		&a.Carrier,
		&a.ReferenceCode,
		&a.StartTime,
		&a.EndTime,
		&a.SKU,
		&a.Quantity,
		&a.PalletsCount,
		&a.Status,
		&a.OrderID,
	)
	if err != nil {
		return nil, fmt.Errorf("find appt by id: %w", err)
	}
	return a, nil
}

func (r *repository) UpdateStatus(ctx context.Context, id string, status domain.AppointmentStatus) error {
	query := `UPDATE appointments SET status = $1 WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("update appt status: %w", err)
	}
	return nil
}

func (r *repository) FindByDate(ctx context.Context, startOfDay, endOfDay time.Time) ([]*domain.Appointment, error) {
	query := `
		SELECT id, dock_id, carrier, reference_code, start_time, end_time, sku, quantity, pallets_count, status, order_id
		FROM appointments
		WHERE start_time >= $1 AND start_time < $2
		ORDER BY start_time ASC
	`
	rows, err := r.db.Query(ctx, query, startOfDay, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("query appointments: %w", err)
	}
	defer rows.Close()

	var appointments []*domain.Appointment
	for rows.Next() {
		var a domain.Appointment
		if err := rows.Scan(
			&a.ID,
			&a.DockID,
			&a.Carrier,
			&a.ReferenceCode,
			&a.StartTime,
			&a.EndTime,
			&a.SKU,
			&a.Quantity,
			&a.PalletsCount,
			&a.Status,
			&a.OrderID,
		); err != nil {
			return nil, fmt.Errorf("scan appointment: %w", err)
		}
		appointments = append(appointments, &a)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration: %w", err)
	}

	return appointments, nil
}
