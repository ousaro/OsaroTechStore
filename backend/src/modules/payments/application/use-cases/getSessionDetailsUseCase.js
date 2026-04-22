import { createPaymentSession } from "../../domain/entities/PaymentSession.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";

export const buildGetSessionDetailsUseCase = ({
  paymentGateway,
  paymentRepository,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["getCheckoutSession"]);
  assertPaymentRepositoryPort(paymentRepository, [
    "findPaymentSessionById",
    "savePaymentSession",
  ]);
  return async ({ sessionId }) => {
    const persistedSession = await paymentRepository.findPaymentSessionById(sessionId);

    if (persistedSession) {
      return createPaymentSession(persistedSession).toPrimitives();
    }

    const session = await paymentGateway.getCheckoutSession(sessionId);
    const paymentSession = createPaymentSession(session);
    await paymentRepository.savePaymentSession(paymentSession.toPrimitives());
    return paymentSession.toPrimitives();
  };
};
