import test from "node:test";
import assert from "node:assert/strict";
import { configureApplicationModules } from "../../../src/infrastructure/bootstrap/configureApplicationModules.js";
import { createMongoMemoryTestServer } from "../../shared/utils/mongoMemoryServer.js";
import { buildTestEnv } from "../../shared/utils/testEnvironment.js";

test("composition root wires modules, health checks, schedulers, and shutdown", async () => {
  const mongo = createMongoMemoryTestServer();
  await mongo.connect();

  const modules = await configureApplicationModules({
    env: buildTestEnv({
      mongoUri: mongo.getUri(),
      paymentProvider: "disabled",
      eventBusProvider: "inprocess",
      loggerProvider: "console",
      loggerTimestampEnabled: false,
    }),
  });

  try {
    assert.equal(typeof modules.authRoutes, "function");
    assert.equal(typeof modules.usersRoutes, "function");
    assert.equal(typeof modules.productsRoutes, "function");
    assert.equal(typeof modules.categoriesRoutes, "function");
    assert.equal(typeof modules.ordersRoutes, "function");
    assert.equal(typeof modules.paymentsRoutes, "function");
    assert.equal(modules.serviceName, "osaro-tech-store-backend-test");
    assert.equal(modules.version, "test");
    assert.equal(Array.isArray(modules.schedulers), true);
    assert.equal(modules.schedulers.length, 1);
    assert.equal(Array.isArray(modules.healthChecks), true);
    assert.deepEqual(
      modules.healthChecks.map((check) => check.name),
      ["database", "payments", "eventBus"]
    );

    const healthResults = await Promise.all(modules.healthChecks.map((check) => check.check()));

    assert.deepEqual(healthResults, [
      { provider: "mongo" },
      { provider: "disabled", enabled: false, webhookEnabled: false },
      { provider: "inprocess" },
    ]);
  } finally {
    await modules.shutdown();
    await mongo.disconnect();
  }
});
