.PHONY: install db-up db-down compose router orders inbound crossdock outbound appointments dev

ROUTER_VERSION=v1.59.2

# Instala a ferramenta de hot-reload do Go (Air)
install:
	go install github.com/air-verse/air@latest
	@echo "Air instalado com sucesso! Certifique-se de que o $(go env GOPATH)/bin está no seu PATH."

# Sobe os bancos de dados
db-up:
	docker-compose up -d

# Derruba os bancos de dados
db-down:
	docker-compose down

# Gera o arquivo de schema unificado do Supergrafo
compose:
	bash gateway/compose.sh

# Roda o Apollo Router sozinho (baixando o binário localmente se necessário para evitar problemas com localhost do Docker no Mac)
router: compose
	@if [ ! -f gateway/router ]; then \
		curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh; \
		mv router gateway/router; \
	fi
	gateway/router --supergraph gateway/supergraph-schema.graphql --config gateway/router-config.yaml

# Roda o subgrafo ORDERS com live-reload (Air)
orders:
	cd orders && set -a && . ./.env && set +a && air --build.cmd "go build -o tmp/main ./cmd/server" --build.bin "./tmp/main"

# Roda o subgrafo INBOUND com live-reload (Air)
inbound:
	cd inbound && set -a && . ./.env && set +a && air --build.cmd "go build -o tmp/main ./cmd/server" --build.bin "./tmp/main"

# Roda o subgrafo CROSSDOCK com live-reload (Air)
crossdock:
	cd crossdock && set -a && . ./.env && set +a && air --build.cmd "go build -o tmp/main ./cmd/server" --build.bin "./tmp/main"

# Roda o subgrafo OUTBOUND com live-reload (Air)
outbound:
	cd outbound && set -a && . ./.env && set +a && air --build.cmd "go build -o tmp/main ./cmd/server" --build.bin "./tmp/main"

appointments:
	cd appointments && set -a && . ./.env && set +a && air --build.cmd "go build -o tmp/main ./cmd/server" --build.bin "./tmp/main"

# Comando mágico: sobe os bancos, compõe o supergrafo e roda os 4 serviços + router em paralelo no terminal!
dev: db-up compose
	@echo "🚀 Iniciando todo o ecossistema Davenport em paralelo..."
	@$(MAKE) -j 6 orders inbound crossdock outbound appointments router
