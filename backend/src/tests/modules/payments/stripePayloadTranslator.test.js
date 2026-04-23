import { describe, it } from "mocha";
import { expect } from "chai";
import {
  toStripeCheckoutSessionDto,
  toStripeWebhookStateChange,
} from "../../../modules/payments/infrastructure/gateways/stripePayloadTranslator.js";

describe("stripe payload translator", () => {
  it("translates checkout session payloads into provider-agnostic payment workflows", () => {
    expect(
      toStripeCheckoutSessionDto({
        id: "cs_test_123",
        url: "https://stripe.test/session",
        payment_intent: "pi_123",
        payment_status: "paid",
      })
    ).to.deep.equal({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      url: "https://stripe.test/session",
      providerPaymentId: "pi_123",
      providerStatus: "paid",
      paymentStatus: "paid",
    });
  });

  it("translates webhook payloads into provider-neutral state changes", () => {
    expect(
      toStripeWebhookStateChange({
        id: "evt_test_123",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            payment_intent: "pi_123",
          },
        },
        created: 1713780000,
      })
    ).to.deep.include({
      eventId: "evt_test_123",
      id: "cs_test_123",
      sessionId: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      providerPaymentId: "pi_123",
      paymentStatus: "paid",
    });
  });

  it("distinguishes expired checkout sessions from generic payment failures", () => {
    expect(
      toStripeWebhookStateChange({
        id: "evt_test_expired",
        type: "checkout.session.expired",
        data: {
          object: {
            id: "cs_test_124",
          },
        },
        created: 1713780001,
      })
    ).to.deep.include({
      eventId: "evt_test_expired",
      id: "cs_test_124",
      sessionId: "cs_test_124",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "failed",
      paymentOutcome: "expired",
    });
  });

  it("returns null for unsupported or incomplete webhook payloads", () => {
    expect(
      toStripeWebhookStateChange({
        id: "",
        type: "payment_intent.created",
        data: {
          object: {},
        },
      })
    ).to.equal(null);
  });
});
