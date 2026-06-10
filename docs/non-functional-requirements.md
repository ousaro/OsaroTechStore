# Non-Functional Requirements

> Version 2.0.0 — Last updated: 2026-06-10

## 1. Availability

| Requirement                         | Target        | Verification      |
| ----------------------------------- | ------------- | ----------------- |
| Public storefront and checkout APIs | 99.5% monthly | Uptime monitoring |
| Admin APIs                          | 99.0% monthly | Uptime monitoring |

### Mechanisms

- `GET /health` — reports process health (service name, version, uptime, timestamp); no auth required
- `GET /ready` — runs dependency checks (database, payment provider, event bus); returns 200 or 503
- Graceful shutdown — SIGTERM/SIGINT drains in-flight requests within 10s timeout
- Docker Compose healthchecks — dependent services wait for prerequisites (MongoDB → Backend → Frontend)
- Healthcheck endpoint available without authentication for load balancer probing

## 2. Performance & Scalability

### Rate Limiting

| Scope                 | Limit                         | Implementation                         |
| --------------------- | ----------------------------- | -------------------------------------- |
| Global                | 200 requests/minute per IP    | `express-rate-limit` in `createApp.js` |
| Auth (register/login) | 20 requests/15 minutes per IP | Route-level limiter in `authRoutes.js` |

### Data Access

- All list endpoints use bounded pagination (`page` + `limit`, max 100 per page, configurable via Zod schema)
- Product and category list endpoints support sorting and category filtering
- Compound indexes defined in migration `001`:
  - Products: `(category, status, createdAt)`, `(price)`, `(createdAt)`
  - Orders: `(status, createdAt)`, `(isPaid, ownerId)`
  - Audit logs: `(actor, timestamp)`

### Connection Management

- MongoDB pool: `minPoolSize=2`, `maxPoolSize=10` (configurable via `MONGO_MIN_POOL_SIZE` / `MONGO_MAX_POOL_SIZE`)
- Slow query detection: Mongoose plugin logs warnings for queries > 200ms (configurable via `MONGO_SLOW_OP_THRESHOLD_MS`)

### Resilience

- Retry with exponential backoff + jitter: Stripe gateway calls (3 attempts, base delay 200ms, max 3s total)
- Payment webhooks idempotent by Stripe `eventId` — safe to retry

## 3. Security

### Authentication & Authorization

| Layer            | Mechanism                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Transport        | CORS with explicit allowlist (`CORS_ALLOWED_ORIGINS`, defaults to `CLIENT_URL`)                  |
| Authentication   | JWT access tokens, short-lived (default 15m, configurable `TOKEN_EXPIRES_IN`)                    |
| Authorization    | `requireAuth` + `requireAdmin` middleware; ownership guard (non-admins limited to own resources) |
| Abuse protection | Rate limiting on auth endpoints                                                                  |

### Data Protection

- Passwords hashed with bcrypt (never stored in plaintext)
- Secrets supplied through environment variables; `.env` gitignored; `.env.example` documents required vars
- Pino logger redacts sensitive fields (`authorization` headers, `password`, `token`)
- Request ID (UUID) per request enables tracing across logs and services
- Stripe webhook signatures verified on every event

## 4. Data Integrity

- Database schema versioned via migration files (`migrations/NNN-description.js`); reversible via `migrate:down`
- MongoDB `$jsonSchema` validators enforced at database level for all 5 collections (users, categories, products, orders, payments)
- Idempotency records auto-expire via TTL index (`_idempotency.expiresAt`)
- Product mutations recorded in `audit_logs` (actor, action, target, timestamp)

## 5. Observability

| Aspect          | Implementation                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Logging         | Pino structured JSON output; configurable provider (pino/console/json/noop)                      |
| Log correlation | Request ID included in every log line                                                            |
| Metrics         | Prometheus at `/metrics` via `express-prom-bundle` (request count, latency, error rate by route) |
| Health          | `GET /health` (liveness) and `GET /ready` (readiness with dependency checks)                     |
| API docs        | Swagger UI at `/api-docs`; raw OpenAPI 3.0.3 spec at `/api-docs/openapi.yaml`                    |

## 6. Scalability

### Horizontal Scaling

- Backend is stateless — any instance can handle any request
- Session state stored in client-side JWT (no server-side session store needed)
- Event bus supports Redis Streams backend for cross-instance event delivery
- MongoDB connection pooling tuned for concurrent instance connections

### Vertical Scaling Boundaries

- CPU-bound: image upload processing, Stripe webhook verification
- Memory-bound: product listing with large result sets (mitigated by pagination)
- I/O-bound: database queries (mitigated by indexes and connection pooling)

## 7. Operational Readiness

- Production logs are structured JSON (Pino), ingestible by Datadog, ELK, Grafana Loki
- CI quality gates run on every push: lint → typecheck → test (with coverage thresholds) → build
- Dependency audit (`npm audit`) runs in CI on every push
- Renovate bot opens automated PRs for dependency updates (weekly, grouped minors/patches, security alerts)
- Docker Compose topology for local production-like testing

## 8. Revision History

| Date       | Change                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 2026-06-10 | Added observability, scalability, revision history sections; restructured with numbered sections |
| 2026-06-07 | Initial version                                                                                  |
