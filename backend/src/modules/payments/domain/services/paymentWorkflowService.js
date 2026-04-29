/**
 * Payment Workflow Domain Service.
 * Orchestrates state transitions on PaymentWorkflow that span multiple steps.
 */
import { PAYMENT_STATUSES } from "../../../../shared/domain/value-objects/PaymentStatus.js";

/**
 * Applies an incoming webhook state change to the payment workflow.
 * Returns the updated workflow entity.
 */
export const applyWebhookStateChange = (paymentWorkflow, stateChange) => {
  if (!stateChange) return paymentWorkflow;

  return paymentWorkflow.applyStateChange({
    paymentStatus:     stateChange.paymentStatus,
    providerPaymentId: stateChange.providerPaymentId,
    providerStatus:    stateChange.providerStatus,
  });
};

/**
 * Determines whether a payment event should be published based on
 * the new payment status. Prevents publishing duplicate events for
 * already-terminal states.
 */
export const shouldPublishPaymentEvent = (paymentStatus) =>
  [PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.EXPIRED].includes(
    paymentStatus
  );
