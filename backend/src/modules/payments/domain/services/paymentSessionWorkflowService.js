import { createPaymentSession } from "../entities/PaymentSession.js";

export const createCheckoutSessionWorkflow = ({ gatewaySession }) => {
  return createPaymentSession({
    ...gatewaySession,
    paymentStatus: gatewaySession.paymentStatus ?? "pending",
  });
};
