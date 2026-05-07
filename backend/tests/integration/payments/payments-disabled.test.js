import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";

const ctx = createIntegrationTestContext();

test("payments return structured service-unavailable errors when gateway is disabled", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const token = ctx.application.tokenService.signUserId(user._id);

  const response = await ctx.client.agent
    .post("/api/payments/intent")
    .set("Authorization", `Bearer ${token}`)
    .send({
      orderId: "507f1f77bcf86cd799439011",
      items: [{ name: "Phone", price: 699, quantity: 1 }],
    })
    .expect(503);

  assert.equal(response.body.error.code, "SERVICE_UNAVAILABLE");

  await ctx.client.agent
    .post("/api/payments/webhook")
    .set("stripe-signature", "valid-test-signature")
    .send({})
    .expect(404);
});
