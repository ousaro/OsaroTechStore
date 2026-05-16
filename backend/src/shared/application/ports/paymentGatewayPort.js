import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const PAYMENT_GATEWAY_METHODS = Object.freeze(["createRedirectPayment", "verifyWebhook"]);

export const assertPaymentGatewayPort = (gateway, context = "unknown") => {
  assertObject(gateway, "paymentGateway", `[${context}] payment gateway is required`);

  for (const method of PAYMENT_GATEWAY_METHODS) {
    assertFunction(
      gateway[method],
      `paymentGateway.${method}`,
      `[${context}] payment gateway must implement .${method}()`
    );
  }

  return gateway;
};
