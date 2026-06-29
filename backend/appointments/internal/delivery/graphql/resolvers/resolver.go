package resolvers

import (
	"github.com/joyvixtor/dock-scheduling-system/backend/appointments/internal/domain"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	Service domain.AppointmentsService
}

func NewResolver(service domain.AppointmentsService) *Resolver {
	return &Resolver{
		Service: service,
	}
}
