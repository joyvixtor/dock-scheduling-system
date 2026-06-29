package usecase

import (
	"context"
	"fmt"

	"github.com/joyvixtor/dock-scheduling-system/backend/inbound/internal/domain"
)

type Repository interface {
	ActiveInboundDocks(ctx context.Context) ([]domain.InboundDock, error)
	ProductBySKU(ctx context.Context, sku string) (*domain.Product, error)
	FindInboundDockByID(ctx context.Context, id string) (*domain.InboundDock, error)
	UpdateStatus(ctx context.Context, id string, status domain.DockStatus) error
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ActiveInboundDocks(ctx context.Context) ([]domain.InboundDock, error) {
	return s.repo.ActiveInboundDocks(ctx)
}

func (s *Service) ProductBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	if sku == "" {
		return nil, fmt.Errorf("sku is required")
	}

	return s.repo.ProductBySKU(ctx, sku)
}

func (s *Service) FindInboundDockByID(ctx context.Context, id string) (*domain.InboundDock, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	return s.repo.FindInboundDockByID(ctx, id)
}

func (s *Service) UpdateStatus(ctx context.Context, id string, status domain.DockStatus) (*domain.InboundDock, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	if err := s.repo.UpdateStatus(ctx, id, status); err != nil {
		return nil, err
	}

	return s.repo.FindInboundDockByID(ctx, id)
}
