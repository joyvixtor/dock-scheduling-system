package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type OrderServiceClient struct {
	endpoint   string
	httpClient *http.Client
}

func NewOrderServiceClient(endpoint string) *OrderServiceClient {
	return &OrderServiceClient{
		endpoint: endpoint,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type graphqlRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables"`
}

type graphqlError struct {
	Message string `json:"message"`
}

type graphqlResponse struct {
	Data struct {
		PendingDemandBySku int `json:"pendingDemandBySku"`
	} `json:"data"`
	Errors []graphqlError `json:"errors"`
}

func (c *OrderServiceClient) PendingDemandBySKU(ctx context.Context, sku string) (int, error) {
	requestBody := graphqlRequest{
		Query: `query PendingDemandBySku($sku: String!) { pendingDemandBySku(sku: $sku) }`,
		Variables: map[string]any{
			"sku": sku,
		},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return 0, fmt.Errorf("marshal orders graphql request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return 0, fmt.Errorf("build orders graphql request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("call orders graphql api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return 0, fmt.Errorf("orders graphql api returned status %s", resp.Status)
	}

	var payload graphqlResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return 0, fmt.Errorf("decode orders graphql response: %w", err)
	}

	if len(payload.Errors) > 0 {
		return 0, fmt.Errorf("orders graphql api error: %s", payload.Errors[0].Message)
	}

	return payload.Data.PendingDemandBySku, nil
}
