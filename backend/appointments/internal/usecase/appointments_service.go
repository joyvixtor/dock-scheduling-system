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

	if endTime.Before(startTime) || endTime.Equal(startTime) {
		return nil, fmt.Errorf("end time must be strictly after start time")
	}

	overlap, err := s.repo.HasOverlap(ctx, input.DockID, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("could not check for overlapping appointments: %w", err)
	}
	if overlap {
		return nil, fmt.Errorf("este horário já está agendado para a doca selecionada")
	}

	appt := &domain.Appointment{
		ID:            uuid.New().String(),
		DockID:        input.DockID,
		Carrier:       input.Carrier,
		ReferenceCode: input.ReferenceCode,
		StartTime:     startTime,
		EndTime:       endTime,
		SKU:           input.SKU,
		Quantity:      input.Quantity,
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

func (s *service) UpdateAppointmentStatus(ctx context.Context, id string, status domain.AppointmentStatus) (*domain.Appointment, error) {
	err := s.repo.UpdateStatus(ctx, id, status)
	if err != nil {
		return nil, err
	}
	return s.repo.FindByID(ctx, id)
}
