package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/joyvixtor/dock-scheduling-system/backend/appointments/internal/domain"
)

type service struct {
	repo domain.AppointmentsRepository
}

func NewService(repo domain.AppointmentsRepository) domain.AppointmentsService {
	return &service{repo: repo}
}

func (s *service) CreateAppointment(ctx context.Context, input domain.CreateAppointmentInput) (*domain.Appointment, error) {
	startTime, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		return nil, fmt.Errorf("invalid start time: %w", err)
	}
	endTime, err := time.Parse(time.RFC3339, input.EndTime)
	if err != nil {
		return nil, fmt.Errorf("invalid end time: %w", err)
	}

	if endTime.Before(startTime) {
		return nil, fmt.Errorf("end time must be after start time")
	}

	appt := &domain.Appointment{
		ID:            uuid.New().String(),
		DockID:        input.DockID,
		Carrier:       input.Carrier,
		ReferenceCode: input.ReferenceCode,
		StartTime:     startTime,
		EndTime:       endTime,
		PalletsCount:  input.PalletsCount,
		Status:        domain.AppointmentStatusScheduled,
	}

	if err := s.repo.Create(ctx, appt); err != nil {
		return nil, err
	}

	return appt, nil
}

func (s *service) GetAppointmentsByDate(ctx context.Context, dateStr string) ([]*domain.Appointment, error) {
	// DateStr is expected to be "YYYY-MM-DD"
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, expected YYYY-MM-DD: %w", err)
	}
	
	startOfDay := t
	endOfDay := t.Add(24 * time.Hour)

	return s.repo.FindByDate(ctx, startOfDay, endOfDay)
}
