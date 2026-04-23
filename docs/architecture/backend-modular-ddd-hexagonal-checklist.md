# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist contains only the architecture work that still remains.

Completed items, historical progress notes, and now-implemented migration steps have been removed.

## 1. Auth and Users Boundary

- [x] Decide whether `users` is intentionally a profile facade over auth-owned accounts or whether it should eventually own separate persistence
- [x] If the facade model is the intended end state, document it clearly in the architecture docs as a deliberate bounded-context decision
- [x] If separate users-owned persistence is still the target, define the migration and synchronization strategy explicitly before adding more cross-module behavior

## 2. Legacy Payment/Order Compatibility Cleanup

- [x] Remove legacy `transactionId` fallback handling from order creation once old clients no longer depend on it
- [x] Remove legacy `paymentDetails` fallback handling from order creation once old clients no longer depend on it
- [x] Remove `transactionId` fallback lookup support from the order repository once old persisted records are migrated
- [x] Remove legacy payment-field references from order update-policy and mapping code when the migration window is closed

## 3. Payments Ubiquitous Language Cleanup

- [x] Rename `PaymentSession.js` so the file name matches the broader payment-workflow model
- [x] Rename `paymentSessionWorkflowService.js` so the service name matches the broader payment-workflow model
- [x] Rename any remaining session-specific builder names, such as `createCheckoutSessionWorkflow`, where the code now models a broader payment workflow

## 4. Payment Workflow Extensibility

- [x] Decide what the next supported `workflowType` should look like before adding another payment provider or non-redirect payment flow
- [x] Expand the payment-workflow type model deliberately when a second workflow is introduced, instead of reintroducing provider-specific assumptions piecemeal

## 5. Regression Protection

- [x] Keep regression tests aligned with current mapper/read-model contracts so architecture docs and test expectations do not drift apart again
