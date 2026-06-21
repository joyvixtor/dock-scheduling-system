#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v rover >/dev/null 2>&1; then
  curl -sSL https://rover.apollo.dev/nix/latest | sh
  export PATH="$HOME/.rover/bin:$PATH"
fi

TMP_SUPERGRAPH_CONFIG="$ROOT_DIR/gateway/.supergraph-config.yaml"
trap 'rm -f "$TMP_SUPERGRAPH_CONFIG"' EXIT

cat > "$TMP_SUPERGRAPH_CONFIG" <<'YAML'
federation_version: =2.3.2
subgraphs:
  orders:
    routing_url: http://localhost:8081/query
    schema:
      file: ../orders/internal/delivery/graphql/schema/order.graphqls
  inbound:
    routing_url: http://localhost:8082/query
    schema:
      file: ../inbound/internal/delivery/graphql/schema/inbound.graphqls
  crossdock:
    routing_url: http://localhost:8083/query
    schema:
      file: ../crossdock/internal/delivery/graphql/schema/crossdock.graphqls
YAML

rover supergraph compose \
  --config "$TMP_SUPERGRAPH_CONFIG" \
  --output gateway/supergraph-schema.graphql \
  --elv2-license accept