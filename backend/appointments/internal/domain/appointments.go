package domain

import (
	"context"
	"time"
)

type AppointmentStatus string

const (
	AppointmentStatusScheduled AppointmentStatus = "SCHEDULED"
	AppointmentStatusArrived   AppointmentStatus = "ARRIVED"
	AppointmentStatusCompleted AppointmentStatus = "COMPLETED"
	AppointmentStatusCancelled AppointmentStatus = "CANCELLED"
)

type Appointment struct {
	ID            string            `json:"id"`
	DockID        string            `json:"dockId"`
	Carrier       string            `json:"carrier"`
	ReferenceCode string            `json:"referenceCode"`
	StartTime     time.Time         `json:"startTime"`
	EndTime       time.Time         `json:"endTime"`
	SKU           string            `json:"sku"`
	Quantity      int               `json:"quantity"`
	PalletsCount  int               `json:"palletsCount"`
	Status        AppointmentStatus `json:"status"`
}

func (Appointment) IsEntity() {}

type CreateAppointmentInput struct {
	DockID        string `json:"dockId"`
	Carrier       string `json:"carrier"`
	ReferenceCode string `json:"referenceCode"`
	StartTime     string `json:"startTime"`
	EndTime       string `json:"endTime"`
	SKU           string `json:"sku"`
	Quantity      int    `json:"quantity"`
	PalletsCount  int    `json:"palletsCount"`
}

type AppointmentsRepository interface {
	Create(ctx context.Context, appt *Appointment) error
	FindByDate(ctx context.Context, startOfDay, endOfDay time.Time) ([]*Appointment, error)
	HasOverlap(ctx context.Context, dockID string, start, end time.Time) (bool, error)
	UpdateStatus(ctx context.Context, id string, status AppointmentStatus) error
	FindByID(ctx context.Context, id string) (*Appointment, error)
}

type AppointmentsService interface {
	CreateAppointment(ctx context.Context, input CreateAppointmentInput) (*Appointment, error)
	GetAppointmentsByDate(ctx context.Context, dateStr string) ([]*Appointment, error)
	UpdateAppointmentStatus(ctx context.Context, id string, status AppointmentStatus) (*Appointment, error)
}
