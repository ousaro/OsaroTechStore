import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { createIntegrationTestContext } from "../shared/utils/integrationTestContext.js";
import { buildUserPayload, persistAdminUser, persistUser } from "../shared/factories/userFactory.js";

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

test("POST /api/auth/login authenticates existing credentials", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "login@example.test", password: "Password123!" },
  });

  const response = await ctx.client.agent
    .post("/api/auth/login")
    .send({ email: user.email, password: "Password123!" })
    .expect(200);

  assert.equal(response.body.email, user.email);
  assert.equal(typeof response.body.token, "string");
});

test("GET /api/auth/users requires a valid admin token", async () => {
  await ctx.client.agent.get("/api/auth/users").expect(401);

  const normalUser = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const normalToken = ctx.application.tokenService.signUserId(normalUser._id);

  await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${normalToken}`)
    .expect(403);

  const admin = await persistAdminUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const adminToken = ctx.application.tokenService.signUserId(admin._id);

  const response = await ctx.client.agent
    .get("/api/auth/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(Array.isArray(response.body), true);
});

test("protected routes reject malformed, missing, and expired tokens", async () => {
  await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", "Token abc")
    .send({})
    .expect(401);

  const expiredToken = jwt.sign(
    { _id: "507f1f77bcf86cd799439011" },
    ctx.application.env.tokenSecret,
    { expiresIn: "-1s" }
  );

  const response = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${expiredToken}`)
    .send({})
    .expect(401);

  assert.equal(response.body.error.code, "UNAUTHORIZED");
});
