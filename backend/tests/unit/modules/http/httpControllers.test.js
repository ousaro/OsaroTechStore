import test from "node:test";
import assert from "node:assert/strict";

import { createAuthHttpController } from "../../../../src/modules/auth/adapters/input/http/authHttpController.js";
import { createProductsHttpController } from "../../../../src/modules/products/adapters/input/http/productsHttpController.js";
import { createCategoriesHttpController } from "../../../../src/modules/categories/adapters/input/http/categoriesHttpController.js";
import { createOrdersHttpController } from "../../../../src/modules/orders/adapters/input/http/ordersHttpController.js";
import { createUsersHttpController } from "../../../../src/modules/users/adapters/input/http/usersHttpController.js";
import { createPaymentsHttpController } from "../../../../src/modules/payments/adapters/input/http/paymentsHttpController.js";
import { ApplicationValidationError } from "../../../../src/shared/application/errors/index.js";

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  redirectUrl: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  redirect(url) {
    this.redirectUrl = url;
    return this;
  },
});

const runHandler = async (handler, req = {}) => {
  const res = createResponse();
  const errors = [];
  handler({ params: {}, query: {}, body: {}, headers: {}, ...req }, res, (error) =>
    errors.push(error)
  );
  await new Promise((resolve) => setImmediate(resolve));
  if (errors[0]) throw errors[0];
  return res;
};

const fn = (returnValue) => async () => returnValue;

test("async controllers forward thrown application errors to the error chain", async () => {
  const controller = createProductsHttpController({
    productsInputPort: {
      getAllProducts: fn([]),
      getProductById: async () => {
        throw new ApplicationValidationError("Product id is invalid");
      },
      addProduct: fn({}),
      updateProduct: fn({}),
      deleteProduct: fn({}),
      addProductReview: fn({}),
      removeProductsByCategory: fn(0),
    },
  });

  await assert.rejects(() => runHandler(controller.getProductById, { params: { id: "" } }), {
    name: "ApplicationValidationError",
    message: "Product id is invalid",
    code: "VALIDATION",
  });
});

test("auth controller maps public and admin handlers to input port calls", async () => {
  const calls = [];
  const controller = createAuthHttpController({
    authInputPort: {
      registerUser: async (payload) => {
        calls.push(["registerUser", payload]);
        return { token: "registered" };
      },
      loginUser: async (payload) => {
        calls.push(["loginUser", payload]);
        return { token: "logged-in" };
      },
      listUsers: fn([{ _id: "u1" }]),
      getUser: async (payload) => {
        calls.push(["getUser", payload]);
        return { _id: payload.id };
      },
      updateUser: async (payload) => {
        calls.push(["updateUser", payload]);
        return { _id: payload.id, ...payload.updates };
      },
      deleteUser: async (payload) => {
        calls.push(["deleteUser", payload]);
        return { _id: payload.id };
      },
    },
  });

  assert.equal(
    (await runHandler(controller.registerUser, { body: { email: "a@test.com" } })).statusCode,
    201
  );
  assert.equal(
    (await runHandler(controller.loginUser, { body: { email: "a@test.com" } })).statusCode,
    200
  );
  assert.deepEqual((await runHandler(controller.listUsers)).body, [{ _id: "u1" }]);
  assert.deepEqual((await runHandler(controller.getUser, { params: { id: "u1" } })).body, {
    _id: "u1",
  });
  assert.deepEqual(
    (await runHandler(controller.updateUser, { params: { id: "u1" }, body: { city: "Casa" } }))
      .body,
    { _id: "u1", city: "Casa" }
  );
  assert.deepEqual((await runHandler(controller.deleteUser, { params: { id: "u1" } })).body, {
    _id: "u1",
  });
  assert.deepEqual(
    calls.map(([name]) => name),
    ["registerUser", "loginUser", "getUser", "updateUser", "deleteUser"]
  );
});

test("auth oauthCallback redirects authenticated and unauthenticated requests", () => {
  const controller = createAuthHttpController({
    authInputPort: {
      registerUser: fn({}),
      loginUser: fn({}),
      listUsers: fn([]),
      getUser: fn({}),
      updateUser: fn({}),
      deleteUser: fn({}),
    },
  });

  const authenticated = createResponse();
  controller.oauthCallback(
    {
      isAuthenticated: () => true,
      user: { _id: "u1" },
      app: { locals: { clientUrl: "http://client.test" } },
    },
    authenticated
  );
  assert.match(authenticated.redirectUrl, /^http:\/\/client\.test\/SetPassword\?user=/);

  const anonymous = createResponse();
  controller.oauthCallback(
    {
      isAuthenticated: () => false,
      app: { locals: { clientUrl: "http://client.test" } },
    },
    anonymous
  );
  assert.equal(anonymous.redirectUrl, "http://client.test/login");
});

test("products controller maps params, query, body, and status codes", async () => {
  const calls = [];
  const controller = createProductsHttpController({
    productsInputPort: {
      getAllProducts: async (payload) => {
        calls.push(["getAllProducts", payload]);
        return ["p1"];
      },
      getProductById: async (payload) => {
        calls.push(["getProductById", payload]);
        return { _id: payload.id };
      },
      addProduct: async (payload) => {
        calls.push(["addProduct", payload]);
        return { _id: "p1" };
      },
      updateProduct: async (payload) => {
        calls.push(["updateProduct", payload]);
        return { _id: payload.id, ...payload.updates };
      },
      addProductReview: async (payload) => {
        calls.push(["addProductReview", payload]);
        return { _id: payload.id, reviews: [{ comment: payload.comment }] };
      },
      deleteProduct: async (payload) => {
        calls.push(["deleteProduct", payload]);
        return { _id: payload.id };
      },
      removeProductsByCategory: fn(0),
    },
  });

  assert.deepEqual(
    (await runHandler(controller.getAllProducts, { query: { category: "c1", status: "active" } }))
      .body,
    ["p1"]
  );
  assert.deepEqual((await runHandler(controller.getProductById, { params: { id: "p1" } })).body, {
    _id: "p1",
  });
  assert.equal(
    (await runHandler(controller.addProduct, { body: { name: "Keyboard" } })).statusCode,
    201
  );
  assert.deepEqual(
    (await runHandler(controller.updateProduct, { params: { id: "p1" }, body: { stock: 2 } })).body,
    { _id: "p1", stock: 2 }
  );
  assert.equal(
    (
      await runHandler(controller.addProductReview, {
        params: { id: "p1" },
        user: { _id: "u1" },
        body: { rating: 5, comment: "Great" },
      })
    ).statusCode,
    201
  );
  assert.deepEqual((await runHandler(controller.deleteProduct, { params: { id: "p1" } })).body, {
    _id: "p1",
  });
  assert.deepEqual(calls[0], ["getAllProducts", { category: "c1", status: "active" }]);
});

test("categories controller maps CRUD handlers", async () => {
  const controller = createCategoriesHttpController({
    categoriesInputPort: {
      getAllCategories: fn(["c1"]),
      getCategoryById: async ({ id }) => ({ _id: id }),
      addCategory: async (body) => ({ _id: "c1", ...body }),
      updateCategory: async ({ id, updates }) => ({ _id: id, ...updates }),
      deleteCategory: async ({ id }) => ({ _id: id }),
    },
  });

  assert.deepEqual((await runHandler(controller.getAllCategories)).body, ["c1"]);
  assert.deepEqual((await runHandler(controller.getCategoryById, { params: { id: "c1" } })).body, {
    _id: "c1",
  });
  assert.equal(
    (await runHandler(controller.addCategory, { body: { name: "Accessories" } })).statusCode,
    201
  );
  assert.deepEqual(
    (await runHandler(controller.updateCategory, { params: { id: "c1" }, body: { name: "Tech" } }))
      .body,
    { _id: "c1", name: "Tech" }
  );
  assert.deepEqual((await runHandler(controller.deleteCategory, { params: { id: "c1" } })).body, {
    _id: "c1",
  });
});

test("orders controller maps user, params, query, body, and default currency", async () => {
  const calls = [];
  const controller = createOrdersHttpController({
    ordersInputPort: {
      getAllOrders: async (payload) => {
        calls.push(["getAllOrders", payload]);
        return ["o1"];
      },
      getOrderById: async ({ id }) => ({ _id: id }),
      addOrder: async (payload) => {
        calls.push(["addOrder", payload]);
        return { _id: "o1" };
      },
      updateOrder: async ({ id, updates }) => ({ _id: id, ...updates }),
      deleteOrder: async ({ id }) => ({ _id: id }),
      confirmOrderPayment: fn({}),
    },
  });

  assert.deepEqual((await runHandler(controller.getAllOrders, { query: { ownerId: "u1" } })).body, [
    "o1",
  ]);
  assert.deepEqual((await runHandler(controller.getOrderById, { params: { id: "o1" } })).body, {
    _id: "o1",
  });
  assert.equal(
    (
      await runHandler(controller.addOrder, {
        user: { _id: "u1" },
        body: { orderLines: [], deliveryAddress: {} },
      })
    ).statusCode,
    201
  );
  assert.deepEqual(calls[1], [
    "addOrder",
    { ownerId: "u1", orderLines: [], deliveryAddress: {}, currency: "USD" },
  ]);
  assert.deepEqual(
    (
      await runHandler(controller.updateOrder, {
        params: { id: "o1" },
        body: { orderStatus: "shipped" },
      })
    ).body,
    { _id: "o1", orderStatus: "shipped" }
  );
  assert.deepEqual((await runHandler(controller.deleteOrder, { params: { id: "o1" } })).body, {
    _id: "o1",
  });
});

test("users controller maps authenticated user actions", async () => {
  const calls = [];
  const controller = createUsersHttpController({
    usersInputPort: {
      getUserProfile: async (payload) => {
        calls.push(["getUserProfile", payload]);
        return { _id: payload.targetId ?? payload.requesterId };
      },
      updateUserProfile: async (payload) => {
        calls.push(["updateUserProfile", payload]);
        return { _id: payload.requesterId, ...payload.updates };
      },
      updateUserCart: async (payload) => {
        calls.push(["updateUserCart", payload]);
        return { cart: payload.cart };
      },
      updateUserFavorites: async (payload) => {
        calls.push(["updateUserFavorites", payload]);
        return { favorites: [payload.productId] };
      },
    },
  });

  assert.deepEqual((await runHandler(controller.getMyProfile, { user: { _id: "u1" } })).body, {
    _id: "u1",
  });
  assert.deepEqual(
    (await runHandler(controller.getUserById, { user: { _id: "admin" }, params: { id: "u2" } }))
      .body,
    { _id: "u2" }
  );
  assert.deepEqual(
    (await runHandler(controller.updateProfile, { user: { _id: "u1" }, body: { city: "Casa" } }))
      .body,
    { _id: "u1", city: "Casa" }
  );
  assert.deepEqual(
    (
      await runHandler(controller.updateCart, {
        user: { _id: "u1" },
        body: { cart: [{ productId: "p1" }] },
      })
    ).body,
    { cart: [{ productId: "p1" }] }
  );
  assert.deepEqual(
    (
      await runHandler(controller.updateFavorites, {
        user: { _id: "u1" },
        params: { productId: "p1" },
        body: { action: "add" },
      })
    ).body,
    { favorites: ["p1"] }
  );
  assert.deepEqual(calls.at(-1), [
    "updateUserFavorites",
    { userId: "u1", productId: "p1", action: "add" },
  ]);
});

test("payments controller maps intent, webhook, and order lookup handlers", async () => {
  const calls = [];
  const controller = createPaymentsHttpController({
    paymentsInputPort: {
      createPaymentIntent: async (payload) => {
        calls.push(["createPaymentIntent", payload]);
        return { _id: "pay1" };
      },
      verifyWebhook: async (payload) => {
        calls.push(["verifyWebhook", payload]);
        return { received: true };
      },
      getPaymentByOrderId: async (payload) => {
        calls.push(["getPaymentByOrderId", payload]);
        return { orderId: payload.orderId };
      },
      linkPaymentToOrder: fn(null),
    },
  });

  assert.equal(
    (await runHandler(controller.createPaymentIntent, { body: { orderId: "o1", items: [] } }))
      .statusCode,
    201
  );
  const rawBody = Buffer.from("{}");
  assert.deepEqual(
    (
      await runHandler(controller.verifyWebhook, {
        rawBody,
        headers: { "stripe-signature": "sig" },
      })
    ).body,
    { received: true }
  );
  assert.deepEqual(
    (await runHandler(controller.getPaymentByOrderId, { params: { orderId: "o1" } })).body,
    { orderId: "o1" }
  );
  assert.deepEqual(calls[0], [
    "createPaymentIntent",
    { orderId: "o1", items: [], currency: "USD" },
  ]);
  assert.deepEqual(calls[1], ["verifyWebhook", { rawBody, signature: "sig" }]);
});
