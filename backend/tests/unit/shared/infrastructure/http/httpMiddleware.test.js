import test from "node:test";
import assert from "node:assert/strict";

import { createErrorMiddleware } from "../../../../../src/shared/infrastructure/http/middleware/errorMiddleware.js";
import { notFoundMiddleware } from "../../../../../src/shared/infrastructure/http/middleware/notFoundMiddleware.js";
import { requestIdMiddleware } from "../../../../../src/shared/infrastructure/http/middleware/requestIdMiddleware.js";

const createResponse = () => ({
  statusCode: undefined,
  body: undefined,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  setHeader(key, value) {
    this.headers[key] = value;
  },
});

test("notFoundMiddleware returns structured 404 response", () => {
  const res = createResponse();

  notFoundMiddleware({ method: "GET", path: "/missing" }, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    error: {
      code: "NOT_FOUND",
      message: "Route GET /missing not found",
    },
  });
});

test("requestIdMiddleware preserves incoming request id", () => {
  const req = { headers: { "x-request-id": "req-1" } };
  const res = createResponse();
  let nextCalled = false;

  requestIdMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(req.requestId, "req-1");
  assert.equal(res.headers["X-Request-Id"], "req-1");
  assert.equal(nextCalled, true);
});

test("requestIdMiddleware generates request id when missing", () => {
  const req = { headers: {} };
  const res = createResponse();

  requestIdMiddleware(req, res, () => {});

  assert.match(req.requestId, /^[0-9a-f-]{36}$/);
  assert.equal(res.headers["X-Request-Id"], req.requestId);
});

test("error middleware delegates to HTTP error resolver", () => {
  const logs = [];
  const res = createResponse();
  const middleware = createErrorMiddleware({
    warn: (entry) => logs.push(entry),
    error: (entry) => logs.push(entry),
  });

  middleware(
    Object.assign(new Error("bad request"), { code: "VALIDATION" }),
    { requestId: "req-1", method: "POST", path: "/api/test" },
    res,
    () => {}
  );

  assert.equal(res.statusCode, 400);
  assert.equal(logs[0].msg, "Client error");
});
