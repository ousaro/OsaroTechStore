import { afterEach, describe, it } from "mocha";
import { expect } from "chai";
import express from "express";
import { PassThrough } from "stream";
import { createSelectiveBodyParser } from "../../app/createApp.js";
import { createPaymentsRoutes } from "../../modules/payments/adapters/input/http/paymentsRoutes.js";

const paymentsRoutes = createPaymentsRoutes({
  requireAuth: (_req, _res, next) => next(),
});

const getWebhookRouteLayers = () => {
  const webhookRouteLayer = paymentsRoutes.stack.find((layer) => layer.route?.path === "/webhook");
  if (!webhookRouteLayer) {
    throw new Error("Webhook route layer not found");
  }

  return webhookRouteLayer.route.stack;
};

const runMiddleware = (middleware, req, res) => {
  return new Promise((resolve, reject) => {
    middleware(req, res, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

describe("createApp", () => {
  let originalWebhookHandler = null;

  afterEach(() => {
    if (originalWebhookHandler) {
      const routeLayers = getWebhookRouteLayers();
      routeLayers[routeLayers.length - 1].handle = originalWebhookHandler;
      originalWebhookHandler = null;
    }
  });

  it("preserves the raw request body for the Stripe webhook route", async () => {
    const routeLayers = getWebhookRouteLayers();
    const rawBodyMiddleware = routeLayers[0].handle;
    const webhookHandlerLayer = routeLayers[routeLayers.length - 1];
    originalWebhookHandler = webhookHandlerLayer.handle;

    const selectiveJsonParser = createSelectiveBodyParser(express.json({ limit: "50mb" }));
    const rawPayload = JSON.stringify({ event: "checkout.session.completed" });
    const req = new PassThrough();
    req.method = "POST";
    req.url = "/api/webhook";
    req.path = "/api/webhook";
    req.headers = {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(rawPayload)),
    };

    const captured = {};
    const res = {
      status(code) {
        captured.statusCode = code;
        return this;
      },
      json(body) {
        captured.body = body;
        return this;
      },
    };

    webhookHandlerLayer.handle = (request, response) => {
      return response.status(200).json({
        isBuffer: Buffer.isBuffer(request.body),
        rawBody: request.body.toString("utf8"),
      });
    };

    req.end(rawPayload);

    await runMiddleware(selectiveJsonParser, req, res);
    await runMiddleware(rawBodyMiddleware, req, res);
    await webhookHandlerLayer.handle(req, res);

    expect(captured).to.deep.equal({
      statusCode: 200,
      body: {
        isBuffer: true,
        rawBody: rawPayload,
      },
    });
  });
});
