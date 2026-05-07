import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";

const ctx = createIntegrationTestContext();

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
