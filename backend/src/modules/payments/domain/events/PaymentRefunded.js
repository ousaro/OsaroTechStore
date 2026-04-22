import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createPaymentRefundedEvent = (paymentStateChange) => {
  if (!paymentStateChange || typeof paymentStateChange !== "object") {
    throw new DomainValidationError("payment state change is required to create PaymentRefunded");
  }

  const sessionId = paymentStateChange.sessionId ?? paymentStateChange.id;
  const paymentReference = paymentStateChange.paymentReference ?? sessionId;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new DomainValidationError("session id is required to create PaymentRefunded");
  }

  return Object.freeze({
    type: "PaymentRefunded",
    payload: {
      paymentReference,
      sessionId,
      paymentStatus: "refunded",
      eventId: paymentStateChange.eventId,
    },
  });
};
