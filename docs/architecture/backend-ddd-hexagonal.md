# Backend Modular DDD + Hexagonal Gap Analysis

## Purpose

This document records only the architecture gaps that still remain in `backend/src` after re-checking the current codebase against `guide.md`.

It intentionally excludes work that is already implemented.

## Verified Current State

The backend now has these architectural pieces in place:

- module-local `application`, `domain`, `ports`, and `adapters` structure
- module boundary enforcement through `public-api.js`
- centralized workflow registration in `app/registerApplicationWorkflows.js`
- event-driven cross-module collaboration for category cleanup and payment/order synchronization
- explicit read models and DTOs for users, orders, payments, products, and categories
- a stable `paymentReference` seam between orders and payments
- profile/credential separation in the `auth`/`users` collaboration contract
- renamed payment-workflow terminology in the payments domain (`PaymentWorkflow`, `paymentWorkflowService`)

The backend is no longer in broad architectural reconstruction. The remaining debt is narrow and migration-oriented.

## Remaining Gaps

There are no currently identified architecture gaps in `backend/src` that still require implementation work.

The target order/payment boundary is already in place:

- orders own fulfillment-relevant payment state
- payments own provider workflow state and payment lifecycle details
- cross-module correlation happens through `paymentReference`
- legacy `transactionId` / `paymentDetails` compatibility fallbacks have been removed from the active order boundary

At this point, the backend is in a maintenance state rather than an architecture-gap state.

## Future Note, Not Current Debt

The payments module still supports only one workflow type, `redirect_session`.

That is acceptable today because the codebase only implements one payment flow. Expanding to another workflow such as `direct_payment` should happen deliberately when that flow is actually introduced, not before.
