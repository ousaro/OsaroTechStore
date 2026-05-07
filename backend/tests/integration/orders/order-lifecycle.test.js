import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("orders reject immutable core field updates after placement", async () => {
  const owner = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const token = tokenFor(owner);

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(buildOrderPayload())
    .expect(201);

  await ctx.client.agent
    .put(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ orderStatus: "processing" })
    .expect(200);

  const immutableUpdateResponse = await ctx.client.agent
    .put(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      orderLines: [
        {
          productId: "replacement-product",
          name: "Replacement",
          price: 1,
          quantity: 1,
        },
      ],
    })
    .expect(400);

  assert.equal(immutableUpdateResponse.body.error.code, "VALIDATION");
});
