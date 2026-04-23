import { createPaymentWorkflow } from "../entities/PaymentSession.js";

export const createRedirectPaymentWorkflow = ({ gatewayPayment }) => {
  return createPaymentWorkflow({
    ...gatewayPayment,
    paymentStatus: gatewayPayment.paymentStatus ?? "pending",
  });
};

export const createCheckoutSessionWorkflow = ({ gatewaySession }) =>
  createRedirectPaymentWorkflow({ gatewayPayment: gatewaySession });
