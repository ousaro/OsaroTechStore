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

## Remaining Gap: Legacy Payment Compatibility Residue

The target order/payment boundary is already in place:

- orders own fulfillment-relevant payment state
- payments own provider workflow state and payment lifecycle details
- cross-module correlation happens through `paymentReference`

What remains is compatibility code for older payloads and older records:

- order creation still derives `paymentReference` from legacy `transactionId` and `paymentDetails`
- the order repository still falls back to `transactionId` in one lookup path
- order mapping still tolerates legacy record shapes during translation
- order update policy still treats `transactionId` and `paymentDetails` as known legacy fields

This is no longer design uncertainty. It is controlled migration residue.

## Why It Still Matters

As long as those fallbacks remain:

- the codebase still carries dual payment-language paths
- the order boundary is slightly less explicit than the target model
- future contributors can mistake legacy compatibility code for current domain rules

The transport and read-model boundaries already hide these legacy fields correctly, so the remaining issue is internal cleanup rather than API instability.

## What Should Happen Next

The next architecture cleanup step is straightforward:

1. remove legacy `transactionId` fallback handling from order creation when old clients no longer send it
2. remove legacy `paymentDetails` fallback handling from order creation when old clients no longer send it
3. remove `transactionId` fallback lookup support from the order repository once legacy records are migrated
4. remove remaining legacy payment-field references from order policy and mapping code when the migration window closes

## Future Note, Not Current Debt

The payments module still supports only one workflow type, `redirect_session`.

That is acceptable today because the codebase only implements one payment flow. Expanding to another workflow such as `direct_payment` should happen deliberately when that flow is actually introduced, not before.
