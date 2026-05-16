import { PAYMENT_STATUSES } from "../../../../shared/domain/value-objects/PaymentStatus.js";

export const applyWebhookStateChange = (paymentWorkflow, stateChange) => {
  if (!stateChange) return paymentWorkflow;

  return paymentWorkflow.applyStateChange({
    paymentStatus: stateChange.paymentStatus,
    providerPaymentId: stateChange.providerPaymentId,
    providerStatus: stateChange.providerStatus,
  });
};

export const shouldPublishPaymentEvent = (paymentStatus) =>
  [PAYMENT_STATUSES.PAID, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.EXPIRED].includes(
    paymentStatus
  );
