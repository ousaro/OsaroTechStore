import test from "node:test";
import assert from "node:assert/strict";

import { createConsoleLogger } from "../../../../../src/infrastructure/providers/logger/consoleLogger.js";

const captureConsole = (methodName, run) => {
  const original = console[methodName];
  const calls = [];
  console[methodName] = (message) => calls.push(message);

  try {
    run();
    return calls;
  } finally {
    console[methodName] = original;
  }
};

test("console logger formats object entries with msg and context", () => {
  const calls = captureConsole("info", () => {
    const logger = createConsoleLogger("app:test", {
      colorize: false,
      timestampEnabled: false,
    });

    logger.info({ msg: "Product added", productId: "p1" });
  });

  assert.equal(calls[0], 'INFO  [app:test] Product added {"productId":"p1"}');
});

test("console logger still supports message and context arguments", () => {
  const calls = captureConsole("warn", () => {
    const logger = createConsoleLogger("app:test", {
      colorize: false,
      timestampEnabled: false,
    });

    logger.warn("Payment provider missing", { provider: "stripe" });
  });

  assert.equal(calls[0], 'WARN  [app:test] Payment provider missing {"provider":"stripe"}');
});

test("console logger child appends scope and inherits options", () => {
  const calls = captureConsole("info", () => {
    const logger = createConsoleLogger("app", {
      colorize: false,
      timestampEnabled: false,
    }).child({ scope: "orders" });

    logger.info({ msg: "Order placed" });
  });

  assert.equal(calls[0], "INFO  [app:orders] Order placed");
});

test("console logger can disable timestamps", () => {
  const calls = captureConsole("info", () => {
    const logger = createConsoleLogger("app", {
      colorize: false,
      timestampEnabled: false,
    });

    logger.info({ msg: "No timestamp" });
  });

  assert.match(calls[0], /^INFO\s+\[app\] No timestamp$/);
});

test("console logger supports custom timestamp formats", () => {
  const calls = captureConsole("info", () => {
    const logger = createConsoleLogger("app", {
      colorize: false,
      timestampEnabled: true,
      timestampFormat: "time",
    });

    logger.info({ msg: "Time only" });
  });

  assert.match(calls[0], /^\d{2}:\d{2}:\d{2} INFO\s+\[app\] Time only$/);
});

test("console logger serializes Error objects in context", () => {
  const calls = captureConsole("error", () => {
    const logger = createConsoleLogger("app", {
      colorize: false,
      timestampEnabled: false,
    });

    logger.error({ msg: "Failed", error: new Error("boom") });
  });

  assert.match(calls[0], /^ERROR \[app\] Failed /);
  assert.match(calls[0], /"name":"Error"/);
  assert.match(calls[0], /"message":"boom"/);
  assert.match(calls[0], /"stack":"Error: boom/);
});
