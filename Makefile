SHELL := /usr/bin/env bash

PIPELINE_SCRIPT := ./scripts/local-pipeline.sh
BACKEND_DIR := backend

.DEFAULT_GOAL := help

.PHONY: help all pipeline pipeline-ci pipeline-fast pre-push install format-check lint coverage test clean

help: ## Show available commands.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

all: pipeline ## Run the full local pipeline.

pipeline: ## Run local backend checks, installing deps with npm install.
	$(PIPELINE_SCRIPT)

pipeline-ci: ## Replicate backend CI locally, including npm ci.
	$(PIPELINE_SCRIPT) --ci-install

pipeline-fast: ## Run backend checks, reusing existing node_modules.
	$(PIPELINE_SCRIPT) --skip-install

pre-push: pipeline ## Alias for the local pre-push check.

install: ## Install/update backend dependencies for local development.
	cd $(BACKEND_DIR) && npm install

format-check: ## Check backend formatting.
	cd $(BACKEND_DIR) && npm run format:check

lint: ## Run backend ESLint.
	cd $(BACKEND_DIR) && npm run lint

coverage: ## Run backend tests with CI coverage output.
	cd $(BACKEND_DIR) && npm run coverage:sonar

test: ## Run backend unit and integration tests.
	cd $(BACKEND_DIR) && npm test

clean: ## Remove generated backend coverage output.
	rm -rf $(BACKEND_DIR)/coverage $(BACKEND_DIR)/tests/coverage

migrate: ## Run pending database migrations.
	cd $(BACKEND_DIR) && npm run migrate

migrate-down: ## Rollback last migration (add N=2 for 2 steps).
	cd $(BACKEND_DIR) && npm run migrate:down $(N)

migrate-create: ## Create a new migration file: make migrate-create NAME="add-indexes"
	cd $(BACKEND_DIR) && npm run migrate:create "$(NAME)"

load-test: ## Run k6 load tests (requires k6 installed).
	k6 run $(BACKEND_DIR)/tests/load/scenarios.js -e BASE_URL=http://localhost:5000

load-test-listing: ## Run product listing load test.
	k6 run $(BACKEND_DIR)/tests/load/productList.js -e BASE_URL=http://localhost:5000

load-test-auth: ## Run auth flow load test.
	k6 run $(BACKEND_DIR)/tests/load/authFlow.js -e BASE_URL=http://localhost:5000

load-test-checkout: ## Run checkout flow load test.
	k6 run $(BACKEND_DIR)/tests/load/checkoutFlow.js -e BASE_URL=http://localhost:5000
