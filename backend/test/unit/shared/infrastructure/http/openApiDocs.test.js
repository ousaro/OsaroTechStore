import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { createApp } from "../../../../../src/app/createApp.js";
import { registerOpenApiDocs } from "../../../../../src/shared/infrastructure/http/openApiDocs.js";

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

test("OpenAPI docs handlers serve HTML and YAML responses", async () => {
  const app = express();
  registerOpenApiDocs(app);

  const routes = app._router.stack.filter((layer) => layer.route);
  const yamlHandler = routes.find((layer) => layer.route.path === "/api-docs/openapi.yaml")
    .route.stack[0].handle;
  const htmlHandler = routes.find((layer) => layer.route.path === "/api-docs")
    .route.stack[0].handle;

  const yamlResponse = {
    contentType: undefined,
    body: undefined,
    type(value) {
      this.contentType = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
  };
  await yamlHandler({}, yamlResponse, (error) => {
    throw error;
  });

  assert.equal(yamlResponse.contentType, "text/yaml");
  assert.match(yamlResponse.body, /^openapi: 3\.0\.3/);

  const htmlResponse = {
    contentType: undefined,
    body: undefined,
    type(value) {
      this.contentType = value;
      return this;
    },
    send(value) {
      this.body = value;
      return this;
    },
  };
  htmlHandler({}, htmlResponse);

  assert.equal(htmlResponse.contentType, "html");
  assert.match(htmlResponse.body, /SwaggerUIBundle/);
});
