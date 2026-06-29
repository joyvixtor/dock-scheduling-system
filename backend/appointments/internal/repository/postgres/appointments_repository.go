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
		INSERT INTO appointments (id, dock_id, carrier, reference_code, start_time, end_time, pallets_count, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(ctx, query,
		appt.ID,
		appt.DockID,
		appt.Carrier,
		appt.ReferenceCode,
		appt.StartTime,
		appt.EndTime,
		appt.PalletsCount,
		appt.Status,
	)
	if err != nil {
		return fmt.Errorf("insert appointment: %w", err)
	}
	return nil
}

func (r *repository) FindByDate(ctx context.Context, startOfDay, endOfDay time.Time) ([]*domain.Appointment, error) {
	query := `
		SELECT id, dock_id, carrier, reference_code, start_time, end_time, pallets_count, status
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
			&a.PalletsCount,
			&a.Status,
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
