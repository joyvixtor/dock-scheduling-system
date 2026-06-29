package domain

import "context"

type DockStatus string

const (
	DockStatusAvailable   DockStatus = "AVAILABLE"
	DockStatusOccupied    DockStatus = "OCCUPIED"
	DockStatusMaintenance DockStatus = "MAINTENANCE"
)

type OutboundDock struct {
	ID             string
	DockNumber     string
	IsRefrigerated bool
	Status         DockStatus
	LocationX      int
	LocationY      int
}

func (OutboundDock) IsEntity() {}



type Repository interface {
	ActiveOutboundDocks(ctx context.Context) ([]OutboundDock, error)
	FindOutboundDockByID(ctx context.Context, id string) (*OutboundDock, error)
}
