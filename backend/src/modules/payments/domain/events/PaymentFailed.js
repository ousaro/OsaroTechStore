import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createPaymentFailedEvent = (paymentStateChange) => {
  if (!paymentStateChange || typeof paymentStateChange !== "object") {
    throw new DomainValidationError("payment state change is required to create PaymentFailed");
  }

  const sessionId = paymentStateChange.sessionId ?? paymentStateChange.id;
  const paymentReference = paymentStateChange.paymentReference ?? sessionId;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new DomainValidationError("session id is required to create PaymentFailed");
  }

  return Object.freeze({
    type: "PaymentFailed",
    payload: {
      paymentReference,
      sessionId,
      paymentStatus: "failed",
      eventId: paymentStateChange.eventId,
    },
  });
};
