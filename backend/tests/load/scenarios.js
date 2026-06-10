/* global __ENV, __VU */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    product_listing: {
      executor: "constant-vus",
      vus: 20,
      duration: "1m",
      exec: "productListing",
      startTime: "0s",
    },
    product_search: {
      executor: "constant-vus",
      vus: 10,
      duration: "1m",
      exec: "productSearch",
      startTime: "10s",
    },
    auth_flow: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "30s", target: 5 },
        { duration: "10s", target: 0 },
      ],
      exec: "authFlow",
      startTime: "20s",
    },
    checkout: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 3 },
        { duration: "30s", target: 3 },
        { duration: "10s", target: 0 },
      ],
      exec: "checkoutFlow",
      startTime: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

function getAuthHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export function productListing() {
  const res = http.get(`${BASE_URL}/api/products`);

  check(res, {
    "listing status is 200": (r) => r.status === 200,
    "listing returns array": (r) => {
      try {
        return Array.isArray(JSON.parse(r.body));
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);
}

export function productSearch() {
  const res = http.get(`${BASE_URL}/api/products?limit=20&offset=0`);

  check(res, {
    "search status is 200": (r) => r.status === 200,
    "search returns valid JSON": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(0.3);
}

export function authFlow() {
  const userId = `k6scenario${__VU}_${Date.now()}`;
  const email = `${userId}@loadtest.example`;

  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      firstName: `Load${userId}`,
      lastName: "Tester",
      email,
      password: "Password123!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (!check(registerRes, { "register status is 201": (r) => r.status === 201 })) {
    sleep(1);
    return;
  }

  let token;
  try {
    token = JSON.parse(registerRes.body).token;
  } catch {
    sleep(1);
    return;
  }

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: "Password123!" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, { "login status is 200": (r) => r.status === 200 });

  const profileRes = http.get(`${BASE_URL}/api/users/me`, getAuthHeaders(token));

  check(profileRes, {
    "profile status is 200": (r) => r.status === 200,
    "profile email matches": (r) => {
      try {
        return JSON.parse(r.body).email === email;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

export function checkoutFlow() {
  const userId = `k6checkout${__VU}_${Date.now()}`;
  const email = `${userId}@loadtest.example`;

  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      firstName: `Checkout${userId}`,
      lastName: "Tester",
      email,
      password: "Password123!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (registerRes.status !== 201) {
    sleep(2);
    return;
  }

  let token;
  try {
    token = JSON.parse(registerRes.body).token;
  } catch {
    sleep(2);
    return;
  }

  const productsRes = http.get(`${BASE_URL}/api/products`);
  let productId;
  try {
    productId = JSON.parse(productsRes.body)[0]?._id;
  } catch {
    sleep(2);
    return;
  }
  if (!productId) {
    sleep(2);
    return;
  }

  const orderRes = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify({
      orderLine: { productId, name: "Load Test Product", price: 99, quantity: 1 },
    }),
    getAuthHeaders(token)
  );

  check(orderRes, { "order status is 201": (r) => r.status === 201 });

  let orderId;
  try {
    orderId = JSON.parse(orderRes.body)._id;
  } catch {
    sleep(2);
    return;
  }

  const paymentRes = http.post(
    `${BASE_URL}/api/payments/intent`,
    JSON.stringify({
      orderId,
      items: [{ name: "Load Test Product", price: 99, quantity: 1 }],
      currency: "USD",
    }),
    getAuthHeaders(token)
  );

  check(paymentRes, {
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

  sleep(2);
}
