package usecase

import (
	"context"
	"fmt"

	"github.com/joyvixtor/dock-scheduling-system/backend/orders/internal/domain"
)

type OrderRepository interface {
	PendingDemandBySKU(ctx context.Context, sku string) (int, error)
	PendingOrdersBySKU(ctx context.Context, sku string) ([]domain.Order, error)
	FindByID(ctx context.Context, id string) (*domain.Order, error)
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

func (s *Service) PendingOrdersBySKU(ctx context.Context, sku string) ([]domain.Order, error) {
	if sku == "" {
		return nil, fmt.Errorf("sku is required")
	}

	return s.repo.PendingOrdersBySKU(ctx, sku)
}

func (s *Service) FindByID(ctx context.Context, id string) (*domain.Order, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	return s.repo.FindByID(ctx, id)
}
