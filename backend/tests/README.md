# Backend Testing Architecture

This directory adds production-grade integration and Cucumber E2E coverage around the real Express app, real middleware, Mongoose repositories, JWT auth, and payment workflows.

## Layout

```txt
tests/
├── integration/          # node:test + SuperTest API integration specs
├── e2e/
│   ├── features/         # Cucumber feature files
│   ├── step-definitions/ # Reusable Given/When/Then steps
│   ├── support/          # World, hooks, Playwright/browser/API lifecycle
│   ├── pages/            # Page objects for frontend/browser journeys
│   └── fixtures/         # Browser/payment fixture data
├── shared/
│   ├── factories/        # Deterministic persisted test data
│   ├── mocks/            # Stripe gateway and webhook mocks
│   ├── builders/         # Auth/request builders
│   └── utils/            # Mongo memory server, app factory, clients
└── coverage/             # Cucumber and c8 reports
```

## Commands

- `npm test`: unit + integration tests.
- `npm run test:unit`: existing `node:test` unit suite.
- `npm run test:integration`: SuperTest integration suite.
- `npm run test:cucumber`: Cucumber BDD E2E suite.
- `npm run test:e2e`: alias for Cucumber.
- `npm run coverage`: c8 over unit + integration tests with thresholds.
- `npm run coverage:html`: HTML report in `tests/coverage/html`.
- `npm run coverage:e2e`: c8 over the Cucumber runner.

## Isolation Model

Integration tests use `mongodb-memory-server` and Mongoose against an isolated database. Each file owns its app and Mongo lifecycle, and each test clears collections before running. Cucumber starts a fresh in-memory database and real HTTP server per scenario, which prevents state leakage between BDD workflows.

State leakage is the main source of flaky database tests: one test creates a user, another assumes the user table is empty, and timing/order changes cause failures. Keep tests deterministic by creating all data through factories, avoiding shared IDs, clearing collections in hooks, and not relying on test execution order.

## Stripe Strategy

The integration and E2E suites inject a Stripe gateway mock at the payments port. That keeps tests fast, deterministic, and offline while still exercising the payments module, persistence, webhook route, event bus, and order synchronization.

Use Stripe test mode only for a small external smoke suite or pre-release environment, because it depends on network, account configuration, and third-party availability. Unit tests should mock at the smallest boundary; integration and Cucumber tests mock the gateway port; external E2E tests can use Stripe test mode with real test cards.

## Auth Strategy

Factories create persisted users through the real auth repository so password hashing and database reads stay realistic. Tests generate JWTs through the injected token service, and cover missing, malformed, expired, non-admin, and admin authorization paths.

## Reliability Notes

Write retry-safe scenarios by making webhooks idempotent at the application boundary and asserting final state after every webhook call. Keep fake data deterministic enough to debug, but unique enough to avoid duplicate-key collisions. Prefer API/database assertions over implementation assertions unless the behavior is explicitly about an adapter contract.
