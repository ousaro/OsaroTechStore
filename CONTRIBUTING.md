# Contributing

## Branch Strategy

- `main` — production-ready, protected
- `feat/*` — feature branches
- `fix/*` — bug fixes
- `chore/*` — tooling, config, CI

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`.

## Development Setup

```bash
nvm use
npm install
cp backend/.env.example backend/.env
# Edit backend/.env with your values
docker compose up -d mongo redis
cd backend && npm run migrate
cd ../frontend && npm start
```

## Code Quality

- **Lint**: `npm run lint` (runs ESLint on backend + frontend)
- **Format**: Prettier via lint-staged (pre-commit hook). Config at root `.prettierrc.json`
- **TypeScript**: `npm run typecheck` (`tsc --noEmit` in backend)
- **Migrations**: `cd backend && npm run migrate`

## Testing

```bash
# All tests
npm test

# Backend only
cd backend && npm test

# Specific test file
cd backend && NODE_OPTIONS='--import tsx/esm' node --test tests/unit/architecture/dependency-rules.test.js
```

Tests use Node's built-in test runner (`node --test`). Architecture tests verify layer boundaries (domain → no infra imports, application → no infra imports, kernel → domain-only).

## Project Structure

```
backend/src/
  shared/domain/         # Domain errors, events, value objects
  shared/application/    # Use cases, ports, pagination helpers
  shared/infrastructure/ # HTTP middleware, persistence, logger, retry
  modules/
    {module}/domain/         # Module-specific domain logic
    {module}/application/    # Module-specific use cases
    {module}/infrastructure/ # Routes, controllers, schemas
  infrastructure/        # Bootstrap, config, providers (DB, Stripe, etc.)

migrations/            # Database migration files (custom runner)
docs/
  adr/                 # Architecture Decision Records
  architecture/        # System design docs, data model, dependency graph
```

## Dependencies

- Node 24 (see `.nvmrc` / `.node-version`)
- MongoDB 7+
- Redis 7+
- Docker Compose for local infrastructure

## Naming Conventions

- Files: `camelCase.js` or `camelCase.ts`
- Classes/PascalCase types: PascalCase
- Functions/variables: camelCase
- Constants/MongoDB models: CONSTANT_CASE
- Migration files: `NNN-description.js`
