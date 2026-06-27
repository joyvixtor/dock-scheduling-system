package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/joyvixtor/dock-scheduling-system/backend/crossdock/internal/domain"
)

type Repository interface {
	CreateTransferTask(ctx context.Context, task *domain.TransferTask) (*domain.TransferTask, error)
	ActiveTransferTasks(ctx context.Context) ([]domain.TransferTask, error)
	UpdateTaskStatus(ctx context.Context, id string, status domain.TaskStatus, operatorID *string) (*domain.TransferTask, error)
	FindTransferTaskByID(ctx context.Context, id string) (*domain.TransferTask, error)
}

type MatchingEngine struct {
	repo          Repository
	orderServices domain.OrderServiceClient
}

func NewMatchingEngine(repo Repository, orderServices domain.OrderServiceClient) *MatchingEngine {
	return &MatchingEngine{repo: repo, orderServices: orderServices}
}

func (m *MatchingEngine) ScanInboundPallet(ctx context.Context, sku string, quantity int, inboundDockID string) (*domain.TransferTask, error) {
	if sku == "" || quantity <= 0 || inboundDockID == "" {
		return nil, fmt.Errorf("invalid scan inbound pallet input")
	}

	backorders, err := m.orderServices.PendingDemandBySKU(ctx, sku)
	if err != nil {
		return nil, err
	}

	matchedQuantity := matchQuantity(quantity, backorders)
	if matchedQuantity <= 0 {
		return nil, fmt.Errorf("no pending demand for sku %s", sku)
	}

	task := &domain.TransferTask{
		ID:             uuid.NewString(),
		SKU:            sku,
		Quantity:       matchedQuantity,
		InboundDockID:  inboundDockID,
		// Temporário: Roteia para uma doca fixa até criarmos o microsserviço de Outbound Docks
		OutboundDockID: "OUT-01",
		Status:         domain.TaskStatusCreated,
		CreatedAt:      time.Now().UTC(),
	}

	return m.repo.CreateTransferTask(ctx, task)
}

func (m *MatchingEngine) AssignOperator(ctx context.Context, taskID, operatorID string) (*domain.TransferTask, error) {
	if taskID == "" || operatorID == "" {
		return nil, fmt.Errorf("task id and operator id are required")
	}

	return m.repo.UpdateTaskStatus(ctx, taskID, domain.TaskStatusTransit, &operatorID)
}

func (m *MatchingEngine) CompleteTransfer(ctx context.Context, taskID string) (*domain.TransferTask, error) {
	if taskID == "" {
		return nil, fmt.Errorf("task id is required")
	}

	return m.repo.UpdateTaskStatus(ctx, taskID, domain.TaskStatusCompleted, nil)
}

func (m *MatchingEngine) ActiveTransferTasks(ctx context.Context) ([]domain.TransferTask, error) {
	return m.repo.ActiveTransferTasks(ctx)
}

func (m *MatchingEngine) ActiveTransferTasksBySKU(ctx context.Context, sku string) ([]domain.TransferTask, error) {
	if sku == "" {
		return nil, fmt.Errorf("sku is required")
	}

	backorders, err := m.orderServices.PendingDemandBySKU(ctx, sku)
	if err != nil {
		return nil, err
	}

	if backorders <= 0 {
		return []domain.TransferTask{}, nil
	}

	tasks, err := m.repo.ActiveTransferTasks(ctx)
	if err != nil {
		return nil, err
	}

	filtered := make([]domain.TransferTask, 0)
	remainingDemand := backorders
	for i := range tasks {
		task := tasks[i]
		if task.SKU != sku || remainingDemand <= 0 {
			continue
		}

		matchedQuantity := matchQuantity(task.Quantity, remainingDemand)
		task.Quantity = matchedQuantity
		filtered = append(filtered, task)
		remainingDemand -= matchedQuantity
	}

	return filtered, nil
}

func (m *MatchingEngine) FindTransferTaskByID(ctx context.Context, taskID string) (*domain.TransferTask, error) {
	if taskID == "" {
		return nil, fmt.Errorf("task id is required")
	}

	return m.repo.FindTransferTaskByID(ctx, taskID)
}

func matchQuantity(receivedQuantity, backorders int) int {
	if receivedQuantity < backorders {
		return receivedQuantity
	}

	return backorders
}
