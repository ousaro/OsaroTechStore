import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";
import { createStripeGatewayMock } from "../../shared/mocks/stripeGatewayMock.js";

const stripeGateway = createStripeGatewayMock();
const ctx = createIntegrationTestContext({ paymentGateway: stripeGateway });

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("authenticated user can create an idempotent payment intent for an order", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const category = await persistCategory({
    categoryRepository: ctx.application.repositories.categoryRepository,
  });
  const product = await persistProduct({
    productRepository: ctx.application.repositories.productRepository,
    category: category._id.toString(),
  });

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(buildOrderPayload({
      orderLine: {
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: 2,
      },
    }))
    .expect(201);

  assert.equal(orderResponse.body.ownerId, user._id.toString());
  assert.equal(orderResponse.body.totalPrice.amount, 1398);

  const paymentResponse = await ctx.client.agent
    .post("/api/payments/intent")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({
      orderId: orderResponse.body._id,
      items: [{ name: product.name, price: product.price, quantity: 2 }],
      currency: "USD",
    })
    .expect(201);

  assert.equal(paymentResponse.body.orderId, orderResponse.body._id);
  assert.equal(paymentResponse.body.provider, "stripe");
  assert.equal(paymentResponse.body.paymentStatus, "pending");
  assert.match(paymentResponse.body.url, /^https:\/\/checkout\.stripe\.test/);

  const duplicatePaymentResponse = await ctx.client.agent
    .post("/api/payments/intent")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({
      orderId: orderResponse.body._id,
      items: [{ name: product.name, price: product.price, quantity: 2 }],
      currency: "USD",
    })
    .expect(201);

  assert.equal(duplicatePaymentResponse.body._id, paymentResponse.body._id);
  assert.equal(stripeGateway.calls.createRedirectPayment.length, 1);
});
