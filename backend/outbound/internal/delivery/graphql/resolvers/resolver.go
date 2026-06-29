package resolvers

import "github.com/joyvixtor/dock-scheduling-system/backend/outbound/internal/usecase"

type Resolver struct {
	Service *usecase.Service
}

func NewResolver(service *usecase.Service) *Resolver {
	return &Resolver{Service: service}
}
