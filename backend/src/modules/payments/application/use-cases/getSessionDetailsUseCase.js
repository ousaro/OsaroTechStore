import { createPaymentSession } from "../../domain/entities/PaymentSession.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";

export const buildGetSessionDetailsUseCase = ({ paymentGateway }) => {
  assertPaymentGatewayPort(paymentGateway, ["getCheckoutSession"]);
  return async ({ sessionId }) => {
    const session = await paymentGateway.getCheckoutSession(sessionId);
    return createPaymentSession(session).toPrimitives();
  };
};
