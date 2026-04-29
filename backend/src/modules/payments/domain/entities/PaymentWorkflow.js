/**
 * PaymentWorkflow Domain Entity.
 *
 * Fixed from original:
 *  - No longer accepts snake_case fields (payment_status). All normalization
 *    happens in the record mapper before reaching the domain.
 *  - Uses shared/domain/value-objects/PaymentStatus — not its own copy.
 *  - Immutable via Object.freeze().
 */
import { createPaymentStatus, PAYMENT_STATUSES }
  from "../../../../shared/domain/value-objects/PaymentStatus.js";
import { assertNonEmptyString }
  from "../../../../shared/kernel/assertions/index.js";
import { DomainValidationError }
  from "../../../../shared/domain/errors/index.js";

export const createPaymentWorkflow = ({
  _id,
  orderId,
  provider,
  workflowType,
  paymentStatus,
  sessionId,
  providerPaymentId,
  providerStatus,
  url,
  occurredAt,
}) => {
  assertNonEmptyString(orderId,      "orderId");
  assertNonEmptyString(provider,     "provider");
  assertNonEmptyString(workflowType, "workflowType");

  const status = createPaymentStatus(paymentStatus ?? PAYMENT_STATUSES.PENDING);

  return Object.freeze({
    _id,
    orderId,
    provider,
    workflowType,
    paymentStatus: status,
    sessionId:         sessionId         ?? null,
    providerPaymentId: providerPaymentId ?? null,
    providerStatus:    providerStatus    ?? null,
    url:               url               ?? null,
    occurredAt:        occurredAt        ?? new Date().toISOString(),

    applyStateChange({ paymentStatus: nextStatus, providerPaymentId: nextProviderPaymentId, providerStatus: nextProviderStatus }) {
      return createPaymentWorkflow({
        _id,
        orderId,
        provider,
        workflowType,
        paymentStatus:     nextStatus ?? status.value,
        sessionId,
        providerPaymentId: nextProviderPaymentId ?? providerPaymentId,
        providerStatus:    nextProviderStatus    ?? providerStatus,
        url,
        occurredAt: new Date().toISOString(),
      });
    },

    toPrimitives() {
      return {
        _id,
        orderId,
        provider,
        workflowType,
        paymentStatus:     status.toPrimitives(),
        sessionId,
        providerPaymentId,
        providerStatus,
        url,
        occurredAt,
      };
    },
  });
};
