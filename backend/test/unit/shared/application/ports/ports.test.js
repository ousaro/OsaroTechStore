import test from "node:test";
import assert from "node:assert/strict";

import { assertDatabaseProviderPort } from "../../../../../src/shared/application/ports/databaseProviderPort.js";
import { assertEventBusPort } from "../../../../../src/shared/application/ports/eventBusPort.js";
import { assertLoggerPort, createScopedLogger } from "../../../../../src/shared/application/ports/loggerPort.js";
import { assertPaymentGatewayPort } from "../../../../../src/shared/application/ports/paymentGatewayPort.js";
import { assertPaymentStrategyPort } from "../../../../../src/shared/application/ports/paymentStrategyPort.js";
import { assertRepositoryPort } from "../../../../../src/shared/application/ports/repositoryPort.js";

test("port assertions accept valid adapters and reject missing methods", () => {
  const database = {
    connect: () => {},
    disconnect: () => {},
    getConnection: () => {},
  };

  assert.equal(assertDatabaseProviderPort(database), database);

  assert.throws(() => assertDatabaseProviderPort({ connect: () => {} }));
  assert.throws(() => assertEventBusPort({ publish: () => {} }));
  assert.throws(() => assertLoggerPort({ info: () => {}, warn: () => {}, error: () => {} }));
  assert.throws(() => assertPaymentGatewayPort({ createRedirectPayment: () => {} }));
  assert.throws(() => assertRepositoryPort({ findById: () => {} }, ["findById", "create"], "repo"));
});

test("payment strategy port allows disabled gateway and requires gateway when enabled", () => {
  const disabled = {
    provider: "disabled",
    label: "Payments",
    paymentsEnabled: false,
    webhookEnabled: false,
    gateway: null,
  };

  assert.equal(assertPaymentStrategyPort(disabled), disabled);
  assert.throws(() =>
    assertPaymentStrategyPort({
      provider: "stripe",
      label: "Stripe",
      paymentsEnabled: true,
      webhookEnabled: false,
      gateway: null,
    })
  );
});

test("createScopedLogger delegates to child when available", () => {
  const childCalls = [];
  const scoped = createScopedLogger({
    child: (meta) => {
      childCalls.push(meta);
      return { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    },
  }, "orders");

  assert.equal(typeof scoped.info, "function");
  assert.deepEqual(childCalls, [{ scope: "orders" }]);
});

test("createScopedLogger prefixes object-shaped logs without child support", () => {
  const calls = [];
  const scoped = createScopedLogger({
    info: (entry) => calls.push(entry),
    warn: () => {},
    error: () => {},
    debug: () => {},
  }, "orders");

  scoped.info({ msg: "Order placed", orderId: "o1" });

  assert.deepEqual(calls[0], {
    msg: "[orders] Order placed",
    orderId: "o1",
  });
});
