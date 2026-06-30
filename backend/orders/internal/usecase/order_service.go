package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/joyvixtor/dock-scheduling-system/backend/orders/internal/domain"
)

type OrderRepository interface {
	PendingDemandBySKU(ctx context.Context, sku string) (int, error)
	PendingOrdersBySKU(ctx context.Context, sku string) ([]domain.Order, error)
	AllPendingOrders(ctx context.Context) ([]domain.Order, error)
	FindByID(ctx context.Context, id string) (*domain.Order, error)
	CreateOrder(ctx context.Context, order *domain.Order) error
}

type Service struct {
	repo OrderRepository
}

func NewService(repo OrderRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) PendingDemandBySKU(ctx context.Context, sku string) (int, error) {
	if sku == "" {
		return 0, fmt.Errorf("sku is required")
	}

	return s.repo.PendingDemandBySKU(ctx, sku)
}

func (s *Service) CreateOrder(ctx context.Context, sku string, quantity int) (*domain.Order, error) {
	if sku == "" || quantity <= 0 {
		return nil, fmt.Errorf("invalid sku or quantity")
	}

	order := &domain.Order{
		ID:       uuid.NewString(), // Generates a valid UUID for PostgreSQL
		SKU:      sku,
		Quantity: quantity,
		Status:   domain.OrderStatusPendingBackorder,
	}

	if err := s.repo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

func (s *Service) PendingOrdersBySKU(ctx context.Context, sku string) ([]domain.Order, error) {
	if sku == "" {
		return nil, fmt.Errorf("sku is required")
	}

	return s.repo.PendingOrdersBySKU(ctx, sku)
}

func (s *Service) AllPendingOrders(ctx context.Context) ([]domain.Order, error) {
	return s.repo.AllPendingOrders(ctx)
}

func (s *Service) FindByID(ctx context.Context, id string) (*domain.Order, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	return s.repo.FindByID(ctx, id)
}
