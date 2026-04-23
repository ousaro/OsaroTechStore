# Backend Modular DDD + Hexagonal Gap Analysis

## Purpose

This document records the remaining architecture gaps in `backend/src` after re-checking the current codebase against `guide.md`.

It now reflects the backend after the workflow-registry, order/payment collaboration, output-read-model, and adapter-boundary work that has already landed.

Verified baseline for this analysis:

- modules exist for `auth`, `users`, `products`, `categories`, `orders`, and `payments`
- cross-module imports are restricted to `public-api.js`
- module implementation folders now use `adapters/`
- config now lives under `src/infrastructure/config`
- the application boot path registers workflows centrally through `app/registerApplicationWorkflows.js`
- `CategoryDeleted`, `OrderPlaced`, `PaymentConfirmed`, `PaymentFailed`, `PaymentExpired`, and `PaymentRefunded` are all part of the current application workflow model
- orders and payments now collaborate through a stable `paymentReference`
- explicit read models/DTOs exist for users, orders, payments, products, and categories

## Current Assessment

The backend is no longer best described as “halfway to hexagonal”.

It is now a real modular monolith with:

- module-local application/domain/ports/adapters structure
- a central application workflow registry
- event-driven cross-module collaboration for category cleanup and payment/order synchronization
- stronger output boundaries
- narrower public APIs
- better separation between profile and credential collaboration in the auth/users seam

The remaining work is now residual architecture tightening, not a large reconstruction.

## 1. Auth and Users Boundary Decision

The `auth`/`users` boundary is much cleaner than before:

- `users` now collaborates through explicit profile and credential capabilities
- profile updates reject credential fields
- profile payloads are validated and sanitized at the port boundary
- `users` returns read models without passwords

The remaining issue was ownership depth. That decision is now explicit.

Current intended model:

- `auth` still owns the underlying account persistence
- `users` owns profile-facing behavior and profile update rules
- `users` intentionally does not own a separate persistence model right now

This is no longer a contract-shape problem. It is a deliberate bounded-context split:

- keep `users` as a profile facade over auth-owned accounts
- keep profile behavior, validation, read-model shaping, and admin-facing profile operations in `users`
- keep credential storage, authentication, and account persistence ownership in `auth`

Why this is the chosen direction today:

- there is no second persistence model for users yet
- the current use cases are profile-oriented, not identity-provider orchestration
- the cross-module contract is now narrow enough that `users` can evolve its behavior without leaking credential concerns back out

This means the current seam is valid and intentional, not transitional.

Future reconsideration trigger:

- introduce separate users-owned persistence only if product requirements demand profile data with an independent lifecycle, storage model, or synchronization boundary that auth should no longer own

## 2. Legacy Payment/Order Compatibility Paths Still Exist

The new `paymentReference` boundary is in place and is the correct architecture.

However, the code still carries compatibility bridges for older payloads and records:

- order creation still derives `paymentReference` from legacy `transactionId` and `paymentDetails`
- the order repository still falls back to `transactionId` in one lookup path
- order mapping still tolerates legacy record shapes during translation
- immutable-field policy still knows about `transactionId` and `paymentDetails`

These are reasonable migration safeguards, but they are now legacy residue rather than target architecture.

The remaining work is to remove those fallbacks once old clients and old persisted records no longer need them.

## 3. Payments Language Is Broader, but Some Naming Is Still Session-Specific

The payments module has moved beyond a thin checkout-session pass-through:

- payment persistence now includes `paymentReference`, `orderId`, provider fields, lifecycle timestamps, and idempotency data
- read models are provider-neutral
- webhook outcomes publish distinct payment state-change events
- the module now links orders and payments through workflow events

The remaining inconsistency is naming:

- the internal query/use-case and HTTP route names still speak in `session` terms because the current external flow is still redirect-session based

That does not break the architecture, but it does leave one thin transport/application seam speaking in narrower terms than the broader domain model.

## 4. Payment Workflow Extensibility Is Prepared, but Still Single-Workflow

The payment model is now more provider-neutral than before:

- workflow records carry provider-neutral status and references
- event payloads are correlation-safe
- transport and read models avoid leaking Stripe internals

What is still intentionally narrow:

- `workflowType` currently only allows `redirect_session`
- the current domain still assumes a redirect-based checkout workflow

That is acceptable today because the system only implements one payment workflow.

The remaining architectural question is not urgent implementation, but readiness:

- when a second payment provider or non-redirect workflow is introduced, the module should expand the workflow-type model deliberately rather than reintroducing provider-specific assumptions ad hoc

## 5. Structural Cleanup Is Mostly Done, with Small Residue in Terminology

The larger structural cleanup is complete:

- empty placeholder folders are gone
- `infrastructure/` was renamed to `adapters/`
- central config moved to a global infrastructure location

The remaining cleanup is mostly terminology consistency in externally visible payment route/query naming.

## 6. Testing Is Strong, but It Must Keep Guarding the New Boundaries

The test suite now covers much more of the architecture directly:

- workflow-registry subscriptions
- cross-module workflow routing
- order/payment synchronization paths
- output shaping for users, orders, payments, products, and categories
- event contracts
- command/query repository-port helpers

The main testing risk now is drift, not absence.

Important boundaries that should stay protected:

- auth/users profile vs credential separation
- `paymentReference` as the stable correlation key
- read-model/DTO shaping that keeps legacy or sensitive fields out of transport payloads
- application workflow registration staying centralized

## Priority Order

The remaining architecture work should be tackled in this order:

1. make the long-term `auth`/`users` ownership decision explicit
2. remove legacy `transactionId`/`paymentDetails` compatibility paths once they are no longer needed
3. align payment workflow naming with the broader payment-workflow model
4. expand workflow-type abstractions only when a second provider or payment workflow actually arrives
