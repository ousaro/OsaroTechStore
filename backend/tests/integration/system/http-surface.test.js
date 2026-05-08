import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("system routes expose health, readiness, API docs, and structured 404s", async () => {
  const healthResponse = await ctx.client.agent.get("/health").expect(200);

  assert.equal(healthResponse.body.status, "ok");
  assert.equal(healthResponse.body.service, "osaro-tech-store-backend-test");
  assert.equal(healthResponse.body.version, "test");

  const readyResponse = await ctx.client.agent.get("/ready").expect(200);

  assert.equal(readyResponse.body.status, "ok");
  assert.deepEqual(
    readyResponse.body.checks.map((check) => check.name),
    ["database", "payments", "eventBus"]
  );

  const specResponse = await ctx.client.agent.get("/api-docs/openapi.yaml").expect(200);

  assert.match(specResponse.text, /openapi:/);
  assert.match(specResponse.headers["content-type"], /yaml|text/);

  const docsResponse = await ctx.client.agent.get("/api-docs").expect(200);

  assert.match(docsResponse.text, /swagger/i);

  const notFoundResponse = await ctx.client.agent.get("/api/does-not-exist").expect(404);

  assert.equal(notFoundResponse.body.error.code, "NOT_FOUND");
  assert.match(notFoundResponse.body.error.message, /not found/i);
});
