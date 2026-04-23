import { afterEach, describe, it } from "mocha";
import { expect } from "chai";

const envKeys = [
  "NODE_ENV",
  "MONGO_URI",
  "SESSION_SECRET",
  "TOKEN_SECRET",
  "CLIENT_URL",
  "STRIPE_SECTET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

const restoreEnv = () => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
};

describe("paymentsRoutes without Stripe configuration", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("returns 503 for payment intent creation when Stripe is disabled", async () => {
    process.env.NODE_ENV = "development";
    process.env.MONGO_URI = "mongodb://127.0.0.1:27017/osarotechstore-dev";
    process.env.SESSION_SECRET = "dev-session-secret";
    process.env.TOKEN_SECRET = "dev-token-secret";
    process.env.CLIENT_URL = "http://localhost:3000";
    delete process.env.STRIPE_SECTET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const { createPaymentsRoutes } = await import(
      `../../../modules/payments/adapters/input/http/paymentsRoutes.js?case=no-stripe-${Date.now()}`
    );

    const paymentsRoutes = createPaymentsRoutes({
      requireAuth: (_req, _res, next) => next(),
    });
    const createPaymentIntentRouteLayer = paymentsRoutes.stack.find(
      (layer) => layer.route?.path === "/create-payment-intent"
    );
    expect(createPaymentIntentRouteLayer).to.exist;

    const responseState = {};
    const res = {
      status(code) {
        responseState.status = code;
        return this;
      },
      json(body) {
        responseState.body = body;
        return this;
      },
    };

    createPaymentIntentRouteLayer.route.stack[0].handle({}, res);

    expect(responseState).to.deep.equal({
      status: 503,
      body: {
        message: "Stripe payments are not configured for this environment",
      },
    });
  });
});
