# Backend System Design Choices

> Version 2.0.0 — Last updated: 2026-06-10

This document records the backend design choices implemented in `backend/src`.
It should be read with [`backend-dependency-graph.md`](./backend-dependency-graph.md), which shows the runtime wiring, and the [Architecture Decision Records](../adr/) for deeper rationale on key decisions.

## Current Implementation Status

| Choice                                  | Status      | Code Location                                                   |
| --------------------------------------- | ----------- | --------------------------------------------------------------- |
| Modular hexagonal architecture          | Implemented | `backend/src/modules/*`                                         |
| Single composition root                 | Implemented | `infrastructure/bootstrap/configureApplicationModules.js`       |
| Provider-based infrastructure selection | Implemented | `infrastructure/providers/*`                                    |
| CQRS (payments module)                  | Implemented | `modules/payments/ports/input/`                                 |
| Cross-module workflows via events       | Implemented | `modules/*/adapters/input/collaboration`                        |
| HTTP as input adapter                   | Implemented | `modules/*/adapters/input/http`                                 |
| Repository ports + Mongoose adapters    | Implemented | `modules/*/ports/output`, `modules/*/adapters/output/`          |
| TypeScript shared kernel                | Implemented | `shared/` (28 `.ts` files)                                      |
| Zod request validation                  | Implemented | `shared/infrastructure/http/middleware/validateRequest.ts`      |
| Pino structured logging                 | Implemented | `infrastructure/providers/logger/pinoLogger.ts`                 |
| Database migrations (custom runner)     | Implemented | `migrations/runner.js`, `migrations/migrate.js`                 |
| Standardised API response envelope      | Implemented | `shared/infrastructure/http/responseEnvelope.ts`                |
| Pagination / filtering / sorting        | Implemented | `shared/application/pagination.ts`, `withPagination` middleware |
| Idempotency (payments)                  | Implemented | `shared/infrastructure/persistence/idempotencyStore.ts`         |
| Retry with exponential backoff          | Implemented | `shared/infrastructure/retry.ts`                                |
| Soft-delete (categories)                | Implemented | `shared/infrastructure/persistence/mongooseSoftDeletePlugin.js` |
| API versioning                          | Implemented | `shared/infrastructure/http/middleware/apiVersionMiddleware.ts` |
| Architecture dependency rule tests      | Implemented | `tests/unit/architecture/dependency-rules.test.js`              |
| OpenAPI documentation                   | Implemented | `shared/infrastructure/http/openApiDocs.js`                     |
| Health and readiness endpoints          | Implemented | `shared/infrastructure/http/healthRoutes.js`                    |
| Prometheus metrics                      | Implemented | `createApp.js` via `express-prom-bundle`                        |
| Rate limiting                           | Implemented | `createApp.js` (global) + `authRoutes.js` (auth-specific)       |
| Graceful shutdown                       | Implemented | `startApplication.js` (SIGTERM/SIGINT, 10s timeout)             |

---

## 1. Architecture Style: Modular Hexagonal

The backend is organized around business modules rather than technical layers. Each module owns its domain model, application use cases, ports, HTTP adapter, and persistence adapter.

**Dependency direction:**

```
HTTP/collaboration adapters → input port → use cases → domain
use cases → output ports → infrastructure adapters
```

**Why:**

- Keeps each module independently testable
- Allows infrastructure to change behind ports without rewriting module logic
- Makes the dependency graph explicit at startup instead of hidden behind globals

**Architecture enforcement:** Tests in `tests/unit/architecture/dependency-rules.test.js` verify that domain never imports from application or infrastructure, and application never imports from infrastructure. Violations cause CI failure.

## 2. Composition Root

`configureApplicationModules.js` is the only file that knows the full dependency graph. It:

1. Resolves infrastructure providers (logger, database, payment gateway, event bus)
2. Connects the database
3. Creates repositories
4. Creates module instances with injected dependencies
5. Wires cross-module event translators
6. Returns route creators + health checks + shutdown hook to the application

**Why not a DI container:** Manual wiring is explicit and debuggable. For 6 modules it's the right trade-off. A container (awilix) becomes beneficial at ~20+ modules.

## 3. Provider Selection (Strategy Pattern)

Infrastructure providers use a resolver/strategy pattern:

| Concern   | Resolver                     | Implementations                   |
| --------- | ---------------------------- | --------------------------------- |
| Logger    | `resolveLogger.ts`           | `pino`, `console`, `json`, `noop` |
| Database  | `resolveDatabaseStrategy.js` | `mongo`                           |
| Payments  | `resolvePaymentStrategy.js`  | `stripe`, `disabled`              |
| Event bus | `resolveEventBus.js`         | `inprocess`, `redis`              |

Each implementation satisfies a port interface (TypeScript) and is validated at runtime by an assertion function (e.g., `assertLoggerPort()`). This gives type-level safety during development and fail-fast errors at startup.

## 4. CQRS-Style Use-Case Separation

All 6 modules organize application use-cases into `commands/` and `queries/` folders:

| Module     | Commands                                                                             | Queries                               |
| ---------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| auth       | `registerUser`, `loginUser`, `deleteManagedUser`, `updateManagedUser`                | `listUsers`, `getUser`                |
| categories | `addCategory`, `updateCategory`, `deleteCategory`                                    | `getAllCategories`, `getCategoryById` |
| orders     | `addOrder`, `updateOrder`, `deleteOrder`, `confirmOrderPayment`                      | `getAllOrders`, `getOrderById`        |
| payments   | `createPaymentIntent`, `verifyWebhook`, `linkPaymentToOrder`                         | `getPaymentByOrderId`                 |
| products   | `addProduct`, `updateProduct`, `deleteProduct`, `addProductReview`, `decrementStock` | `getAllProducts`, `getProductById`    |
| users      | `updateUserProfile`, `updateUserPassword`, `updateUserCart`, `updateUserFavorites`   | `getUserProfile`                      |

The payments module **extends** this with full port-level CQRS:

- `paymentsCommandsPort.js` — `createPaymentIntent`, `verifyWebhook`, `linkPaymentToOrder`
- `paymentsQueriesPort.js` — `getPaymentByOrderId`

The HTTP controller receives both ports separately, making the read/write split explicit at the HTTP boundary. Other modules use a single combined input port but retain the use-case-level separation.

## 5. Event-Driven Cross-Module Communication

Modules communicate through domain events and collaboration translators:

| Event                             | Publisher  | Translator                                | Receiver |
| --------------------------------- | ---------- | ----------------------------------------- | -------- |
| `OrderPlaced`                     | Orders     | `orderPlacedPaymentLinkTranslator`        | Payments |
| `OrderPlaced`                     | Orders     | `orderPlacedStockTranslator`              | Products |
| `CategoryDeleted`                 | Categories | `categoryDeletedProductCleanupTranslator` | Products |
| `PaymentConfirmed/Failed/Expired` | Payments   | `paymentConfirmedOrderSyncTranslator`     | Orders   |

All translators are subscribed by the composition root. The event bus supports two implementations:

- **In-process** — `Map<string, Set<handler>>`, runs handlers concurrently via `Promise.allSettled`
- **Redis Streams** — Persistent, distributable across instances, dead-letter stream for failed events

## 6. Request Validation (Zod)

Validation happens at two boundaries:

1. **HTTP boundary** — `validateRequest.ts` middleware validates `body`, `query`, `params` against Zod schemas
2. **Database boundary** — MongoDB `$jsonSchema` validators in migration `001-create-initial-schema.js`

Zod schemas live in `shared/infrastructure/http/middleware/schemas/`. The middleware returns 400 with field-level error details on failure.

## 7. Idempotency

Payment endpoints support idempotency at two levels:

- **HTTP level** — `idempotencyMiddleware.ts` checks `Idempotency-Key` header, returns 409 on duplicate, auto-generates key if missing
- **Webhook level** — Stripe webhook handler deduplicates by Stripe `eventId`

Backed by `idempotencyStore.ts` — MongoDB collection `_idempotency` with TTL index (auto-expiry), tracking key + response + expiresAt.

## 8. Retry with Backoff

`retry.ts` wraps async functions with:

- Exponential backoff: `baseDelay * 2^attempt + jitter`
- Jitter: random 0–100ms to prevent thundering herd
- Retryable errors: 429 (rate limit), 5xx (server errors), timeouts/network errors
- Configurable max attempts (default: 3)

Applied to Stripe gateway for `checkout.sessions.create` and `checkout.sessions.retrieve`.

## 9. Soft-Delete

`mongooseSoftDeletePlugin.js` adds `isDeleted` (Boolean, default false) and `deletedAt` (Date, default null) to schemas. A `pre('find')` hook filters out soft-deleted documents. The category repository exposes `deleteById`, `restoreById`, and `findAllWithDeleted`.

## 10. API Versioning

Routes are mounted at both `/api/` and `/api/v1/`. The `apiVersionMiddleware.ts` adds:

- `X-API-Version: v1` response header on all requests
- `Deprecation` + `Sunset` headers on legacy `/api/` routes
- `Link: </api/v1>; rel="successor-version"` on deprecated routes

## 11. Infrastructure Providers Detail

| Provider               | File                     | Key Behaviour                                                                                                                                |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Pino Logger            | `pinoLogger.ts`          | JSON output, redacted secrets (`authorization`, `password`, `token`), child logger support, configurable timestamps                          |
| Console Logger         | `consoleLogger.ts`       | Colored output with scope prefix, supports `%o` formatting for objects                                                                       |
| Mongo Provider         | `mongoProvider.js`       | Mongoose connection with configurable pool size (default min=2, max=10), slow query detection (default threshold 200ms), optional debug mode |
| Stripe Gateway         | `stripeGateway.js`       | Wraps Stripe SDK, retry wrapper applied to critical calls, webhook signature verification                                                    |
| In-Process Event Bus   | `inProcessEventBus.js`   | In-memory pub/sub, concurrent handler execution, handler failure isolation, unsubscribe support                                              |
| Redis Stream Event Bus | `redisStreamEventBus.js` | Persistent streams, dead-letter queue, per-subscriber dedicated client, long-polling via `xRead`                                             |

## 12. Testing Strategy

| Layer              | Tool                                            | Scope                                                                                             |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Architecture tests | `node:test`                                     | Static analysis of imports — enforces dependency rules and module boundaries                      |
| Unit tests         | `node:test` + `node:assert/strict`              | Use cases, domain services, value objects, ports, middleware, providers — all dependencies mocked |
| Integration tests  | `node:test` + `supertest` + `MongoMemoryServer` | Full HTTP surface — realistic flows through auth, products, orders, payments                      |
| Load tests         | k6                                              | Auth, checkout, product listing — with performance budgets defined in README                      |

Test configuration: `c8` for coverage (50% branches, 60% lines/funcs/stmts enforced in CI).

## 13. Security Architecture

| Concern              | Implementation                                                      |
| -------------------- | ------------------------------------------------------------------- |
| Authentication       | JWT with configurable expiry (default 15m)                          |
| Authorization        | `requireAuth` + `requireAdmin` middleware                           |
| Ownership            | Order enforcement: non-admins can only see/update their own orders  |
| Input validation     | Zod at HTTP boundary, `$jsonSchema` in MongoDB                      |
| Webhook verification | Stripe signature verification                                       |
| Rate limiting        | 200 req/min global, 20 req/15min on auth endpoints                  |
| CORS                 | Configurable allowlist (default: CLIENT_URL)                        |
| Secrets              | All configurable via environment variables, `.env` gitignored       |
| Request ID           | UUID per request, echoed in response, forwarded to logs             |
| Log redaction        | Pino configured to redact authorization, password, and token fields |

---

## Revision History

| Date       | Change                                                  |
| ---------- | ------------------------------------------------------- |
| 2026-06-10 | Added revision history, cross-links to ADRs and NFR doc |
| 2026-06-07 | Initial version                                         |

| Concern              | Implementation                                                      |
| -------------------- | ------------------------------------------------------------------- |
| Authentication       | JWT with configurable expiry (default 15m)                          |
| Authorization        | `requireAuth` + `requireAdmin` middleware                           |
| Ownership            | Order enforcement: non-admins can only see/update their own orders  |
| Input validation     | Zod at HTTP boundary, `$jsonSchema` in MongoDB                      |
| Webhook verification | Stripe signature verification                                       |
| Rate limiting        | 200 req/min global, 20 req/15min on auth endpoints                  |
| CORS                 | Configurable allowlist (default: CLIENT_URL)                        |
| Secrets              | All configurable via environment variables, `.env` gitignored       |
| Request ID           | UUID per request, echoed in response, forwarded to logs             |
| Log redaction        | Pino configured to redact authorization, password, and token fields |
