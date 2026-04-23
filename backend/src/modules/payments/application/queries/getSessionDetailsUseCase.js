import { createPaymentWorkflow } from "../../domain/entities/PaymentSession.js";
import { assertRedirectPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import {
  assertPaymentRepositoryCommandPort,
  assertPaymentRepositoryQueryPort,
} from "../../ports/output/paymentRepositoryPort.js";
import { toPaymentWorkflowDto } from "../dto/paymentSessionDto.js";
import { toPaymentReadModel } from "../read-models/paymentReadModel.js";

export const buildGetSessionDetailsUseCase = ({
  paymentGateway,
  paymentRepository,
}) => {
  assertRedirectPaymentGatewayPort(paymentGateway, ["getRedirectPayment"]);
  assertPaymentRepositoryQueryPort(paymentRepository, ["findPaymentWorkflowById"]);
  assertPaymentRepositoryCommandPort(paymentRepository, ["savePaymentWorkflow"]);
  return async ({ sessionId }) => {
    const persistedPayment = await paymentRepository.findPaymentWorkflowById(sessionId);

    if (persistedPayment) {
      return toPaymentReadModel(
        toPaymentWorkflowDto(createPaymentWorkflow(persistedPayment).toPrimitives())
      );
    }

    const payment = await paymentGateway.getRedirectPayment(sessionId);
    const paymentWorkflow = createPaymentWorkflow(payment);
    await paymentRepository.savePaymentWorkflow(paymentWorkflow.toPrimitives());
    return toPaymentReadModel(toPaymentWorkflowDto(paymentWorkflow.toPrimitives()));
  };
};
