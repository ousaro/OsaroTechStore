/* global __ENV */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

export const options = {
  vus: 3,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    checkout_failures: ["rate<0.05"],
    payment_intent_failures: ["rate<0.05"],
  },
};

const checkoutFailureRate = new Rate("checkout_failures");
const paymentIntentFailureRate = new Rate("payment_intent_failures");
const createOrderTrend = new Trend("create_order_duration");
const paymentIntentTrend = new Trend("payment_intent_duration");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export function setup() {
  const registerPayload = JSON.stringify({
    firstName: "CheckoutSetup",
    lastName: "User",
    email: `checkout-setup-${Date.now()}@loadtest.example`,
    password: "Password123!",
  });

  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { "Content-Type": "application/json" },
  });

  const token = JSON.parse(registerRes.body).token;

  const productsRes = http.get(`${BASE_URL}/api/products`);
  const products = JSON.parse(productsRes.body);

  return {
    token,
    productId: products.length > 0 ? products[0]._id || products[0].id : null,
  };
}

export default function (data) {
  if (!data.productId) {
    sleep(1);
    return;
  }

  const authHeader = {
    headers: {
      Authorization: `Bearer ${data.token}`,
      "Content-Type": "application/json",
    },
  };

  const orderPayload = JSON.stringify({
    orderLine: {
      productId: data.productId,
      name: "Load Test Product",
      price: 99,
      quantity: 1,
    },
  });

  const orderRes = http.post(`${BASE_URL}/api/orders`, orderPayload, authHeader);

  const orderOk = check(orderRes, {
    "order status is 201": (r) => r.status === 201,
    "order has ownerId": (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.ownerId === "string";
      } catch {
        return false;
      }
    },
  });

  checkoutFailureRate.add(!orderOk);
  createOrderTrend.add(orderRes.timings.duration);

  if (!orderOk) {
    sleep(1);
    return;
  }

  let orderId;
  try {
    orderId = JSON.parse(orderRes.body)._id || JSON.parse(orderRes.body).id;
  } catch {
    sleep(1);
    return;
  }

  const paymentPayload = JSON.stringify({
    orderId,
    items: [{ name: "Load Test Product", price: 99, quantity: 1 }],
    currency: "USD",
  });

  const paymentRes = http.post(`${BASE_URL}/api/payments/intent`, paymentPayload, authHeader);

  const paymentOk = check(paymentRes, {
    "payment intent status is 201": (r) => r.status === 201,
    "payment returns session": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.provider === "stripe" && typeof body.sessionId === "string";
      } catch {
        return false;
      }
    },
  });

  paymentIntentFailureRate.add(!paymentOk);
  paymentIntentTrend.add(paymentRes.timings.duration);

  sleep(2);
}
