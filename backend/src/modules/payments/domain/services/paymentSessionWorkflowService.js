import { createPaymentSession } from "../entities/PaymentSession.js";

const WEBHOOK_PAYMENT_STATUS_BY_EVENT_TYPE = {
  "checkout.session.completed": "paid",
  "checkout.session.async_payment_failed": "failed",
  "checkout.session.expired": "failed",
};

export const createCheckoutSessionWorkflow = ({ gatewaySession }) => {
  return createPaymentSession({
    ...gatewaySession,
    paymentStatus: gatewaySession.paymentStatus ?? "pending",
  });
};

export const resolvePaymentWebhookStateChange = (event) => {
  const nextPaymentStatus = WEBHOOK_PAYMENT_STATUS_BY_EVENT_TYPE[event?.type];
  const sessionId = event?.data?.object?.id;

  if (!nextPaymentStatus || typeof sessionId !== "string" || sessionId.trim() === "") {
    return null;
  }

  return createPaymentSession({
    id: sessionId,
    paymentStatus: nextPaymentStatus,
  });
};
