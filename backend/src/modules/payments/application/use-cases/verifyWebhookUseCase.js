import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";
import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";
import { resolvePaymentWebhookStateChange } from "../../domain/services/paymentSessionWorkflowService.js";

export const buildVerifyWebhookUseCase = ({
  paymentGateway,
  paymentRepository,
}) => {
  assertPaymentGatewayPort(paymentGateway, ["verifyWebhook"]);
  assertPaymentRepositoryPort(paymentRepository, ["applyWebhookStateChangeOnce"]);
  return async ({ payload, signature }) => {
    const event = paymentGateway.verifyWebhook(payload, signature);
    const stateChange = resolvePaymentWebhookStateChange(event);

    if (stateChange) {
      await paymentRepository.applyWebhookStateChangeOnce(stateChange);
    }

    return { received: true };
  };
};
