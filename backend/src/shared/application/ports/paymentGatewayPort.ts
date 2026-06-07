import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

interface PaymentGateway {
  createRedirectPayment(data: unknown): Promise<{ url: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<Record<string, unknown>>;
}

export const PAYMENT_GATEWAY_METHODS: readonly string[] = Object.freeze([
  "createRedirectPayment",
  "verifyWebhook",
]);

export const assertPaymentGatewayPort = (gateway: unknown, context = "unknown"): PaymentGateway => {
  assertObject(gateway, "paymentGateway", `[${context}] payment gateway is required`);
  const g = gateway as Record<string, unknown>;

  for (const method of PAYMENT_GATEWAY_METHODS) {
    assertFunction(
      g[method],
      `paymentGateway.${method}`,
      `[${context}] payment gateway must implement .${method}()`
    );
  }

  return g as unknown as PaymentGateway;
};
