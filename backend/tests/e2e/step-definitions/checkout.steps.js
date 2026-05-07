import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { persistCategory } from "../../shared/factories/categoryFactory.js";
import { persistProduct } from "../../shared/factories/productFactory.js";
import { buildOrderPayload } from "../../shared/factories/orderFactory.js";
import { buildStripeCheckoutWebhook } from "../../shared/mocks/stripeGatewayMock.js";

Given("a product named {string} exists", async function (productName) {
  const category = await persistCategory({
    categoryRepository: this.application.repositories.categoryRepository,
    overrides: { name: `${productName} Category` },
  });
  const product = await persistProduct({
    productRepository: this.application.repositories.productRepository,
    category: category._id.toString(),
    overrides: { name: productName, price: 899, stock: 10, status: "active" },
  });
  this.categories.set(category.name, category);
  this.products.set(productName, product);
});

Given("{word} has started checkout for {string}", async function (name, productName) {
  await placeOrderForProduct.call(this, name, productName);
  assert.equal(this.lastResponse.status(), 201);
  await startCheckoutForLatestOrder.call(this, name);
  assert.equal(this.lastResponse.status(), 201);
});

When("{word} places an order for {string}", async function (name, productName) {
  await placeOrderForProduct.call(this, name, productName);
});

When("{word} starts checkout for the latest order", async function (name) {
  await startCheckoutForLatestOrder.call(this, name);
});

When("Stripe sends a successful checkout webhook", async function () {
  await sendStripeWebhook.call(this, {
    type: "checkout.session.completed",
    paymentStatus: "paid",
  });
});

When("Stripe sends a failed checkout webhook", async function () {
  await sendStripeWebhook.call(this, {
    type: "checkout.session.async_payment_failed",
    paymentStatus: "unpaid",
  });
});

Then("the order should belong to {word}", async function (name) {
  const body = await this.responseJson();
  const user = this.users.get(name);
  assert.equal(body.ownerId, user._id.toString());
  this.orders.set("latest", body);
});

Then("a Stripe checkout session should be returned", async function () {
  const body = await this.responseJson();
  assert.equal(body.provider, "stripe");
  assert.equal(body.workflowType, "redirect_session");
  assert.equal(body.paymentStatus, "pending");
  assert.ok(body.sessionId);
  assert.match(body.url, /^https:\/\/checkout\.stripe\.test/);
  this.payments.set("latest", body);
});

Then("the latest payment should be marked {string}", async function (status) {
  const order = this.orders.get("latest");
  const actor = this.currentActor;
  const response = await this.apiGet(`/api/payments/order/${order._id}`, this.tokenFor(actor));
  assert.equal(response.status(), 200);
  const body = await response.json();
  assert.equal(body.paymentStatus, status);
  this.payments.set("latest", body);
});

Then("the latest order payment should be marked {string}", async function (status) {
  const order = this.orders.get("latest");
  const response = await this.apiGet(`/api/orders/${order._id}`, this.tokenFor(this.currentActor));
  assert.equal(response.status(), 200);
  const body = await response.json();
  assert.equal(body.paymentStatus, status);
});

async function placeOrderForProduct(name, productName) {
  this.setActor(name);
  const product = this.products.get(productName);
  assert.ok(product, `No product named "${productName}" exists`);

  await this.apiPost(
    "/api/orders",
    buildOrderPayload({
      orderLine: {
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: 1,
      },
    }),
    this.tokenFor(name)
  );

  if (this.lastResponse.status() === 201) {
    this.orders.set("latest", await this.responseJson());
  }
}

async function startCheckoutForLatestOrder(name) {
  this.setActor(name);
  const order = this.orders.get("latest");
  const [line] = order.orderLines;
  await this.apiPost(
    "/api/payments/intent",
    {
      orderId: order._id,
      items: [{ name: line.name, price: line.unitPrice.amount, quantity: line.quantity }],
      currency: order.currency,
    },
    this.tokenFor(name)
  );

  if (this.lastResponse.status() === 201) {
    this.payments.set("latest", await this.responseJson());
  }
}

async function sendStripeWebhook({ type, paymentStatus }) {
  const payment = this.payments.get("latest");
  const event = buildStripeCheckoutWebhook({
    type,
    sessionId: payment.sessionId,
    paymentStatus,
  });
  this.lastResponse = await this.api.post("/api/payments/webhook", {
    headers: {
      "content-type": "application/json",
      "stripe-signature": "valid-test-signature",
    },
    data: JSON.stringify(event),
  });
}
