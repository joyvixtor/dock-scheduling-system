package resolvers

import "github.com/joyvixtor/dock-scheduling-system/backend/crossdock/internal/usecase"

type Resolver struct {
	MatchingEngine *usecase.MatchingEngine
}

func NewResolver(matchingEngine *usecase.MatchingEngine) *Resolver {
	return &Resolver{MatchingEngine: matchingEngine}
}
