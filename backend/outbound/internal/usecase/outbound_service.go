package usecase

import (
	"context"
	"fmt"
	"math"

	"github.com/joyvixtor/dock-scheduling-system/backend/outbound/internal/domain"
)

type Repository interface {
	ActiveOutboundDocks(ctx context.Context) ([]domain.OutboundDock, error)
	FindOutboundDockByID(ctx context.Context, id string) (*domain.OutboundDock, error)
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ActiveOutboundDocks(ctx context.Context) ([]domain.OutboundDock, error) {
	return s.repo.ActiveOutboundDocks(ctx)
}

func (s *Service) FindOutboundDockByID(ctx context.Context, id string) (*domain.OutboundDock, error) {
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}

	return s.repo.FindOutboundDockByID(ctx, id)
}

func (s *Service) ClosestEmptyOutboundDock(ctx context.Context, locationX, locationY int) (*domain.OutboundDock, error) {
	docks, err := s.repo.ActiveOutboundDocks(ctx)
	if err != nil {
		return nil, err
	}

	if len(docks) == 0 {
		return nil, fmt.Errorf("no active outbound docks available")
	}

	var closestDock *domain.OutboundDock
	var minDistance float64 = -1

	for i := range docks {
		dock := &docks[i]
		dx := float64(dock.LocationX - locationX)
		dy := float64(dock.LocationY - locationY)
		distance := math.Sqrt(dx*dx + dy*dy)

		if minDistance == -1 || distance < minDistance {
			minDistance = distance
			closestDock = dock
		}
	}

	return closestDock, nil
}
