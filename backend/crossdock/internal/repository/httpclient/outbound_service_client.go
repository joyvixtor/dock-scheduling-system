package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/joyvixtor/dock-scheduling-system/backend/crossdock/internal/domain"
)

type OutboundServiceClient struct {
	endpoint   string
	httpClient *http.Client
}

func NewOutboundServiceClient(endpoint string) *OutboundServiceClient {
	return &OutboundServiceClient{
		endpoint: endpoint,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type outboundResponse struct {
	Data struct {
		ClosestEmptyOutboundDock struct {
			ID         string `json:"id"`
			DockNumber string `json:"dockNumber"`
		} `json:"closestEmptyOutboundDock"`
	} `json:"data"`
	Errors []graphqlError `json:"errors"`
}

func (c *OutboundServiceClient) ClosestEmptyOutboundDock(ctx context.Context, locationX, locationY int) (*domain.OutboundDockReference, error) {
	requestBody := graphqlRequest{
		Query: `query ClosestEmptyOutboundDock($locationX: Int!, $locationY: Int!) { closestEmptyOutboundDock(locationX: $locationX, locationY: $locationY) { id dockNumber } }`,
		Variables: map[string]any{
			"locationX": locationX,
			"locationY": locationY,
		},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("marshal outbound graphql request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build outbound graphql request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call outbound graphql api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("outbound graphql api returned status %s", resp.Status)
	}

	var payload outboundResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode outbound graphql response: %w", err)
	}

	if len(payload.Errors) > 0 {
		return nil, fmt.Errorf("outbound graphql api error: %s", payload.Errors[0].Message)
	}

	// Handle case where no dock is available (null response)
	if payload.Data.ClosestEmptyOutboundDock.ID == "" {
	    return nil, fmt.Errorf("no available outbound docks found")
	}

	return &domain.OutboundDockReference{
		ID:         payload.Data.ClosestEmptyOutboundDock.ID,
		DockNumber: payload.Data.ClosestEmptyOutboundDock.DockNumber,
	}, nil
}
