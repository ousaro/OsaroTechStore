import test from "node:test";
import assert from "node:assert/strict";
import { createIntegrationTestContext } from "../../shared/utils/integrationTestContext.js";
import { persistUser } from "../../shared/factories/userFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";
import {
  buildStripeCheckoutWebhook,
  createStripeGatewayMock,
} from "../../shared/mocks/stripeGatewayMock.js";

const stripeGateway = createStripeGatewayMock();
const ctx = createIntegrationTestContext({ paymentGateway: stripeGateway });

const tokenFor = (user) => ctx.application.tokenService.signUserId(user._id);

test("OrderPlaced event links a payment workflow without an explicit payments request", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });
  const gatewayCallCount = stripeGateway.calls.createRedirectPayment.length;

  const orderResponse = await ctx.client.agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send(
      buildOrderPayload({
        orderLine: { productId: "monitor-1", name: "Monitor", price: 300, quantity: 2 },
      })
    )
    .expect(201);

  assert.equal(stripeGateway.calls.createRedirectPayment.length, gatewayCallCount + 1);
  assert.deepEqual(stripeGateway.calls.createRedirectPayment.at(-1).items, [
    { name: "Monitor", price: 300, quantity: 2 },
  ]);

  const paymentResponse = await ctx.client.agent
    .get(`/api/payments/order/${orderResponse.body._id}`)
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .expect(200);

  assert.equal(paymentResponse.body.orderId, orderResponse.body._id);
  assert.equal(paymentResponse.body.paymentStatus, "pending");
});

test("PaymentFailed and PaymentExpired events cancel linked orders", async () => {
  const user = await persistUser({
    authUserRepository: ctx.application.repositories.authUserRepository,
  });

  for (const { type, paymentStatus } of [
    { type: "checkout.session.async_payment_failed", paymentStatus: "failed" },
    { type: "checkout.session.expired", paymentStatus: "expired" },
  ]) {
    const orderResponse = await ctx.client.agent
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(buildOrderPayload())
      .expect(201);

    const paymentResponse = await ctx.client.agent
      .get(`/api/payments/order/${orderResponse.body._id}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .expect(200);

    const event = buildStripeCheckoutWebhook({
      type,
      sessionId: paymentResponse.body.sessionId,
      paymentStatus,
    });

    await ctx.client.agent
      .post("/api/payments/webhook")
      .set("stripe-signature", "valid-test-signature")
      .set("content-type", "application/json")
      .send(JSON.stringify(event))
      .expect(200);

    const orderAfterWebhook = await ctx.client.agent
      .get(`/api/orders/${orderResponse.body._id}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .expect(200);

    assert.equal(orderAfterWebhook.body.paymentStatus, paymentStatus);
    assert.equal(orderAfterWebhook.body.orderStatus, "cancelled");
  }
});
