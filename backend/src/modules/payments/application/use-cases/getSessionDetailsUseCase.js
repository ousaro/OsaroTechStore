import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";

export const buildGetSessionDetailsUseCase = ({ paymentGateway }) => {
  assertPaymentGatewayPort(paymentGateway);
  return async ({ sessionId }) => {
    return paymentGateway.getCheckoutSession(sessionId);
  };
};
