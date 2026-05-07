import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../shared/utils/integrationTestContext.js";
import { persistUser } from "../shared/factories/userFactory.js";
import { persistCategory } from "../shared/factories/categoryFactory.js";
import { persistProduct } from "../shared/factories/productFactory.js";
import { buildOrderPayload } from "../shared/factories/orderFactory.js";
import {
  buildStripeCheckoutWebhook,
  createStripeGatewayMock,
} from "../shared/mocks/stripeGatewayMock.js";

const stripeGateway = createStripeGatewayMock();
const ctx = createIntegrationTestContext({ paymentGateway: stripeGateway });

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("authenticated user can place an order and create a payment intent", async () => {
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

  const orderPayload = buildOrderPayload({
    orderLine: {
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity: 2,
    },
  });

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(orderPayload)
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
});

test("Stripe webhook updates payment state and synchronizes order payment status", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(buildOrderPayload())
    .expect(201);

  const paymentResponse = await ctx.client.agent
    .post("/api/payments/intent")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({
      orderId: orderResponse.body._id,
      items: [{ name: "Phone", price: 699, quantity: 1 }],
    })
    .expect(201);

  const event = buildStripeCheckoutWebhook({
    sessionId: paymentResponse.body.sessionId,
    paymentStatus: "paid",
  });

  await ctx.client.agent
    .post("/api/payments/webhook")
    .set("stripe-signature", "valid-test-signature")
    .set("content-type", "application/json")
    .send(JSON.stringify(event))
    .expect(200);

  const payment = await ctx.client.agent
    .get(`/api/payments/order/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(200);
  assert.equal(payment.body.paymentStatus, "paid");

  const order = await ctx.client.agent
    .get(`/api/orders/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(200);
  assert.equal(order.body.paymentStatus, "paid");
});

test("Stripe webhook rejects invalid signatures without mutating payment state", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(buildOrderPayload())
    .expect(201);
  const paymentResponse = await ctx.client.agent
    .post("/api/payments/intent")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({
      orderId: orderResponse.body._id,
      items: [{ name: "Phone", price: 699, quantity: 1 }],
    })
    .expect(201);

  const event = buildStripeCheckoutWebhook({ sessionId: paymentResponse.body.sessionId });
  await ctx.client.agent
    .post("/api/payments/webhook")
    .set("stripe-signature", "invalid")
    .set("content-type", "application/json")
    .send(JSON.stringify(event))
    .expect(500);

  const payment = await ctx.client.agent
    .get(`/api/payments/order/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(200);
  assert.equal(payment.body.paymentStatus, "pending");
});
