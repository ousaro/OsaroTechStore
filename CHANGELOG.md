# Changelog

## 2.0.0 (2026-06-07)

- Documented the modular backend architecture and current frontend feature layout.
- Added product browsing, categories, cart, orders, payments, auth, Google OAuth, admin management, and health/readiness endpoints.
- Added backend unit and integration coverage for architecture boundaries, auth, products, categories, orders, payments, users, and system routes.
- Added CI quality gates for backend verification and frontend verification.
- Added TypeScript infrastructure (tsconfig.json, strict mode, path aliases)
- Added Zod request validation middleware with schemas for all modules
- Added Pino structured logging adapter (JSON output, redacted secrets)
- Added database migration system (custom runner, versioned, reversible)
- Added standardised API response envelope (success/created/error/paginated)
- Added pagination/filtering/sorting utility and middleware
- Added idempotency key support for payment endpoints (MongoDB-backed TTL store)
- Added CQRS boundaries in payments module (commands vs queries ports)
- Added retry with exponential backoff + jitter for Stripe gateway
- Added soft-delete plugin for Mongoose (categories module demonstration)
- Added compound database indexes for products, orders, and audit_logs
- Added architecture dependency rule tests (layer isolation enforcement)
- Added pre-commit hooks (Husky + lint-staged + commitlint + Prettier)
- Added API versioning (/api/v1/ prefix with deprecation headers)
- Added Renovate config for automated dependency updates
- Added CONTRIBUTING.md with developer conventions
- Added docker-compose healthchecks for all services
- Added comprehensive docs/ (ADR, functional + non-functional requirements, architecture docs)
- Removed GitOps deployment workflow (out of scope for backend showcase)
