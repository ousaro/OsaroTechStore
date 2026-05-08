import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";
import { createStripeGatewayMock } from "../../shared/mocks/stripeGatewayMock.js";

const stripeGateway = createStripeGatewayMock();
const ctx = createIntegrationTestContext({ paymentGateway: stripeGateway });

test("authenticated user can read payment workflow by order id", async () => {
  const user = await ctx.createUser();
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });
  const headers = ctx.authHeadersFor(user);

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set(headers)
    .send(
      buildOrderPayload({
        orderLine: {
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      })
    )
    .expect(201);

  const intentResponse = await ctx.client.agent
    .post("/api/payments/intent")
    .set(headers)
    .send({
      orderId: orderResponse.body._id,
      items: [{ name: product.name, price: product.price, quantity: 1 }],
      currency: "USD",
    })
    .expect(201);

  const lookupResponse = await ctx.client.agent
    .get(`/api/payments/order/${orderResponse.body._id}`)
    .set(headers)
    .expect(200);

  assert.equal(lookupResponse.body._id, intentResponse.body._id);
  assert.equal(lookupResponse.body.orderId, orderResponse.body._id);
  assert.equal(lookupResponse.body.paymentStatus, "pending");
});

test("payment lookup requires authentication and returns structured not-found errors", async () => {
  const missingOrderId = "64f000000000000000000000";

  await ctx.client.agent.get(`/api/payments/order/${missingOrderId}`).expect(401);

  const user = await ctx.createUser();
  const response = await ctx.client.agent
    .get(`/api/payments/order/${missingOrderId}`)
    .set(ctx.authHeadersFor(user))
    .expect(404);

  assert.equal(response.body.error.code, "NOT_FOUND");
});
