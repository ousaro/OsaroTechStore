# Backend Modular DDD + Hexagonal Gap Analysis

## Purpose

This document records the remaining architecture gaps in `backend/src` after reviewing the current backend against the modular DDD + hexagonal guide in `guide.md`.

It is intentionally focused on what is still missing, inconsistent, or worth tightening next.

Verified baseline for this analysis:

- modules exist for `auth`, `users`, `products`, `categories`, `orders`, and `payments`
- cross-module imports are restricted to `public-api.js`
- the runtime has a real bootstrap path through `app/createApp.js` and `app/startApplication.js`
- the codebase has an in-process event bus
- `npm test` in `backend/` passes with `139 passing`

## 1. Composition Root Is Still Split

The backend has a cleaner bootstrap than before, but the real application composition is still distributed across multiple places:

- `app/createApp.js` wires middleware and routes
- `app/startApplication.js` starts infrastructure and runtime hooks
- `modules/categories/composition.js` subscribes cross-module event handlers during module composition
- `modules/orders/composition.js` and `modules/payments/composition.js` publish events but do not own workflow subscribers

This means the system has a bootstrap path, but not yet a single explicit workflow/composition root for module collaboration.

Main consequences:

- cross-module event registration is hidden inside modules instead of being declared centrally
- it is harder to see all running workflows in one place
- adding more event-driven collaboration will increase coupling-by-wiring unless subscriptions move to an application-level workflow registry

## 2. Event-Driven Architecture Is Only Half Implemented

The event bus exists, but only one real cross-module workflow is wired end to end:

- `CategoryDeleted` -> translator -> `products.removeProductsByCategory`

Two other published events currently stop at publication:

- `OrderPlaced`
- `PaymentConfirmed`

There are no subscribers for them in the running application.

Main consequences:

- orders publish a domain event without any downstream business reaction
- payments publish a payment outcome event without updating order state
- the code has the shape of event-driven collaboration, but not the business workflow yet

The next event-driven gap is specifically `payments` -> `orders`:

- `payments` persists checkout-session state and publishes `PaymentConfirmed`
- `orders` still owns `paymentStatus`, `transactionId`, and `paymentDetails`
- no order-side handler consumes payment confirmation and applies order lifecycle rules

This is the most important unfinished modular workflow in the backend.

## 3. Orders and Payments Still Share the Wrong Responsibilities

The strongest remaining bounded-context problem is the order/payment seam.

Today `orders` still stores:

- `paymentMethod`
- `paymentStatus`
- `transactionId`
- `paymentDetails`

And `payments` stores only a thin payment session record:

- `sessionId`
- `url`
- `paymentStatus`
- `provider`
- `processedWebhookEventIds`

That creates an awkward split:

- order state still contains provider-facing payment detail
- payment state does not contain enough business correlation data to drive order updates
- payment persistence is durable enough for idempotency, but not rich enough for business ownership

Concrete missing pieces:

- a stable order-to-payment correlation field
- a payment reference owned by the payments module and referenced by orders
- payment records that can carry order linkage, provider transaction ids, provider references, and lifecycle timestamps
- a clear rule for which payment data is fulfillment-relevant in orders and which must live only in payments

Until that seam is finished, `orders` cannot become a clean aggregate boundary and `payments` remains a partially internalized gateway workflow.

## 4. Orders Are the Closest Aggregate, but the Model Is Still Too CRUD-Shaped

`orders` is the richest module today, but it still carries several signs of an unfinished aggregate:

- `createOrder` accepts a broad payload and persists raw `products`
- `createOrderUpdatePatch` is still patch-oriented rather than behavior-oriented for most fields
- `paymentDetails` is a free-form object
- the module has explicit lifecycle rules for status changes, but not a full order workflow boundary

What is still missing for a more complete aggregate:

- a richer order-line model instead of a raw `products` array
- a domain-level concept for payment reference instead of `transactionId`
- explicit behaviors for more than status transitions
- a clearer distinction between immutable order creation data and mutable fulfillment state

The current structure is good enough to support lifecycle rules, but not yet strong enough to be called a fully modeled order aggregate.

## 5. Auth and Users Are Still Separated by a Data-Access Facade, Not a True Collaboration Contract

The current `auth`/`users` split is explicit, but the boundary is still thin.

`users` depends on `auth/public-api.js` for:

- `listManagedUserAccounts`
- `getManagedUserAccount`
- `updateManagedUserAccountProfile`
- `removeManagedUserAccount`

Those names are better than raw repository verbs, but the behavior is still essentially delegated account data access.

Main consequences:

- `users` does not own a separate profile model
- `auth` still owns the record that `users` reads and updates
- the seam is application-shaped in naming, but persistence-shaped in substance

This module boundary still needs one of two architectural outcomes:

- introduce a real profile model owned by `users`, with explicit synchronization/collaboration rules
- or collapse `auth` and `users` conceptually if a separate bounded context is not going to emerge

Without that decision being completed in code, the separation remains organizational more than domain-driven.

## 6. Internal Records Still Leak Through Application and HTTP Boundaries

Several modules still expose internal repository records directly as application/transport responses.

The clearest remaining issues are:

- `users` record mapping includes `password`, and the users HTTP controller returns use-case payloads directly
- `categories` domain requires `description`, but `categoryRecordMapper.js` drops it entirely
- `orders`, `products`, and `payments` still return repository-shaped records instead of explicit response DTOs

This is both an architectural and boundary-design problem:

- response contracts are not clearly separated from persistence records
- read-model shaping is inconsistent across modules
- sensitive or irrelevant internal fields can leak too far upward

The backend needs clearer output DTO/read-model boundaries, especially for:

- `users`
- `orders`
- `payments`
- `categories`

## 7. Ports Are Narrower, but They Are Still Only Runtime Shape Checks

The current ports are useful as lightweight boundaries, but they remain minimal assertion helpers:

- they check that required methods exist
- they do not encode semantic guarantees
- they do not model request/response DTO contracts directly

This matters most at the higher-value seams:

- auth/users collaboration
- payments gateway integration
- event publication/consumption contracts
- repository read/write model boundaries

The architecture does not need heavy abstraction for its own sake, but it does need stronger contract definition where behavior, payload shape, and ownership matter.

## 8. Payments Are Provider-Neutral at the Edge, but Not Yet Provider-Replaceable End to End

The Stripe adapter is correctly isolated, and webhook translation is provider-neutral at the application boundary.

The remaining gap is deeper than translation:

- checkout session creation still assumes Stripe-style redirect checkout
- payment persistence has no provider capability metadata beyond `provider: "stripe"`
- the domain model is still a payment-session model, not a broader payment workflow model

So the architecture is better prepared for provider replacement than before, but not yet designed for a second payment provider without reshaping the application workflow and persistence model.

## 9. Module Structure Has Some Mechanical Residue

There are still empty structure folders:

- `modules/auth/application/use-cases`
- `modules/orders/application/use-cases`
- `modules/orders/domain/ports`
- `modules/payments/application/use-cases`

This is small compared with the workflow gaps above, but it is a real signal:

- some folder conventions are now historical rather than meaningful
- structure is slightly ahead of the actual design in a few places

That should be cleaned up so the module layout continues to communicate intent accurately.

## 10. Testing Is Strong on Units and Contracts, but Thin on Running Workflows

The current backend test suite gives a good foundation:

- domain tests exist for the richer modules
- repository/gateway contract tests exist
- the event bus is tested
- the category-to-product workflow is tested
- application bootstrap and webhook raw-body handling are tested

Remaining testing gaps map directly to the architecture gaps:

- no end-to-end workflow test for payment confirmation updating orders
- no integration test for `OrderPlaced` subscribers because there are no subscribers yet
- limited HTTP adapter coverage outside specific controller tests
- no tests protecting output DTO/read-model sanitization for users and other modules
- no composition-root test that verifies all application event subscriptions are registered in one place

## 11. Priority Order for the Next Architectural Work

If the goal is to strengthen the architecture without rewriting the backend, the next sequence should be:

1. finish the `payments` -> `orders` collaboration with a stable correlation model and order-side event handling
2. remove payment-provider detail from the order model and move it into payments-owned records
3. fix output-boundary shaping so internal repository records stop leaking to controllers and clients
4. decide whether `users` becomes a true profile module or is conceptually merged with `auth`
5. centralize cross-module event subscriptions in an application-level workflow/composition registry
6. clean up leftover mechanical structure and tighten ports where semantics matter
