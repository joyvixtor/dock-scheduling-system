package domain

import "context"

type DockStatus string

const (
	DockStatusAvailable   DockStatus = "AVAILABLE"
	DockStatusOccupied    DockStatus = "OCCUPIED"
	DockStatusMaintenance DockStatus = "MAINTENANCE"
)

type InboundDock struct {
	ID             string
	DockNumber     string
	IsRefrigerated bool
	Status         DockStatus
	LocationX      int
	LocationY      int
}

func (InboundDock) IsEntity() {}

type Product struct {
	SKU      string
	Name     string
	Category string
}

func (Product) IsEntity() {}

type Repository interface {
	ActiveInboundDocks(ctx context.Context) ([]InboundDock, error)
	ProductBySKU(ctx context.Context, sku string) (*Product, error)
	FindInboundDockByID(ctx context.Context, id string) (*InboundDock, error)
}
