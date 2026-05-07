import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";

const ctx = createIntegrationTestContext();

test("authenticated user can create an order through HTTP and persistence", async () => {
  const owner = await ctx.createUser();

  const response = await ctx.client.agent
    .post("/api/orders")
    .set(ctx.authHeadersFor(owner))
    .send(
      buildOrderPayload({
        orderLine: { productId: "keyboard-1", name: "Keyboard", price: 120, quantity: 2 },
        deliveryAddress: { city: "Casablanca" },
      })
    )
    .expect(201);

  assert.equal(response.body.ownerId, owner._id.toString());
  assert.equal(response.body.totalPrice.amount, 240);
  assert.equal(response.body.orderStatus, "pending");

  const persisted = await ctx.application.repositories.orderRepository.findById(response.body._id);
  assert.equal(persisted.ownerId.toString(), owner._id.toString());
});

test("order creation enforces authentication and validation", async () => {
  const owner = await ctx.createUser();

  await ctx.client.agent.post("/api/orders").send(buildOrderPayload()).expect(401);

  const invalidResponse = await ctx.client.agent
    .post("/api/orders")
    .set(ctx.authHeadersFor(owner))
    .send(buildOrderPayload({ orderLine: { quantity: 0 } }))
    .expect(400);

  assert.equal(invalidResponse.body.error.code, "VALIDATION");
});
