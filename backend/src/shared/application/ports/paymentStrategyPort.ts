import {
  assertBoolean,
  assertNonEmptyString,
  assertObject,
} from "../../kernel/assertions/index.js";
import { assertPaymentGatewayPort } from "./paymentGatewayPort.js";

interface PaymentGateway {
  createRedirectPayment(data: unknown): Promise<{ url: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<Record<string, unknown>>;
}

export interface PaymentStrategy {
  provider: string;
  label: string;
  paymentsEnabled: boolean;
  webhookEnabled: boolean;
  gateway?: PaymentGateway;
}

export const assertPaymentStrategyPort = (
  strategy: unknown,
  context = "unknown"
): PaymentStrategy => {
  assertObject(strategy, "paymentStrategy", `[${context}] payment strategy is required`);
  const s = strategy as Record<string, unknown>;

  assertNonEmptyString(
    s.provider as string,
    "paymentStrategy.provider",
    `[${context}] payment strategy provider is required`
  );
  assertNonEmptyString(
    s.label as string,
    "paymentStrategy.label",
    `[${context}] payment strategy label is required`
  );
  assertBoolean(
    s.paymentsEnabled,
    "paymentStrategy.paymentsEnabled",
    `[${context}] payment strategy paymentsEnabled must be a boolean`
  );
  assertBoolean(
    s.webhookEnabled,
    "paymentStrategy.webhookEnabled",
    `[${context}] payment strategy webhookEnabled must be a boolean`
  );

  if (s.paymentsEnabled || s.webhookEnabled) {
    assertPaymentGatewayPort(s.gateway, context);
  }

  return s as unknown as PaymentStrategy;
};
