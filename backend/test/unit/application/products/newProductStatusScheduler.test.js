import test from "node:test";
import assert from "node:assert/strict";

import { buildNewProductStatusScheduler } from "../../../../src/modules/products/application/commands/newProductStatusScheduler.js";
import { PRODUCT_STATUSES } from "../../../../src/modules/products/domain/entities/Product.js";

test("new product status scheduler updates old new products and logs count", async () => {
  const originalSetInterval = globalThis.setInterval;
  const logs = [];
  const calls = [];
  let intervalDelay;
  globalThis.setInterval = (_fn, delay) => {
    intervalDelay = delay;
    return "interval-id";
  };

  try {
    const scheduler = buildNewProductStatusScheduler({
      productRepository: {
        updateStatusBefore: async (payload) => {
          calls.push(payload);
          return 2;
        },
      },
      logger: {
        info: (entry) => logs.push(entry),
        error: (entry) => logs.push(entry),
      },
    });

    const intervalId = scheduler.start();
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(intervalId, "interval-id");
    assert.equal(intervalDelay, 24 * 60 * 60 * 1000);
    assert.equal(calls[0].fromStatus, PRODUCT_STATUSES.NEW);
    assert.equal(calls[0].toStatus, PRODUCT_STATUSES.ACTIVE);
    assert.equal(calls[0].before instanceof Date, true);
    assert.deepEqual(logs[0], {
      msg: "Scheduler: new->active products updated",
      count: 2,
    });
  } finally {
    globalThis.setInterval = originalSetInterval;
  }
});

test("new product status scheduler logs repository failures", async () => {
  const originalSetInterval = globalThis.setInterval;
  const logs = [];
  globalThis.setInterval = () => "interval-id";

  try {
    const scheduler = buildNewProductStatusScheduler({
      productRepository: {
        updateStatusBefore: async () => {
          throw new Error("database down");
        },
      },
      logger: {
        info: (entry) => logs.push(entry),
        error: (entry) => logs.push(entry),
      },
    });

    scheduler.start();
    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(logs[0], {
      msg: "Scheduler: failed to update product statuses",
      error: "database down",
    });
  } finally {
    globalThis.setInterval = originalSetInterval;
  }
});
