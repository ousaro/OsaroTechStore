import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { getPathsRequiringAuth } from "../../shared/utils/openApiValidator.js";

const ctx = createIntegrationTestContext();

const DUMMY_ID = "000000000000000000000000";

const resolvePathParams = (route) => route.replace(/\{(\w+)\}/g, DUMMY_ID);

const getProtectedRoutes = () =>
  getPathsRequiringAuth()
    .filter((p) => p.requiresAuth)
    .map((p) => ({ ...p, route: resolvePathParams(p.route) }));

test("every documented protected route returns 401 without a token", async () => {
  const protectedPaths = getProtectedRoutes();
  const failures = [];

  for (const { route, method } of protectedPaths) {
    const sendMethod = method.toLowerCase();
    const response = await ctx.client.agent[sendMethod](`/api${route}`);
    if (response.status !== 401) {
      failures.push(
        `${method} ${route} returned ${response.status} (expected 401) — ${JSON.stringify(response.body).slice(0, 120)}`
      );
    }
  }

  assert.deepEqual(failures, []);
});

test("every documented protected route returns 401 with an invalid token", async () => {
  const protectedPaths = getProtectedRoutes();
  const failures = [];

  for (const { route, method } of protectedPaths) {
    const sendMethod = method.toLowerCase();
    const response = await ctx.client.agent[sendMethod](`/api${route}`).set(
      "Authorization",
      "Bearer invalid-token-that-is-not-valid"
    );
    if (response.status !== 401) {
      failures.push(
        `${method} ${route} returned ${response.status} (expected 401) — ${JSON.stringify(response.body).slice(0, 120)}`
      );
    }
  }

  assert.deepEqual(failures, []);
});

test("every documented protected route returns 401 with an expired token", async () => {
  const protectedPaths = getProtectedRoutes();
  const failures = [];

  const expiredToken = ctx.application.tokenService.signUserId("000000000000000000000000", {
    expiresIn: "0s",
  });

  for (const { route, method } of protectedPaths) {
    const sendMethod = method.toLowerCase();
    const response = await ctx.client.agent[sendMethod](`/api${route}`).set(
      "Authorization",
      `Bearer ${expiredToken}`
    );
    if (response.status !== 401) {
      failures.push(
        `${method} ${route} returned ${response.status} (expected 401) — ${JSON.stringify(response.body).slice(0, 120)}`
      );
    }
  }

  assert.deepEqual(failures, []);
});

test("every documented protected route does not return 401 with a valid user token", async () => {
  const protectedPaths = getProtectedRoutes();
  const failures = [];
  const user = await ctx.createUser();

  for (const { route, method } of protectedPaths) {
    const sendMethod = method.toLowerCase();
    const response = await ctx.client.agent[sendMethod](`/api${route}`).set(
      ctx.authHeadersFor(user)
    );

    if (response.status === 401) {
      failures.push(`${method} ${route} returned 401 despite valid token`);
    }
  }

  assert.deepEqual(failures, []);
});
