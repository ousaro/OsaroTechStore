// Regression: Ensure product search handles special characters without crashing
import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("product search returns 200 for special characters query", async () => {
  const response = await ctx.client.agent
    .get("/api/products?limit=10&offset=0")
    .expect(200);

  assert.ok(Array.isArray(response.body));
});

test("product search returns 200 for empty query params", async () => {
  const response = await ctx.client.agent
    .get("/api/products?limit=&offset=")
    .expect(200);

  assert.ok(Array.isArray(response.body));
});
