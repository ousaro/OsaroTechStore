# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist contains only the remaining architecture work.

Completed items and historical progress notes have been removed on purpose.

## 1. Composition and Wiring

- [x] Introduce one application-level workflow/composition registry for cross-module subscriptions and translators
- [x] Move `CategoryDeleted` subscription wiring out of `modules/categories/composition.js` and into that central workflow registry
- [ ] Register all future `OrderPlaced` and `PaymentConfirmed` subscribers from the same central place
- [x] Keep module `composition.js` files focused on module-local wiring only
- [x] Remove empty structural folders that no longer represent real design decisions

## 2. Orders and Payments Boundary

- [x] Add a stable order-to-payment correlation model that both modules can use without sharing provider-specific identifiers
- [ ] Introduce a payments-owned reference that orders can store instead of treating `transactionId` as a provider identity field
- [ ] Make `payments` persist enough business state to drive order collaboration
- [ ] Extend payment persistence with order linkage, provider reference(s), lifecycle timestamps, and any provider transaction identifiers that belong to payments
- [ ] Move provider-specific payment detail ownership out of `orders`
- [ ] Remove or shrink `paymentDetails` from the order model
- [ ] Reduce `transactionId` in orders to a stable order-facing payment reference, or replace it entirely with a clearer field
- [ ] Define exactly which payment fields remain inside orders because fulfillment logic truly depends on them

## 3. Payment Workflow Completion

- [x] Add an order-side subscriber for `PaymentConfirmed`
- [x] Make the order-side subscriber update order state through order application/domain logic, not direct persistence writes from payments
- [x] Define what should happen when a payment is confirmed but the correlated order cannot be found
- [ ] Decide how failed, expired, and refunded payment events should affect order state
- [ ] Add provider-neutral application events for the other payment outcomes the business cares about
- [ ] Decide whether `OrderPlaced` should start payment initialization or other downstream workflows
- [x] Add at least one real runtime consumer for `OrderPlaced`, or remove/defer the event until the workflow exists

## 4. Order Modeling

- [ ] Replace the raw `products` array in orders with a clearer order-line concept if order invariants will continue to grow
- [ ] Define which order fields are immutable after placement and enforce that in the domain/application layer
- [ ] Move more order updates from generic patch construction toward explicit behaviors where the business language is stable
- [ ] Reassess whether `paymentMethod` belongs in the order aggregate as intent, in payments as execution detail, or split across both
- [ ] Tighten the order model around fulfillment state versus payment state ownership

## 5. Auth and Users Boundary

- [ ] Decide whether `users` will own a true profile model or remain a facade over auth-owned account records
- [ ] If `users` remains separate, introduce a real users-owned model and collaboration flow instead of delegated account data access
- [ ] If `users` will not gain a distinct model, document and execute a conceptual merge path with `auth`
- [ ] Replace auth-managed account access functions with a clearer collaboration contract if the modules stay separate
- [ ] Separate credential concerns from profile/admin concerns more explicitly in the cross-module payloads

## 6. Output Boundaries and DTOs

- [ ] Stop returning repository-shaped records directly from use cases where external consumers need a stable API contract
- [ ] Introduce explicit output DTOs or read models for `users`
- [ ] Remove `password` from all user-facing and admin-facing response shapes
- [ ] Introduce explicit output DTOs or read models for `orders`
- [ ] Introduce explicit output DTOs or read models for `payments`
- [ ] Revisit `products` output shaping and decide which fields are transport concerns versus internal records
- [ ] Restore or intentionally remove `description` from category repository/application output so the category boundary is internally consistent
- [ ] Add transport-level tests that prove sensitive/internal fields do not leak

## 7. Ports and Contracts

- [ ] Strengthen the auth/users contract so it describes behavior and payloads, not just callable method names
- [ ] Strengthen event publication/consumption contracts around payload schema and correlation requirements
- [ ] Review repository ports for places where command/query responsibilities should be clearer
- [ ] Add explicit DTO contracts at module boundaries where raw record shapes are still doing double duty
- [ ] Decide where lightweight runtime assertions are sufficient and where richer contract tests should become mandatory

## 8. Payments Provider Flexibility

- [ ] Separate provider-agnostic payment workflow concepts from Stripe-specific redirect-session assumptions
- [ ] Define which payment application concepts must survive a provider change without changing the rest of the backend
- [ ] Expand the payment persistence model so it can represent more than the current Stripe checkout-session lifecycle if needed
- [ ] Decide whether the current `PaymentSession` concept should evolve into a broader payment aggregate or remain a narrower workflow record

## 9. Structural Cleanup

- [ ] Remove `application/use-cases` folders that are now unused in modules that standardized on `commands/` and `queries/`
- [ ] Remove `domain/ports` in `orders` if it is not part of an active design direction
- [ ] Keep folder conventions aligned with actual module complexity instead of preserving placeholders

## 10. structure

- [ ] the config should be under the global /infrastructure
- [ ] the infrastructre folder in each module should be named adapters because it is and implementation
