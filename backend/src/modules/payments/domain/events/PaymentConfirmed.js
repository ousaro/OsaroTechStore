import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createPaymentConfirmedEvent = (paymentStateChange) => {
  if (!paymentStateChange || typeof paymentStateChange !== "object") {
    throw new DomainValidationError("payment state change is required to create PaymentConfirmed");
  }

  const sessionId = paymentStateChange.sessionId ?? paymentStateChange.id;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new DomainValidationError("session id is required to create PaymentConfirmed");
  }

  return Object.freeze({
    type: "PaymentConfirmed",
    payload: {
      sessionId,
      paymentStatus: paymentStateChange.paymentStatus,
      eventId: paymentStateChange.eventId,
    },
  });
};
