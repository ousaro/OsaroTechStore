/**
 * Payment Domain Events.
 * All use the shared envelope — id, type, occurredAt, version are automatic.
 * These events are consumed by the Orders module's collaboration translator.
 */
import { createDomainEvent } from "../../../../shared/domain/events/createDomainEvent.js";

export const createPaymentConfirmedEvent = (payment) =>
  createDomainEvent("PaymentConfirmed", {
    paymentId: payment._id,
    orderId:   payment.orderId,
    provider:  payment.provider,
  });

export const createPaymentFailedEvent = (payment) =>
  createDomainEvent("PaymentFailed", {
    paymentId: payment._id,
    orderId:   payment.orderId,
    provider:  payment.provider,
  });

export const createPaymentExpiredEvent = (payment) =>
  createDomainEvent("PaymentExpired", {
    paymentId: payment._id,
    orderId:   payment.orderId,
    provider:  payment.provider,
  });

export const createPaymentStateChangedEvent = (payment) => {
  const { paymentStatus } = payment.toPrimitives();

  const typeMap = {
    paid:    "PaymentConfirmed",
    failed:  "PaymentFailed",
    expired: "PaymentExpired",
  };

  const type = typeMap[paymentStatus] ?? "PaymentStateChanged";

  return createDomainEvent(type, {
    paymentId:     payment._id,
    orderId:       payment.orderId,
    provider:      payment.provider,
    paymentStatus,
  });
};
