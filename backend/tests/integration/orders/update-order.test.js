import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("orders can be updated while pending and deleted through HTTP and DB", async () => {
  const owner = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const token = tokenFor(owner);

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "Casablanca" } }))
    .expect(201);

  const getResponse = await ctx.client.agent
    .get(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  const updateResponse = await ctx.client.agent
    .put(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ deliveryAddress: { ...getResponse.body.deliveryAddress, city: "Marrakesh" } })
    .expect(200);

  assert.equal(updateResponse.body.deliveryAddress.city, "Marrakesh");

  await ctx.client.agent
    .delete(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  await ctx.client.agent
    .get(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(404);
});
