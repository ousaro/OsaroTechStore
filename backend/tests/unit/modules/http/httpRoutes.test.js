import test from "node:test";
import assert from "node:assert/strict";

import { createAuthRoutes } from "../../../../src/modules/auth/adapters/input/http/authRoutes.js";
import { createProductsRoutes } from "../../../../src/modules/products/adapters/input/http/productsRoutes.js";
import { createCategoriesRoutes } from "../../../../src/modules/categories/adapters/input/http/categoriesRoutes.js";
import { createOrdersRoutes } from "../../../../src/modules/orders/adapters/input/http/ordersRoutes.js";
import { createUsersRoutes } from "../../../../src/modules/users/adapters/input/http/usersRoutes.js";
import { createPaymentsRoutes } from "../../../../src/modules/payments/adapters/input/http/paymentsRoutes.js";

const handler = (_req, _res, next) => next?.();
const requireAuth = Object.assign(handler, { requireAdmin: handler });

const routeSummary = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
      handlerCount: layer.route.stack.length,
    }));

test("auth routes register public, admin, and disabled OAuth endpoints", () => {
  const controller = {
    registerUser: handler,
    loginUser: handler,
    listUsers: handler,
    getUser: handler,
    updateUser: handler,
    deleteUser: handler,
    oauthCallback: handler,
  };
  const router = createAuthRoutes({
    controller,
    requireAuth,
    oauthProviders: { google: { enabled: false, configured: false } },
    clientUrl: "http://client.test",
  });

  assert.deepEqual(routeSummary(router), [
    { path: "/register", methods: ["post"], handlerCount: 2 },
    { path: "/login", methods: ["post"], handlerCount: 2 },
    { path: "/users", methods: ["get"], handlerCount: 3 },
    { path: "/users/:id", methods: ["get"], handlerCount: 3 },
    { path: "/users/:id", methods: ["put"], handlerCount: 3 },
    { path: "/users/:id", methods: ["delete"], handlerCount: 3 },
    { path: "/google", methods: ["get"], handlerCount: 1 },
    { path: "/google/callback", methods: ["get"], handlerCount: 1 },
  ]);
});

test("products and categories routes expose public reads and protected writes", () => {
  const productController = {
    getAllProducts: handler,
    getProductById: handler,
    addProduct: handler,
    addProductReview: handler,
    updateProduct: handler,
    deleteProduct: handler,
  };
  const categoryController = {
    getAllCategories: handler,
    getCategoryById: handler,
    addCategory: handler,
    updateCategory: handler,
    deleteCategory: handler,
  };

  assert.deepEqual(
    routeSummary(createProductsRoutes({ controller: productController, requireAuth })),
    [
      { path: "/", methods: ["get"], handlerCount: 1 },
      { path: "/uploads", methods: ["post"], handlerCount: 4 },
      { path: "/:id", methods: ["get"], handlerCount: 1 },
      { path: "/", methods: ["post"], handlerCount: 3 },
      { path: "/:id/reviews", methods: ["post"], handlerCount: 2 },
      { path: "/:id", methods: ["put"], handlerCount: 3 },
      { path: "/:id", methods: ["delete"], handlerCount: 3 },
    ]
  );
  assert.deepEqual(
    routeSummary(createCategoriesRoutes({ controller: categoryController, requireAuth })),
    [
      { path: "/", methods: ["get"], handlerCount: 1 },
      { path: "/:id", methods: ["get"], handlerCount: 1 },
      { path: "/", methods: ["post"], handlerCount: 3 },
      { path: "/:id", methods: ["put"], handlerCount: 3 },
      { path: "/:id", methods: ["delete"], handlerCount: 3 },
    ]
  );
});

test("orders and users routes mount router-level auth and expected handlers", () => {
  const ordersController = {
    getAllOrders: handler,
    getOrderById: handler,
    addOrder: handler,
    updateOrder: handler,
    deleteOrder: handler,
  };
  const usersController = {
    getMyProfile: handler,
    getUserById: handler,
    updateProfile: handler,
    updatePassword: handler,
    updateCart: handler,
    updateFavorites: handler,
  };

  const ordersRouter = createOrdersRoutes({ controller: ordersController, requireAuth });
  const usersRouter = createUsersRoutes({ controller: usersController, requireAuth });

  assert.equal(ordersRouter.stack[0].name, "handler");
  assert.deepEqual(routeSummary(ordersRouter), [
    { path: "/", methods: ["get"], handlerCount: 1 },
    { path: "/:id", methods: ["get"], handlerCount: 1 },
    { path: "/", methods: ["post"], handlerCount: 1 },
    { path: "/:id", methods: ["put"], handlerCount: 1 },
    { path: "/:id", methods: ["delete"], handlerCount: 1 },
  ]);
  assert.equal(usersRouter.stack[0].name, "handler");
  assert.deepEqual(routeSummary(usersRouter), [
    { path: "/me", methods: ["get"], handlerCount: 1 },
    { path: "/:id", methods: ["get"], handlerCount: 2 },
    { path: "/me", methods: ["put"], handlerCount: 1 },
    { path: "/me/password", methods: ["put"], handlerCount: 1 },
    { path: "/me/cart", methods: ["put"], handlerCount: 1 },
    { path: "/me/favorites/:productId", methods: ["put"], handlerCount: 1 },
  ]);
});

test("payments routes expose webhook only when enabled and protect user routes", () => {
  const controller = {
    verifyWebhook: handler,
    createPaymentIntent: handler,
    getPaymentByOrderId: handler,
  };

  assert.deepEqual(
    routeSummary(
      createPaymentsRoutes({
        controller,
        requireAuth,
        webhookEnabled: false,
      })
    ),
    [
      { path: "/intent", methods: ["post"], handlerCount: 2 },
      { path: "/order/:orderId", methods: ["get"], handlerCount: 2 },
    ]
  );

  assert.deepEqual(
    routeSummary(
      createPaymentsRoutes({
        controller,
        requireAuth,
        webhookEnabled: true,
      })
    ),
    [
      { path: "/webhook", methods: ["post"], handlerCount: 3 },
      { path: "/intent", methods: ["post"], handlerCount: 2 },
      { path: "/order/:orderId", methods: ["get"], handlerCount: 2 },
    ]
  );
});
