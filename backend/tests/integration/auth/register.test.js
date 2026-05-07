import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { buildUserPayload } from "../../shared/factories/userFactory.js";

const ctx = createIntegrationTestContext();

test("POST /api/auth/register creates a user and returns a JWT session", async () => {
  const payload = buildUserPayload();

  const response = await ctx.client.agent
    .post("/api/auth/register")
    .send(payload)
    .expect(201);

  assert.equal(response.body.email, payload.email.toLowerCase());
  assert.equal(response.body.firstName, payload.firstName);
  assert.equal(typeof response.body.token, "string");
  assert.ok(response.body._id);

  const persisted = await ctx.application.repositories.authUserRepository.findByEmail(payload.email);
  assert.equal(persisted.email, payload.email.toLowerCase());
});

test("POST /api/auth/register rejects invalid registration data", async () => {
  const response = await ctx.client.agent
    .post("/api/auth/register")
    .send(buildUserPayload({ email: "not-an-email" }))
    .expect(400);

  assert.equal(response.body.error.code, "VALIDATION");
});
