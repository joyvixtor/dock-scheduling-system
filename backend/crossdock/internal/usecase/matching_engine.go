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
	repo            Repository
	orderServices   domain.OrderServiceClient
	inboundServices domain.InboundServiceClient
	outboundServices domain.OutboundServiceClient
}

func NewMatchingEngine(repo Repository, orderServices domain.OrderServiceClient, inboundServices domain.InboundServiceClient, outboundServices domain.OutboundServiceClient) *MatchingEngine {
	return &MatchingEngine{repo: repo, orderServices: orderServices, inboundServices: inboundServices, outboundServices: outboundServices}
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

	// Buscamos as coordenadas da doca de entrada
	inboundCoords, err := m.inboundServices.FindInboundDockCoordinates(ctx, inboundDockID)
	if err != nil {
		return nil, fmt.Errorf("failed to get inbound dock coordinates: %w", err)
	}

	// Buscamos a doca de saída mais próxima e vazia
	outboundDock, err := m.outboundServices.ClosestEmptyOutboundDock(ctx, inboundCoords.LocationX, inboundCoords.LocationY)
	if err != nil {
		return nil, fmt.Errorf("failed to find closest outbound dock: %w", err)
	}

	task := &domain.TransferTask{
		ID:             uuid.NewString(),
		SKU:            sku,
		Quantity:       matchedQuantity,
		InboundDockID:  inboundDockID,
		OutboundDockID: outboundDock.DockNumber,
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
