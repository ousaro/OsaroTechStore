import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("response includes security headers from helmet", async () => {
  const res = await ctx.client.agent.get("/health");

  assert.equal(res.headers["x-content-type-options"], "nosniff");
  assert.equal(res.headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(res.headers["x-dns-prefetch-control"], "off");
});

test("response includes X-Request-Id header", async () => {
  const res = await ctx.client.agent.get("/health");

  assert.ok(res.headers["x-request-id"]);
  assert.match(res.headers["x-request-id"], /^[a-f0-9-]+$/);
});

test("CORS allows configured origins", async () => {
  const res = await ctx.client.agent
    .get("/health")
    .set("Origin", "http://localhost:3000");

  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.equal(res.headers["access-control-allow-credentials"], "true");
});

test("CORS preflight responds with allowed methods for configured origin", async () => {
  const res = await ctx.client.agent
    .options("/health")
    .set("Origin", "http://localhost:3000")
    .set("Access-Control-Request-Method", "GET");

  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.ok(res.headers["access-control-allow-methods"]);
});

test("CORS omits allow-origin header for disallowed origins", async () => {
  const res = await ctx.client.agent
    .get("/health")
    .set("Origin", "http://evil-site.com");

  assert.equal(res.status, 200);
  assert.equal(res.headers["access-control-allow-origin"], undefined);
});

test("/metrics returns prometheus metrics", async () => {
  const res = await ctx.client.agent.get("/metrics");

  assert.equal(res.status, 200);
  assert.match(res.text, /http_request_duration_seconds/);
  assert.match(res.headers["content-type"], /text\/plain/);
});

test("unhandled route returns 404 with structured error", async () => {
  const res = await ctx.client.agent.get("/api/nonexistent-route");

  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "NOT_FOUND");
  assert.match(res.body.error.message, /not found/i);
});
