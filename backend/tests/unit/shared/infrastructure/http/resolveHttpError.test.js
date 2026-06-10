import test from "node:test";
import assert from "node:assert/strict";

import { resolveHttpError } from "../../../../../src/shared/infrastructure/http/errors/resolveHttpError.js";
import {
  ApplicationNotFoundError,
  ApplicationValidationError,
} from "../../../../../src/shared/application/errors/index.js";

const createResponse = () => {
  const res = {
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
  };
  return res;
};

test("resolveHttpError maps client errors and logs warnings", () => {
  const logs = [];
  const logger = { warn: (entry) => logs.push(entry), error: () => {} };
  const req = { requestId: "req1", method: "GET", path: "/api/products/missing" };
  const res = createResponse();

  resolveHttpError(new ApplicationNotFoundError("Product not found"), req, res, logger);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Product not found",
    },
  });
  assert.equal(logs[0].msg, "Client error");
  assert.equal(logs[0].errorCode, "NOT_FOUND");
});

test("resolveHttpError includes validation metadata", () => {
  const error = new ApplicationValidationError("Invalid payload");
  error.meta = { field: "email" };
  const res = createResponse();

  resolveHttpError(error, { requestId: "req1", method: "POST", path: "/api/auth/register" }, res, {
    warn: () => {},
    error: () => {},
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.error.meta, { field: "email" });
});

test("resolveHttpError hides server error details and logs errors", () => {
  const logs = [];
  const logger = { warn: () => {}, error: (entry) => logs.push(entry) };
  const req = { requestId: "req1", method: "GET", path: "/api/boom" };
  const res = createResponse();

  resolveHttpError(new Error("Database exploded"), req, res, logger);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
  assert.equal(logs[0].msg, "Unhandled server error");
  assert.equal(logs[0].error, "Database exploded");
});
