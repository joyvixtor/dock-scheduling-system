package domain

import (
	"context"
	"time"
)

type TaskStatus string

const (
	TaskStatusCreated   TaskStatus = "CREATED"
	TaskStatusTransit   TaskStatus = "TRANSIT"
	TaskStatusCompleted TaskStatus = "COMPLETED"
)

type TransferTask struct {
	ID             string
	SKU            string
	Quantity       int
	InboundDockID  string
	OutboundDockID string
	Status         TaskStatus
	OperatorID     *string
	CreatedAt      time.Time
}

func (TransferTask) IsEntity() {}

type OrderServiceClient interface {
	PendingDemandBySKU(ctx context.Context, sku string) (int, error)
}

type InboundDockCoordinates struct {
	LocationX int
	LocationY int
}

type InboundServiceClient interface {
	FindInboundDockCoordinates(ctx context.Context, dockID string) (*InboundDockCoordinates, error)
}

type OutboundDockReference struct {
	ID         string
	DockNumber string
}

type OutboundServiceClient interface {
	ClosestEmptyOutboundDock(ctx context.Context, locationX, locationY int) (*OutboundDockReference, error)
}

type Repository interface {
	CreateTransferTask(ctx context.Context, task *TransferTask) (*TransferTask, error)
	ActiveTransferTasks(ctx context.Context) ([]TransferTask, error)
	UpdateTaskStatus(ctx context.Context, id string, status TaskStatus, operatorID *string) (*TransferTask, error)
}
