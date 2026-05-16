# Non-Functional Requirements

## Availability

- Public storefront and checkout APIs should target 99.5% monthly availability.
- Admin APIs should target 99.0% monthly availability.
- `/health` must report process health and `/ready` must verify required providers before traffic is routed.

## Performance

- Public product list and detail reads should respond within 300 ms at p95 under normal load.
- Auth, cart, order, and payment initiation writes should respond within 750 ms at p95, excluding third-party payment latency.
- List endpoints must use bounded pagination defaults and avoid unbounded database reads.

## Security

- Authentication endpoints must have abuse protection.
- Users may only access their own orders, profile, cart, favorites, and payment workflows unless they are admins.
- Production CORS must use an explicit allowlist when credentials are enabled.
- Secrets must be supplied through environment variables or the deployment secret manager, never committed files.
- JWT access-token lifetimes should be short enough to limit replay impact and paired with a documented session invalidation strategy before production use.

## Data And Backups

- MongoDB backups should run at least daily in production and be restore-tested before launch.
- Payment webhooks must be idempotent and safe to retry.
- Product images should be stored in an external object storage service, not per-instance local disk.

## Accessibility

- Customer-facing flows should meet WCAG 2.1 AA for keyboard navigation, focus visibility, labels, contrast, and error messaging.
- Admin screens should remain usable by keyboard and screen reader users for product, category, and order management.

## Operational Readiness

- Production logs should include request ids and be ingestible by the hosting platform or log provider.
- Dependency audit and quality gates should run in CI after current findings are remediated.
- Deployment docs must list required environment variables, optional provider settings, and secret rotation expectations.
