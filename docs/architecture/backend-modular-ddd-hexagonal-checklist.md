# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist turns the architecture gaps into concrete implementation work.

Use it as a working migration list, not as a one-shot rewrite plan.

## 1. Module Boundaries

- [x] Define allowed import rules between modules
- [x] Enforce that cross-module imports go only through `public-api.js`
- Progress: architecture test coverage now enforces that module files may only cross into another module through that module's `public-api.js`.
- [x] Stop exporting full input ports from `public-api.js` unless absolutely necessary
- [x] Replace broad public exports with capability-specific functions
Progress: auth public API now exposes named account capabilities instead of one broad `userAccounts` object.
Progress: empty `public-api.js` placeholders with no consumers have now been removed from users, payments, orders, and categories so only modules with actual cross-module capabilities keep that surface.
- [x] Keep `composition.js` private to each module
- Progress: auth composition no longer exports its input port because that wiring is now kept internal to the module.
- Progress: users, products, categories, orders, and payments compositions also now keep their input ports private because that wiring is only used internally by module HTTP adapters.
- Progress: controller tests now use adapter-local HTTP handler surfaces, so `composition.js` is only imported by module-local `public-api.js`, `bootstrap.js`, and `infrastructure/http/httpHandlers.js` files.
- [x] Keep `index.js` local to module adapters and bootstrap only
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
- [x] Decide whether `auth` and `users` remain separate bounded contexts or merge conceptually into one
- [x] Document the ownership boundary between identity/auth data and profile/user data
- Progress: the architecture docs now make the current decision explicit: `auth` remains the owner of credential-bearing account identity data, while `users` remains a separate module that owns profile-facing and admin-facing behavior over those accounts.

## 2. Composition Root

- [x] Define one clear application composition root
- Progress: `app/startApplication.js` is now the explicit runtime bootstrap that connects infrastructure, creates the app, starts runtime hooks, and begins listening.
- [x] Move runtime startup concerns into explicit bootstrap wiring
- Progress: product scheduler startup is now imported through a dedicated module bootstrap file instead of the broader module index surface.
- [x] Review scheduler startup ownership and decide whether it belongs in app bootstrap or infrastructure bootstrap
- Progress: scheduler startup now runs from the application bootstrap path, making it an explicit app-level runtime concern instead of an ad hoc server detail.
- [x] Ensure route adapters do not depend on broad module entrypoints when a narrower local import is enough
- Progress: all module HTTP routes now import handlers through module-local `infrastructure/http/httpHandlers.js` files instead of reaching directly into `composition.js`.

## 3. Domain Purity

- [x] Remove HTTP-oriented error handling from domain objects
- Progress: auth, products, categories, orders, and users no longer throw HTTP-shaped `ApiError` from their domain factories/entities.
- [x] Replace `ApiError` usage in domain code with domain/application-specific errors
- Progress: `AuthValidationError`, `AuthConflictError`, `AuthUnauthorizedError`, `CategoryValidationError`, `CategoryNotFoundError`, `OrderNotFoundError`, `PaymentValidationError`, `PaymentWebhookError`, `ProductNotFoundError`, `UserNotFoundError`, `UserValidationError`, and `DomainValidationError` are now in use across the auth, categories, orders, payments, users, products, and shared validation flows.
- Progress: the legacy shared `ApiError` class has now been removed because no runtime code depends on it anymore.
- [x] Map domain/application errors to HTTP responses only in transport adapters
- Progress: shared HTTP error resolution now maps auth, category, order, payment, product, user, domain-validation, and transport-validation errors in `errorMiddleware` and `createRequireAuthMiddleware`.
- [x] Remove direct framework/library validation dependencies from domain objects where possible
- Progress: auth email/password validation no longer depends on `validator` inside the domain layer.
- [x] Wrap external validation rules behind policies or application-layer validation when appropriate
- Progress: auth credential validation now runs through an application policy instead of the domain command object.

## 4. Rich Domain Modeling

- [x] Introduce value objects where business language matters
- Progress: orders now use an `Address` value object while still exposing stable persistence primitives through `toPrimitives()`.
- Progress: auth now uses an `Email` value object to validate and normalize email addresses before commands and repository lookups.
- Progress: orders now use a `Money` value object for `totalPrice` while still exposing numeric primitives through `toPrimitives()`.
- Progress: orders now use `OrderStatus` and `PaymentStatus` value objects while still exposing stable string primitives through `toPrimitives()`.
- [x] Add `Email` value object
- [x] Add `Money` value object
- [x] Add `Address` value object for orders
- [x] Add `OrderStatus` value object or state model
- [x] Add `PaymentStatus` value object or state model
- [x] Add explicit order lifecycle transitions instead of only patch builders
- Progress: order status changes now flow through explicit lifecycle transition rules in the domain instead of being patched blindly.
- [x] Identify which modules need true aggregates instead of thin entities
- Progress: the architecture docs now make the current aggregate candidates explicit: `orders` is the clearest aggregate candidate, `products` is the next likely one if stock/catalog rules deepen, and `payments` should only become an aggregate if payment state becomes persisted and lifecycle-driven.
- [x] Add domain services only where rules span multiple entities/value objects
- Progress: orders now uses a dedicated lifecycle domain service to coordinate current-order state, order-status transitions, and payment-status invariants before building an update patch.

## 5. Payments Module

- [x] Define the actual payment domain model
- Progress: payments now has explicit checkout-item and payment-session domain objects instead of only inline validation plus gateway pass-through.
 [x] Decide whether payments need their own persistence model/table/collection
- Progress: the architecture docs now make the direction explicit: `payments` should own its own persistence model once webhook state, idempotency, and order collaboration are implemented, even though the current code still behaves as a Stripe-backed pass-through.
- [x] Persist payment state instead of treating payments as a pure gateway pass-through
- [x] Model checkout session creation as a business workflow, not only a gateway call
- [x] Model webhook outcomes as business events or state transitions
- Progress: payments now persists checkout-session state through a payment repository, creates sessions through a workflow service instead of returning raw gateway output directly, and maps relevant Stripe webhook events into persisted payment-status transitions.
- [x] Decide how payments update orders
- [x] Prefer event-driven collaboration between orders and payments
- Progress: the architecture docs now make the direction explicit: payments should publish payment outcome events and orders should react inside the orders module, rather than letting payments write directly into order persistence.
- [x] Add idempotency handling for webhook processing
- Progress: webhook state changes now use Stripe event ids as idempotency keys, and the payment repository only applies a given webhook event to persisted payment state once.
- [x] Add tests for webhook-driven state changes
- Progress: payment-domain and payment-use-case tests now cover checkout-session workflow creation plus webhook-driven paid/no-op state changes.
Progress: payment input validation and webhook transport failure now use payment-specific application errors instead of `ApiError`.
- [x] if we change the payment method the payment logic should work fine
- Progress: provider-specific webhook event translation now lives inside the Stripe gateway adapter, so the payments application layer only sees provider-neutral payment state changes instead of Stripe event semantics.

## 6. Orders Module

- [x] Move order state changes toward explicit behaviors instead of generic patch updates
- Progress: order lifecycle changes now route through named domain behaviors such as `markOrderAsPaid`, `startOrderProcessing`, `shipOrder`, `deliverOrder`, and `cancelOrder` instead of relying only on generic target-status patching.
- [x] Separate create/update commands from read queries where useful
- Progress: orders now separates read handlers (`getAllOrders`, `getOrderById`) from write handlers (`addOrder`, `updateOrder`, `deleteOrder`) through distinct query and command input ports.
- [x] Define order invariants around payment state and status transitions
- Progress: the order lifecycle service now enforces that paid and fulfillment statuses require an effective `paymentStatus` of `paid`, instead of allowing status and payment state to drift independently.
- [x] Decide which payment fields truly belong inside order versus inside payments
- Progress: the architecture docs now make the target split explicit: orders should keep fulfillment-relevant payment status, payment method, and a stable payment reference, while payments should own provider transaction ids, webhook/idempotency data, and provider-specific payment details.
- [x] Add order-related domain events such as `OrderPlaced`
- Progress: orders now defines an explicit `OrderPlaced` domain event, and the order-creation use case can publish it through an `orderEventPublisher` port without hard-wiring a concrete event bus yet.
Progress: order use cases now use an order-specific application error, and order domain validation has been moved off `ApiError`.

## 7. Products and Categories

- [x] Replace synchronous cleanup orchestration with an explicit collaboration model
- [x] Decide whether category deletion should emit an event such as `CategoryDeleted`
- Progress: category deletion now publishes an explicit `CategoryDeleted` domain event through a category event publisher port, and the current composition root wires that event to product cleanup without making the category use case call product cleanup directly.
- [x] Add an ACL or translation layer if product/category module language diverges
- Progress: category/product collaboration now goes through an explicit translator that maps `CategoryDeleted` events onto the products module cleanup capability, instead of keeping that mapping inline in the composition root.
- [x] Replace misleading pass-through entity naming with proper mapper/read-model naming
- Progress: categories no longer use the misleading `CategoryEntity` pass-through name; the repository now maps through `categoryRecordMapper.js`.
- [x] Revisit product stock/catalog rules and decide whether a richer aggregate is needed
- Progress: the architecture docs now make the decision explicit: products does not need a richer aggregate root yet because its current rules are still limited to validation, stock non-negativity, and price/discount recalculation.
Progress: product use cases now use a product-specific application error instead of `ApiError`, while product domain validation remains on `DomainValidationError`.
Progress: category deletion now uses category-specific application errors instead of `ApiError`.

## 8. Auth and Users

- [x] Clarify whether auth owns credentials only or the whole user account record
- [x] Clarify whether users owns profile behavior only
- [x] Replace repository-shaped cross-module access with a narrower application contract
- Progress: the auth/users seam now uses account-management capabilities such as `listManagedUserAccounts`, `getManagedUserAccount`, `updateManagedUserAccountProfile`, and `removeManagedUserAccount` instead of repository-shaped `find/get/update/delete by id` naming.
- Progress: users now treats the auth dependency as an explicit `authAccountAccess` output port instead of four loose imported functions.
- Progress: the documented ownership split is now explicit: auth owns the account record and credentials, while users currently owns profile/admin behavior over that auth-owned record rather than separate persistence.
- [x] Introduce value objects or policies around password strength and email rules
Progress: auth password/email rules now live in an application policy, though dedicated value objects are still pending.
- [x] Reduce auth public API exports to the minimum needed by consumers
- Progress: auth token verification infrastructure now uses `AuthUnauthorizedError` instead of `ApiError`.
- Progress: users password-update validation and lookup failures now use user/domain-specific errors instead of `ApiError`.

## 9. Ports and Contracts

- [x] Review every input port and output port for unnecessary breadth
- Progress: `productsInputPort` now only contains the HTTP-facing product use cases; category cleanup and scheduler refresh stay on narrower public/bootstrap paths instead of inflating the controller port.
- Progress: after a full port sweep, the remaining input and output ports are now aligned with their current adapter responsibilities rather than carrying obviously unrelated capabilities.
- [x] Define boundary DTOs where external/module contracts should not expose internal shapes
- Progress: the Stripe checkout-session gateway contract now returns a normalized `paymentStatus` field instead of leaking Stripe's raw `payment_status` shape.
- [x] Distinguish commands from queries in contracts where complexity justifies it
- Progress: payments now separates command work (`createPaymentIntent`, `verifyWebhook`) from query work (`getSessionDetails`) through distinct input port contracts.
- [x] Add adapter contract tests for repository ports
Progress: users repository contract coverage is now in place.
- Progress: the users repository adapter now validates its auth dependency through an explicit `authAccountAccess` port contract.
- Progress: category deletion now validates its event-publisher dependency through an explicit `categoryEventPublisher` port contract.
- Progress: auth, categories, orders, and products now also have focused repository adapter contract tests.
- [x] Add adapter contract tests for gateway ports
Progress: Stripe gateway contract coverage is now in place.
- [x] Add module public API contract tests
Progress: auth and products public API contract tests are now in place, including named-capability coverage for the auth public surface.

## 10. Mapping and Persistence Boundaries

- [x] Replace pass-through record mappers with explicit persistence mapping
Progress: users, orders, products, categories, and payments record mappings are now explicit instead of pass-through.
- [x] Ensure repositories return stable internal records or domain objects, not raw Mongoose documents
- Progress: the auth repository now maps Mongoose results into stable auth-user records too, so the main repositories no longer expose raw Mongoose documents across module/application boundaries.
- [x] Rename misleading mapper files that are not real entities
- [x] Add explicit translation for gateway payloads where needed
- Progress: payments no longer uses the generic `checkoutSessionMapper.js` name for Stripe payload translation; `stripePayloadTranslator.js` now makes the gateway-specific DTO and webhook state-change translation explicit.
- [x] Prevent persistence schema details from leaking into application/domain code
- Progress: product application logic no longer reads the persistence-specific `createdAt` field directly; the repository now exposes a business-shaped `listedAt` field for new-product status decisions instead.

## 11. Events and Cross-Module Workflows

- [x] Define the first set of domain/application events
- [x] Add `OrderPlaced`
- [x] Add `PaymentConfirmed` or equivalent
- Progress: the first concrete event set is now in place around `OrderPlaced`, `PaymentConfirmed`, and `CategoryDeleted`, with order/payment use cases able to publish those events through explicit publisher ports without coupling to a concrete event bus yet.
- [x] Add `CategoryDeleted` if event-driven cleanup is adopted
- [x] Choose an in-process event bus approach for the modular monolith
- [x] Add event handler tests
- Progress: the modular monolith now uses a shared in-process application event bus, and `CategoryDeleted` product-cleanup handling is exercised through an event-handler integration test instead of only direct translator tests.
- [x] Add cross-module workflow tests
- Progress: category deletion now has a cross-module workflow test that exercises the real path from the categories use case through the shared event bus into product cleanup translation.

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
