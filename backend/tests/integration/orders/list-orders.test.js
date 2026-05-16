import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";

const ctx = createIntegrationTestContext();

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("orders routes read by id and filter by owner", async () => {
  const owner = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "order.owner@example.test" },
  });
  const otherOwner = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "order.other@example.test" },
  });

  const firstOrderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(owner)}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "Casablanca" } }))
    .expect(201);

  await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(otherOwner)}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "Rabat" } }))
    .expect(201);

  const ownerOrdersResponse = await ctx.client.agent
    .get(`/api/orders?ownerId=${owner._id}`)
    .set("Authorization", `Bearer ${tokenFor(owner)}`)
    .expect(200);

  assert.deepEqual(
    ownerOrdersResponse.body.map((order) => order._id),
    [firstOrderResponse.body._id]
  );

  const getResponse = await ctx.client.agent
    .get(`/api/orders/${firstOrderResponse.body._id}`)
    .set("Authorization", `Bearer ${tokenFor(owner)}`)
    .expect(200);

  assert.equal(getResponse.body.deliveryAddress.city, "Casablanca");
});

test("orders routes paginate list results", async () => {
  const owner = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
    overrides: { email: "order.pagination@example.test" },
  });
  const token = tokenFor(owner);

  await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "First" } }))
    .expect(201);
  const secondOrderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "Second" } }))
    .expect(201);
  const thirdOrderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(buildOrderPayload({ deliveryAddress: { city: "Third" } }))
    .expect(201);

  const response = await ctx.client.agent
    .get(`/api/orders?ownerId=${owner._id}&limit=2`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.deepEqual(
    response.body.map((order) => order._id),
    [thirdOrderResponse.body._id, secondOrderResponse.body._id]
  );
});
