import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";

const ctx = createIntegrationTestContext();

test("protected routes reject malformed, missing, and expired tokens", async () => {
  await ctx.client.agent.post("/api/orders").set("Authorization", "Token abc").send({}).expect(401);

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
