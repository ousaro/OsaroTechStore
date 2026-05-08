import test from "node:test";
import assert from "node:assert/strict";

import { ServiceUnavailableError } from "../../../../../src/shared/application/errors/index.js";
import { resolveEventBus } from "../../../../../src/infrastructure/providers/events/resolveEventBus.js";
import { resolvePaymentStrategy } from "../../../../../src/infrastructure/providers/payments/resolvePaymentStrategy.js";
import { resolveDatabaseStrategy } from "../../../../../src/infrastructure/providers/databases/resolveDatabaseStrategy.js";
import { resolveLogger } from "../../../../../src/infrastructure/providers/logger/resolveLogger.js";

const logger = { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };

test("resolveEventBus returns in-process event bus and rejects unknown providers", () => {
  const bus = resolveEventBus({ provider: "inprocess", logger });

  assert.equal(typeof bus.publish, "function");
  assert.equal(typeof bus.subscribe, "function");
  assert.equal(bus.getName(), "inprocess");
  assert.throws(() => resolveEventBus({ provider: "unknown", logger }), ServiceUnavailableError);
});

test("resolveEventBus wires redis event bus from options", () => {
  const bus = resolveEventBus({
    provider: "redis",
    logger,
    options: {
      redisClient: {
        xAdd: async () => "1-0",
        xRead: async () => null,
      },
    },
  });

  assert.equal(typeof bus.publish, "function");
  assert.equal(typeof bus.subscribe, "function");
  assert.equal(bus.getName(), "redis");
});

test("resolvePaymentStrategy returns disabled strategy and rejects unsupported providers", () => {
  const strategy = resolvePaymentStrategy({
    provider: "disabled",
    env: {},
    logger,
  });

  assert.equal(strategy.provider, "disabled");
  assert.equal(strategy.paymentsEnabled, false);
  assert.equal(strategy.gateway, null);
  assert.throws(
    () => resolvePaymentStrategy({ provider: "unknown", env: {}, logger }),
    ServiceUnavailableError
  );
});

test("resolvePaymentStrategy returns Stripe strategy when configured", () => {
  const strategy = resolvePaymentStrategy({
    provider: "stripe",
    env: {
      stripeSecretKey: "sk_test_123",
      stripeWebhookSecret: "whsec_123",
    },
    logger,
  });

  assert.equal(strategy.provider, "stripe");
  assert.equal(strategy.label, "Stripe");
  assert.equal(strategy.paymentsEnabled, true);
  assert.equal(strategy.webhookEnabled, true);
  assert.equal(typeof strategy.gateway.createRedirectPayment, "function");
  assert.equal(typeof strategy.gateway.verifyWebhook, "function");
});

test("resolveDatabaseStrategy returns mongo strategy", () => {
  const strategy = resolveDatabaseStrategy({
    provider: "mongo",
    logger,
    env: { mongoUri: "mongodb://localhost:27017/test" },
  });
  assert.equal(strategy.getName(), "mongo");
});

test("resolveDatabaseStrategy rejects unsupported providers", () => {
  assert.throws(
    () => resolveDatabaseStrategy({ provider: "unknown", logger, env: {} }),
    ServiceUnavailableError
  );
});

test("resolveLogger returns console logger and rejects unavailable providers", () => {
  const resolved = resolveLogger({
    provider: "console",
    scope: "test",
    options: { colorize: false, timestampEnabled: false },
  });

  assert.equal(typeof resolved.info, "function");
  assert.equal(typeof resolved.child, "function");
  assert.throws(() => resolveLogger({ provider: "pino" }), ServiceUnavailableError);
  assert.throws(() => resolveLogger({ provider: "noop" }), ServiceUnavailableError);
  assert.throws(() => resolveLogger({ provider: "unknown" }), ServiceUnavailableError);
});
