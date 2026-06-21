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

type Repository interface {
	CreateTransferTask(ctx context.Context, task *TransferTask) (*TransferTask, error)
	ActiveTransferTasks(ctx context.Context) ([]TransferTask, error)
	UpdateTaskStatus(ctx context.Context, id string, status TaskStatus, operatorID *string) (*TransferTask, error)
}
