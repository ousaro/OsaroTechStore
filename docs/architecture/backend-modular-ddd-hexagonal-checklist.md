# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist turns the architecture gaps into concrete implementation work.

Use it as a working migration list, not as a one-shot rewrite plan.

## 1. Module Boundaries

- [ ] Define allowed import rules between modules
- [ ] Enforce that cross-module imports go only through `public-api.js`
- [x] Stop exporting full input ports from `public-api.js` unless absolutely necessary
- [ ] Replace broad public exports with capability-specific functions
Progress: auth public API now exposes named account capabilities instead of one broad `userAccounts` object.
Progress: empty `public-api.js` placeholders with no consumers have now been removed from users, payments, orders, and categories so only modules with actual cross-module capabilities keep that surface.
- [ ] Keep `composition.js` private to each module
- Progress: auth composition no longer exports its input port because that wiring is now kept internal to the module.
- Progress: users, products, categories, orders, and payments compositions also now keep their input ports private because that wiring is only used internally by module HTTP adapters.
- [ ] Keep `index.js` local to module adapters and bootstrap only
Progress: product scheduler bootstrap now uses a dedicated module bootstrap export instead of the product module `index.js`.
Progress: auth module `index.js` is now narrowed to HTTP handler exports instead of re-exporting public-api style capabilities.
Progress: products module `index.js` is now narrowed to HTTP handler exports instead of re-exporting the products input port.
Progress: users module `index.js` is now narrowed to HTTP handler exports instead of re-exporting the users input port.
Progress: payments module `index.js` is now narrowed to HTTP handler exports instead of re-exporting the payments input port.
Progress: categories module `index.js` is now narrowed to HTTP handler exports instead of re-exporting the categories input port.
Progress: orders module `index.js` is now narrowed to HTTP handler exports instead of re-exporting the orders input port.
Progress: `users/index.js` has now been removed entirely because it had no remaining consumers.
Progress: `products/index.js` has now been removed entirely because it had no remaining consumers.
Progress: `payments/index.js` has now been removed entirely because it had no remaining consumers.
Progress: `categories/index.js` has now been removed entirely because it had no remaining consumers.
Progress: `orders/index.js` has now been removed entirely because it had no remaining consumers.
Progress: `auth/index.js` has now been removed entirely because it had no remaining runtime consumers; the remaining test now imports the adapter-facing composition export directly.
- [ ] Decide whether `auth` and `users` remain separate bounded contexts or merge conceptually into one
- [ ] Document the ownership boundary between identity/auth data and profile/user data

## 2. Composition Root

- [ ] Define one clear application composition root
- [ ] Move runtime startup concerns into explicit bootstrap wiring
- Progress: product scheduler startup is now imported through a dedicated module bootstrap file instead of the broader module index surface.
- [ ] Review scheduler startup ownership and decide whether it belongs in app bootstrap or infrastructure bootstrap
- [x] Ensure route adapters do not depend on broad module entrypoints when a narrower local import is enough

## 3. Domain Purity

- [ ] Remove HTTP-oriented error handling from domain objects
- Progress: auth, products, categories, orders, and users no longer throw HTTP-shaped `ApiError` from their domain factories/entities.
- [ ] Replace `ApiError` usage in domain code with domain/application-specific errors
- Progress: `AuthValidationError`, `AuthConflictError`, `AuthUnauthorizedError`, `CategoryValidationError`, `CategoryNotFoundError`, `OrderNotFoundError`, `PaymentValidationError`, `PaymentWebhookError`, `ProductNotFoundError`, `UserNotFoundError`, `UserValidationError`, and `DomainValidationError` are now in use across the auth, categories, orders, payments, users, products, and shared validation flows.
- Progress: the legacy shared `ApiError` class has now been removed because no runtime code depends on it anymore.
- [ ] Map domain/application errors to HTTP responses only in transport adapters
- Progress: shared HTTP error resolution now maps auth, category, order, payment, product, user, domain-validation, and transport-validation errors in `errorMiddleware` and `createRequireAuthMiddleware`.
- [ ] Remove direct framework/library validation dependencies from domain objects where possible
- Progress: auth email/password validation no longer depends on `validator` inside the domain layer.
- [ ] Wrap external validation rules behind policies or application-layer validation when appropriate
- Progress: auth credential validation now runs through an application policy instead of the domain command object.

## 4. Rich Domain Modeling

- [ ] Introduce value objects where business language matters
- [ ] Add `Email` value object
- [ ] Add `Money` value object
- [ ] Add `Address` value object for orders
- [ ] Add `OrderStatus` value object or state model
- [ ] Add `PaymentStatus` value object or state model
- [ ] Add explicit order lifecycle transitions instead of only patch builders
- [ ] Identify which modules need true aggregates instead of thin entities
- [ ] Add domain services only where rules span multiple entities/value objects

## 5. Payments Module

- [ ] Define the actual payment domain model
- [ ] Decide whether payments need their own persistence model/table/collection
- [ ] Persist payment state instead of treating payments as a pure gateway pass-through
- [ ] Model checkout session creation as a business workflow, not only a gateway call
- [ ] Model webhook outcomes as business events or state transitions
- [ ] Decide how payments update orders
- [ ] Prefer event-driven collaboration between orders and payments
- [ ] Add idempotency handling for webhook processing
- [ ] Add tests for webhook-driven state changes
Progress: payment input validation and webhook transport failure now use payment-specific application errors instead of `ApiError`.

## 6. Orders Module

- [ ] Move order state changes toward explicit behaviors instead of generic patch updates
- [ ] Separate create/update commands from read queries where useful
- [ ] Define order invariants around payment state and status transitions
- [ ] Decide which payment fields truly belong inside order versus inside payments
- [ ] Add order-related domain events such as `OrderPlaced`
Progress: order use cases now use an order-specific application error, and order domain validation has been moved off `ApiError`.

## 7. Products and Categories

- [ ] Replace synchronous cleanup orchestration with an explicit collaboration model
- [ ] Decide whether category deletion should emit an event such as `CategoryDeleted`
- [ ] Add an ACL or translation layer if product/category module language diverges
- [ ] Replace misleading pass-through entity naming with proper mapper/read-model naming
- [ ] Revisit product stock/catalog rules and decide whether a richer aggregate is needed
Progress: product use cases now use a product-specific application error instead of `ApiError`, while product domain validation remains on `DomainValidationError`.
Progress: category deletion now uses category-specific application errors instead of `ApiError`.

## 8. Auth and Users

- [ ] Clarify whether auth owns credentials only or the whole user account record
- [ ] Clarify whether users owns profile behavior only
- [x] Replace repository-shaped cross-module access with a narrower application contract
- [ ] Introduce value objects or policies around password strength and email rules
Progress: auth password/email rules now live in an application policy, though dedicated value objects are still pending.
- [x] Reduce auth public API exports to the minimum needed by consumers
- Progress: auth token verification infrastructure now uses `AuthUnauthorizedError` instead of `ApiError`.
- Progress: users password-update validation and lookup failures now use user/domain-specific errors instead of `ApiError`.

## 9. Ports and Contracts

- [ ] Review every input port and output port for unnecessary breadth
- [ ] Define boundary DTOs where external/module contracts should not expose internal shapes
- [ ] Distinguish commands from queries in contracts where complexity justifies it
- [ ] Add adapter contract tests for repository ports
Progress: users repository contract coverage is now in place.
- [ ] Add adapter contract tests for gateway ports
Progress: Stripe gateway contract coverage is now in place.
- [ ] Add module public API contract tests
Progress: auth and products public API contract tests are now in place, including named-capability coverage for the auth public surface.

## 10. Mapping and Persistence Boundaries

- [ ] Replace pass-through record mappers with explicit persistence mapping
Progress: users, orders, and products record mappings are now explicit instead of pass-through.
- [ ] Ensure repositories return stable internal records or domain objects, not raw Mongoose documents
- [ ] Rename misleading mapper files that are not real entities
- [ ] Add explicit translation for gateway payloads where needed
- [ ] Prevent persistence schema details from leaking into application/domain code

## 11. Events and Cross-Module Workflows

- [ ] Define the first set of domain/application events
- [ ] Add `OrderPlaced`
- [ ] Add `PaymentConfirmed` or equivalent
- [ ] Add `CategoryDeleted` if event-driven cleanup is adopted
- [ ] Choose an in-process event bus approach for the modular monolith
- [ ] Add event handler tests
- [ ] Add cross-module workflow tests

## 12. Application Structure

- [ ] Introduce `commands/`, `queries/`, and `dto/` folders where they improve clarity
- [ ] Do not add structure mechanically; apply it first to modules with real workflow complexity
- [ ] Start with `orders`, `payments`, and `auth`

## 13. Shared Kernel

- [ ] Audit `shared/` for business logic that should belong to modules instead
- [ ] Keep `shared/` limited to generic primitives and technical utilities
- [ ] Avoid moving business rules into shared helpers
- [ ] Decide which primitives truly belong in a shared kernel versus module-local value objects
Progress: shared HTTP validation now uses a transport-specific `HttpValidationError` instead of `ApiError`.

## 14. Testing

- [ ] Keep the current unit-test baseline green
- [ ] Add contract tests for public APIs
- [ ] Add contract tests for ports/adapters
- [ ] Add integration tests for order/payment workflow
- [ ] Add integration tests for category/product workflow
- [ ] Add negative tests for boundary violations and invalid state transitions
- Progress: auth, categories, orders, payments, users, and products application/infrastructure error flows plus product/category/order domain validation behavior are now covered with focused unit tests, including HTTP and transport-validation error mapping.
- [ ] Add test coverage for event handlers once events exist

## 15. Documentation

- [ ] Keep the architecture overview aligned with the actual codebase
- Progress: `backend-ddd-hexagonal.md` now reflects the removal of module `index.js` surfaces, the optional nature of `public-api.js` and `bootstrap.js`, the retired shared `ApiError`, and the current `80 passing` test baseline.
- [ ] Update the gap analysis when major boundary changes land
- [ ] Document the auth/users ownership decision explicitly
- [ ] Document the event model once introduced
- [ ] Document module public APIs and allowed consumers

## Suggested Order

- [ ] First: narrow public APIs, clean domain errors, strengthen mapper boundaries
- [ ] Second: clarify auth/users ownership and deepen orders/payments modeling
- [ ] Third: introduce events, ACLs, and richer command/query separation
- [ ] Fourth: expand contract and workflow testing
