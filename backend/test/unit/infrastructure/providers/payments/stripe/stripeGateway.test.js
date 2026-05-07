import test from "node:test";
import assert from "node:assert/strict";

import { createStripeGateway } from "../../../../../../src/infrastructure/providers/payments/stripe/stripeGateway.js";

test("Stripe gateway requires a secret key", () => {
  assert.throws(() => createStripeGateway({ secretKey: "" }));
});

test("Stripe gateway requires webhook secret before verifying webhooks", () => {
  const gateway = createStripeGateway({
    secretKey: "sk_test_123",
    logger: { debug: () => {}, info: () => {} },
  });

  assert.throws(
    () => gateway.verifyWebhook(Buffer.from("{}"), "sig"),
    /STRIPE_WEBHOOK_SECRET is required/
  );
});
