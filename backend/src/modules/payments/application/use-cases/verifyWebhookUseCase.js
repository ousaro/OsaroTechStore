import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";

export const buildVerifyWebhookUseCase = ({
  paymentGateway,
  paymentRepository,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["verifyWebhook"]);
  assertPaymentRepositoryPort(paymentRepository, ["applyWebhookStateChangeOnce"]);
  return async ({ payload, signature }) => {
    const stateChange = paymentGateway.verifyWebhook(payload, signature);

    if (stateChange) {
      await paymentRepository.applyWebhookStateChangeOnce(stateChange);
    }

    return { received: true };
  };
};
