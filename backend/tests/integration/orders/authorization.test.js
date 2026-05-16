import test from "node:test";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";

const ctx = createIntegrationTestContext();

const createOrderFor = async (user) => {
  const response = await ctx.client.agent
    .post("/api/orders")
    .set(ctx.authHeadersFor(user))
    .send(buildOrderPayload())
    .expect(201);

  return response.body;
};

test("order read, update, and delete require owner or admin access", async () => {
  const owner = await ctx.createUser({ email: "orders.owner@example.test" });
  const otherUser = await ctx.createUser({ email: "orders.other@example.test" });
  const admin = await ctx.createAdmin({ email: "orders.admin@example.test" });
  const order = await createOrderFor(owner);

  await ctx.client.agent
    .get(`/api/orders/${order._id}`)
    .set(ctx.authHeadersFor(otherUser))
    .expect(403);

  await ctx.client.agent
    .put(`/api/orders/${order._id}`)
    .set(ctx.authHeadersFor(otherUser))
    .send({ deliveryAddress: { ...order.deliveryAddress, city: "Rabat" } })
    .expect(403);

  await ctx.client.agent
    .delete(`/api/orders/${order._id}`)
    .set(ctx.authHeadersFor(otherUser))
    .expect(403);

  await ctx.client.agent.get(`/api/orders/${order._id}`).set(ctx.authHeadersFor(admin)).expect(200);
  await ctx.client.agent
    .put(`/api/orders/${order._id}`)
    .set(ctx.authHeadersFor(admin))
    .send({ deliveryAddress: { ...order.deliveryAddress, city: "Marrakesh" } })
    .expect(200);
  await ctx.client.agent
    .delete(`/api/orders/${order._id}`)
    .set(ctx.authHeadersFor(admin))
    .expect(200);
});
