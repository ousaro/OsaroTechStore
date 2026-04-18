import { assertPaymentGatewayPort } from "../../ports/output/paymentGatewayPort.js";

export const buildVerifyWebhookUseCase = ({ paymentGateway }) => {
  assertPaymentGatewayPort(paymentGateway, ["verifyWebhook"]);
  return async ({ payload, signature }) => {
    paymentGateway.verifyWebhook(payload, signature);
    return { received: true };
  };
};
