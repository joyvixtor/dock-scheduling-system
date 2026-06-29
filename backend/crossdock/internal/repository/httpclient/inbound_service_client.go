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

type InboundServiceClient struct {
	endpoint   string
	httpClient *http.Client
}

func NewInboundServiceClient(endpoint string) *InboundServiceClient {
	return &InboundServiceClient{
		endpoint: endpoint,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type inboundResponse struct {
	Data struct {
		InboundDockById struct {
			LocationX int `json:"locationX"`
			LocationY int `json:"locationY"`
		} `json:"inboundDockById"`
	} `json:"data"`
	Errors []graphqlError `json:"errors"`
}

func (c *InboundServiceClient) FindInboundDockCoordinates(ctx context.Context, dockID string) (*domain.InboundDockCoordinates, error) {
	requestBody := graphqlRequest{
		Query: `query InboundDockById($id: String!) { inboundDockById(id: $id) { locationX locationY } }`,
		Variables: map[string]any{
			"id": dockID,
		},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("marshal inbound graphql request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build inbound graphql request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call inbound graphql api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("inbound graphql api returned status %s", resp.Status)
	}

	var payload inboundResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode inbound graphql response: %w", err)
	}

	if len(payload.Errors) > 0 {
		return nil, fmt.Errorf("inbound graphql api error: %s", payload.Errors[0].Message)
	}

	return &domain.InboundDockCoordinates{
		LocationX: payload.Data.InboundDockById.LocationX,
		LocationY: payload.Data.InboundDockById.LocationY,
	}, nil
}
