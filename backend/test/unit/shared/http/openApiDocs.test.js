import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { createApp } from "../../../../src/app/createApp.js";
import { registerOpenApiDocs } from "../../../../src/shared/infrastructure/http/openApiDocs.js";

const emptyRoutes = () => express.Router();

const appDeps = {
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
  tokenService: { verify: async () => ({ _id: "u1" }) },
  authUserRepository: { findById: async () => ({ _id: "u1" }) },
  authRoutes: emptyRoutes,
  usersRoutes: emptyRoutes,
  productsRoutes: emptyRoutes,
  categoriesRoutes: emptyRoutes,
  ordersRoutes: emptyRoutes,
  paymentsRoutes: emptyRoutes,
};

const listRoutes = (app) =>
  app._router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

test("registerOpenApiDocs registers Swagger UI and raw spec routes", () => {
  const app = express();
  registerOpenApiDocs(app);

  const routes = listRoutes(app);

  assert.deepEqual(routes, [
    { path: "/api-docs/openapi.yaml", methods: ["get"] },
    { path: "/api-docs", methods: ["get"] },
  ]);
});

test("createApp mounts Swagger docs before not-found middleware", () => {
  const app = createApp(appDeps);
  const routes = listRoutes(app).map((route) => route.path);

  assert.equal(routes.includes("/api-docs"), true);
  assert.equal(routes.includes("/api-docs/openapi.yaml"), true);
});
