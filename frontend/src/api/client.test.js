/* eslint-disable import/first -- jest.mock must precede imports */
jest.mock("./env.js", () => ({
  env: Object.freeze({
    apiBaseUrl: "/api",
    googleAuthUrl: "/api/auth/google",
    stripePublicKey: "",
    nodeEnv: "test",
    isDev: false,
  }),
}));

import { httpClient } from "./client.js";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("httpClient serializes JSON bodies and attaches bearer tokens", async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 201,
    text: async () => JSON.stringify({ id: "order-1" }),
  });

  const result = await httpClient("/orders", {
    method: "POST",
    body: { productId: "product-1" },
    token: "token-1",
  });

  expect(fetch).toHaveBeenCalledWith("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token-1",
    },
    body: JSON.stringify({ productId: "product-1" }),
  });
  expect(result).toEqual({
    data: { id: "order-1" },
    error: null,
    ok: true,
    status: 201,
  });
});

test("httpClient returns normalized API errors", async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 500,
    text: async () => JSON.stringify({ error: { message: "Server unavailable" } }),
  });

  await expect(httpClient("/products")).resolves.toEqual({
    data: { error: { message: "Server unavailable" } },
    error: "Server unavailable",
    ok: false,
    status: 500,
  });
});

test("httpClient handles network failures without throwing", async () => {
  fetch.mockRejectedValue(new Error("Failed to fetch"));

  await expect(httpClient("/products")).resolves.toEqual({
    data: null,
    error: "Failed to fetch",
    ok: false,
    status: 0,
  });
});
