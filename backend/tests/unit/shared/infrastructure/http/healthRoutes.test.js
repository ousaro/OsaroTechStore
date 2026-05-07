import test from "node:test";
import assert from "node:assert/strict";

import { createHealthRoutes } from "../../../../../src/shared/infrastructure/http/healthRoutes.js";

const createResponse = () => ({
  statusCode: undefined,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const getRouteHandler = (router, path) => {
  const layer = router.stack.find((item) => item.route?.path === path);
  return layer.route.stack[0].handle;
};

test("health route returns liveness metadata", async () => {
  const router = createHealthRoutes({
    serviceName: "test-service",
    version: "1.2.3",
  });
  const res = createResponse();

  await getRouteHandler(router, "/health")({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
  assert.equal(res.body.service, "test-service");
  assert.equal(res.body.version, "1.2.3");
  assert.equal(typeof res.body.uptimeSeconds, "number");
  assert.match(res.body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test("ready route returns ok when all health checks pass", async () => {
  const router = createHealthRoutes({
    healthChecks: [
      {
        name: "database",
        check: async () => ({ provider: "mongo" }),
      },
    ],
  });
  const res = createResponse();

  await getRouteHandler(router, "/ready")({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
  assert.deepEqual(res.body.checks, [
    {
      name: "database",
      status: "ok",
      provider: "mongo",
    },
  ]);
});

test("ready route returns service unavailable when any health check fails", async () => {
  const router = createHealthRoutes({
    healthChecks: [
      {
        name: "database",
        check: async () => {
          throw new Error("connection closed");
        },
      },
    ],
  });
  const res = createResponse();

  await getRouteHandler(router, "/ready")({}, res);

  assert.equal(res.statusCode, 503);
  assert.equal(res.body.status, "fail");
  assert.deepEqual(res.body.checks, [
    {
      name: "database",
      status: "fail",
      error: "connection closed",
    },
  ]);
});
