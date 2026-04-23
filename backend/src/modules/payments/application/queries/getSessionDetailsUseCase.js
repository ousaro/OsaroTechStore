import { createPaymentSession } from "../../domain/entities/PaymentSession.js";
import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import {
  assertPaymentRepositoryCommandPort,
  assertPaymentRepositoryQueryPort,
} from "../../ports/output/paymentRepositoryPort.js";
import { toPaymentSessionDto } from "../dto/paymentSessionDto.js";
import { toPaymentReadModel } from "../read-models/paymentReadModel.js";

export const buildGetSessionDetailsUseCase = ({
  paymentGateway,
  paymentRepository,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["getCheckoutSession"]);
  assertPaymentRepositoryQueryPort(paymentRepository, ["findPaymentSessionById"]);
  assertPaymentRepositoryCommandPort(paymentRepository, ["savePaymentSession"]);
  return async ({ sessionId }) => {
    const persistedSession = await paymentRepository.findPaymentSessionById(sessionId);

    if (persistedSession) {
      return toPaymentReadModel(
        toPaymentSessionDto(createPaymentSession(persistedSession).toPrimitives())
      );
    }

    const session = await paymentGateway.getCheckoutSession(sessionId);
    const paymentSession = createPaymentSession(session);
    await paymentRepository.savePaymentSession(paymentSession.toPrimitives());
    return toPaymentReadModel(toPaymentSessionDto(paymentSession.toPrimitives()));
  };
};
