import { createPaymentWorkflow } from "../entities/PaymentWorkflow.js";

export const createRedirectPaymentWorkflow = ({ gatewayPayment }) => {
  return createPaymentWorkflow({
    ...gatewayPayment,
    paymentStatus: gatewayPayment.paymentStatus ?? "pending",
  });
};
