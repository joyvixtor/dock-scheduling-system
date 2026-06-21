package domain

import "context"

type OrderStatus string

const (
	OrderStatusPendingBackorder OrderStatus = "PENDING_BACKORDER"
	OrderStatusAllocated        OrderStatus = "ALLOCATED"
	OrderStatusShipped          OrderStatus = "SHIPPED"
)

type Order struct {
	ID       string
	SKU      string
	Quantity int
	Status   OrderStatus
}

func (Order) IsEntity() {}

type Repository interface {
	PendingDemandBySKU(ctx context.Context, sku string) (int, error)
	PendingOrdersBySKU(ctx context.Context, sku string) ([]Order, error)
	FindByID(ctx context.Context, id string) (*Order, error)
}
