# Backend Modular DDD + Hexagonal Checklist

## Purpose

This checklist contains only the architecture work that still remains.

Completed items and already-resolved design decisions have been removed.

## Legacy Payment/Order Compatibility Cleanup

- [ ] Remove legacy `transactionId` fallback handling from order creation once old clients no longer depend on it
- [ ] Remove legacy `paymentDetails` fallback handling from order creation once old clients no longer depend on it
- [ ] Remove `transactionId` fallback lookup support from the order repository once old persisted records are migrated
- [ ] Remove legacy payment-field references from order policy and mapping code when the migration window is closed
