# Webapp Boilerplate - Makefile
# TODO: プロジェクト名に変更
# Development commands

# Load .env file if exists
-include .env
export

.PHONY: help setup install dev dev-web dev-backend build clean docker-up docker-down docker-build lint test db-init db-migrate db-upgrade db-downgrade db-reset db-history db-current

# Default target
help:
	@echo "Webapp Boilerplate - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup       - Initial project setup (install all dependencies)"
	@echo "  make install     - Install dependencies only"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start both frontend and backend (requires tmux)"
	@echo "  make dev-web     - Start frontend dev server"
	@echo "  make dev-backend - Start backend dev server"
	@echo ""
	@echo "Build:"
	@echo "  make build       - Build frontend for production"
	@echo "  make clean       - Clean build artifacts and dependencies"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up   - Start Docker development environment"
	@echo "  make docker-down - Stop Docker development environment"
	@echo "  make docker-build - Rebuild Docker images"
	@echo ""
	@echo "Quality:"
	@echo "  make lint        - Run linters (frontend + backend)"
	@echo "  make format      - Format code (frontend + backend)"
	@echo "  make test        - Run tests (frontend + backend)"
	@echo "  make typecheck   - Run type checking"
	@echo ""
	@echo "Database:"
	@echo "  make db-init     - Initialize database (create data dir + run migrations)"
	@echo "  make db-migrate  - Generate new migration from model changes"
	@echo "  make db-upgrade  - Apply pending migrations"
	@echo "  make db-downgrade - Rollback last migration"
	@echo "  make db-reset    - Reset database (delete + recreate)"
	@echo "  make db-history  - Show migration history"
	@echo "  make db-current  - Show current migration version"
	@echo ""
	@echo "Deploy:"
	@echo "  make infra-plan   - Preview Terraform changes"
	@echo "  make infra-apply  - Apply Terraform changes"

# ============================================================================
# Setup
# ============================================================================

setup: install db-init
	@echo "Creating .env file..."
	@[ -f .env ] || cp .env.example .env
	@echo ""
	@echo "Setup complete!"
	@echo ""
	@echo "To start development:"
	@echo "  make dev-web     (Terminal 1)"
	@echo "  make dev-backend (Terminal 2)"

install:
	@echo "Installing frontend dependencies..."
	pnpm install
	@echo ""
	@echo "Installing backend dependencies..."
	cd apps/backend && uv sync

# ============================================================================
# Development
# ============================================================================

dev:
	@command -v tmux >/dev/null 2>&1 || { echo "tmux is required for 'make dev'. Use 'make dev-web' and 'make dev-backend' separately."; exit 1; }
	# TODO: tmuxセッション名をプロジェクト名に変更 (webapp → myapp)
	@if tmux has-session -t webapp 2>/dev/null; then \
		echo "Attaching to existing webapp session..."; \
		tmux attach -t webapp; \
	else \
		echo "Creating new webapp session..."; \
		tmux new-session -d -s webapp 'make dev-web' \; \
			split-window -h 'make dev-backend' \; \
			attach; \
	fi

dev-web:
	pnpm dev:web

dev-backend:
	@PORT=8080; \
	while ss -tuln 2>/dev/null | grep -q ":$$PORT " || netstat -tuln 2>/dev/null | grep -q ":$$PORT "; do \
		echo "Port $$PORT is in use, trying next port..."; \
		PORT=$$((PORT + 1)); \
	done; \
	echo "Starting backend on port $$PORT"; \
	cd apps/backend && CORS_ORIGINS_STR="$(CORS_ORIGINS_STR)" uv run uvicorn src.main:app --reload --host 0.0.0.0 --port $$PORT

# ============================================================================
# Build
# ============================================================================

build:
	# TODO: パッケージ名を変更 (@webapp/web → @myapp/web)
	pnpm --filter @webapp/web build

clean:
	@echo "Cleaning build artifacts..."
	rm -rf apps/web/dist
	rm -rf apps/web/node_modules/.tmp
	rm -rf apps/backend/.venv
	rm -rf node_modules
	@echo "Clean complete"

# ============================================================================
# Docker
# ============================================================================

docker-up:
	docker compose up

docker-down:
	docker compose down

docker-build:
	docker compose build --no-cache

docker-logs:
	docker compose logs -f

# ============================================================================
# Quality
# ============================================================================

lint: lint-web lint-backend

lint-web:
	# TODO: パッケージ名を変更
	pnpm --filter @webapp/web lint

lint-backend:
	cd apps/backend && uv run ruff check src/

format: format-web format-backend

format-web:
	# TODO: パッケージ名を変更
	pnpm --filter @webapp/web lint --fix

format-backend:
	cd apps/backend && uv run ruff format src/

test: test-web test-backend

test-web:
	# TODO: パッケージ名を変更
	pnpm --filter @webapp/web test

test-backend:
	cd apps/backend && uv run pytest

typecheck:
	# TODO: パッケージ名を変更
	pnpm --filter @webapp/web build
	cd apps/backend && uv run mypy src/

# ============================================================================
# Database
# ============================================================================

db-init:
	@echo "Initializing database..."
	@mkdir -p apps/backend/data
	cd apps/backend && uv run alembic upgrade head
	@echo "Database initialized"

db-migrate:
	@read -p "Migration message: " msg; \
	cd apps/backend && uv run alembic revision --autogenerate -m "$$msg"

db-upgrade:
	cd apps/backend && uv run alembic upgrade head

db-downgrade:
	cd apps/backend && uv run alembic downgrade -1

db-reset:
	@echo "Resetting database..."
	rm -f apps/backend/data/app.db
	@mkdir -p apps/backend/data
	cd apps/backend && uv run alembic upgrade head
	@echo "Database reset complete"

db-history:
	cd apps/backend && uv run alembic history --verbose

db-current:
	cd apps/backend && uv run alembic current

# ============================================================================
# Deploy
# ============================================================================

infra-plan:
	cd infra && terraform plan

infra-apply:
	cd infra && terraform apply

# ============================================================================
# Utilities
# ============================================================================

check-deps:
	@echo "Checking dependencies..."
	@command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
	@command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required (npm install -g pnpm)"; exit 1; }
	@command -v uv >/dev/null 2>&1 || { echo "uv is required (https://docs.astral.sh/uv/)"; exit 1; }
	@echo "All dependencies installed"

tree:
	@tree -I 'node_modules|.venv|dist|__pycache__|.git' -L 3

api-docs:
	@echo "Opening API docs at http://localhost:8080/docs"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:8080/docs || open http://localhost:8080/docs

urls:
	@echo "Local URLs:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:8080"
	@echo "  API Docs: http://localhost:8080/docs"
