import test from "node:test";
import assert from "node:assert/strict";

import { resolveOAuthStrategies } from "../../../../../src/modules/auth/adapters/output/oauth/oauthProviderRegistry.js";

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

test("OAuth provider registry returns unavailable handlers for disabled Google", () => {
  const [strategy] = resolveOAuthStrategies({
    oauthProviders: {
      google: { enabled: false, configured: false },
    },
    clientUrl: "http://client.test",
    callbackHandler: () => {},
  });
  const res = createResponse();

  strategy.authenticateHandler({}, res);

  assert.equal(strategy.name, "google");
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { message: "Google OAuth is not configured" });
});

test("OAuth provider registry returns unavailable handlers for unsupported providers", () => {
  const [strategy] = resolveOAuthStrategies({
    oauthProviders: {
      " Custom ": { label: "Custom Login" },
    },
    clientUrl: "http://client.test",
    callbackHandler: () => {},
  });
  const res = createResponse();

  strategy.callbackHandler({}, res);

  assert.equal(strategy.name, "custom");
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { message: "Custom Login OAuth is not configured" });
});

test("OAuth provider registry configures enabled Google strategy", () => {
  const callbackHandler = () => {};
  const [strategy] = resolveOAuthStrategies({
    oauthProviders: {
      google: {
        enabled: true,
        configured: true,
        clientId: "client",
        clientSecret: "secret",
        callbackUrl: "http://api.test/auth/google/callback",
      },
    },
    clientUrl: "http://client.test",
    callbackHandler,
  });

  assert.equal(strategy.name, "google");
  assert.equal(typeof strategy.authenticateHandler, "function");
  assert.equal(Array.isArray(strategy.callbackHandler), true);
  assert.equal(strategy.callbackHandler[1], callbackHandler);
});
