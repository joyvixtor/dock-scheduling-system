package resolvers

import "github.com/joyvixtor/dock-scheduling-system/backend/orders/internal/usecase"

type Resolver struct {
	OrderService *usecase.Service
}

func NewResolver(orderService *usecase.Service) *Resolver {
	return &Resolver{OrderService: orderService}
}
