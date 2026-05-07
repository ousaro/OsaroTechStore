/**
 * Payment Strategy Port — Shared Application Layer.
 *
 * Defines the object returned by the payment resolver. A disabled strategy may
 * intentionally return gateway: null; enabled strategies must provide a gateway.
 */

import {
  assertBoolean,
  assertNonEmptyString,
  assertObject,
} from "../../kernel/assertions/index.js";
import { assertPaymentGatewayPort } from "./paymentGatewayPort.js";

export const assertPaymentStrategyPort = (strategy, context = "unknown") => {
  assertObject(strategy, "paymentStrategy", `[${context}] payment strategy is required`);

  assertNonEmptyString(
    strategy.provider,
    "paymentStrategy.provider",
    `[${context}] payment strategy provider is required`
  );
  assertNonEmptyString(
    strategy.label,
    "paymentStrategy.label",
    `[${context}] payment strategy label is required`
  );
  assertBoolean(
    strategy.paymentsEnabled,
    "paymentStrategy.paymentsEnabled",
    `[${context}] payment strategy paymentsEnabled must be a boolean`
  );
  assertBoolean(
    strategy.webhookEnabled,
    "paymentStrategy.webhookEnabled",
    `[${context}] payment strategy webhookEnabled must be a boolean`
  );

  if (strategy.paymentsEnabled || strategy.webhookEnabled) {
    assertPaymentGatewayPort(strategy.gateway, context);
  }

  return strategy;
};
