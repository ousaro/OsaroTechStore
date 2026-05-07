import test from "node:test";
import assert from "node:assert/strict";

import {
  toStripeCheckoutSessionDto,
  toStripeWebhookStateChange,
} from "../../../../../../src/infrastructure/providers/payments/stripe/stripePayloadTranslator.js";

test("Stripe checkout session translator returns null for empty sessions", () => {
  assert.equal(toStripeCheckoutSessionDto(null), null);
});

test("Stripe checkout session translator maps optional fields and paid status", () => {
  assert.deepEqual(
    toStripeCheckoutSessionDto({
      id: "sess_1",
      url: "https://stripe.test/session",
      payment_intent: "pi_1",
      payment_status: "paid",
    }),
    {
      id: "sess_1",
      provider: "stripe",
      workflowType: "redirect_session",
      url: "https://stripe.test/session",
      providerPaymentId: "pi_1",
      providerStatus: "paid",
      paymentStatus: "paid",
    }
  );
});

test("Stripe checkout session translator maps non-paid status to pending", () => {
  assert.equal(
    toStripeCheckoutSessionDto({
      id: "sess_1",
      payment_status: "unpaid",
    }).paymentStatus,
    "pending"
  );
});

test("Stripe webhook translator returns null for unsupported or malformed events", () => {
  assert.equal(toStripeWebhookStateChange(null), null);
  assert.equal(toStripeWebhookStateChange({ id: "evt_1", type: "customer.created" }), null);
  assert.equal(
    toStripeWebhookStateChange({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: {} },
    }),
    null
  );
});

test("Stripe webhook translator maps completed sessions", () => {
  const stateChange = toStripeWebhookStateChange({
    id: "evt_1",
    type: "checkout.session.completed",
    created: 1_700_000_000,
    data: {
      object: {
        id: "sess_1",
        payment_intent: "pi_1",
        payment_status: "paid",
      },
    },
  });

  assert.deepEqual(
    {
      ...stateChange,
      occurredAt: stateChange.occurredAt.toISOString(),
    },
    {
      eventId: "evt_1",
      id: "sess_1",
      sessionId: "sess_1",
      provider: "stripe",
      workflowType: "redirect_session",
      providerPaymentId: "pi_1",
      providerStatus: "paid",
      occurredAt: "2023-11-14T22:13:20.000Z",
      paymentStatus: "paid",
    }
  );
});

test("Stripe webhook translator maps expired sessions with payment outcome", () => {
  const stateChange = toStripeWebhookStateChange({
    id: "evt_1",
    type: "checkout.session.expired",
    data: { object: { id: "sess_1" } },
  });

  assert.equal(stateChange.paymentStatus, "failed");
  assert.equal(stateChange.paymentOutcome, "expired");
});
