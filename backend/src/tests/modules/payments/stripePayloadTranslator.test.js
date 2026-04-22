import { describe, it } from "mocha";
import { expect } from "chai";
import {
  toStripeCheckoutSessionDto,
  toStripeWebhookStateChange,
} from "../../../modules/payments/infrastructure/gateways/stripePayloadTranslator.js";

describe("stripe payload translator", () => {
  it("translates checkout session payloads into stable payment DTOs", () => {
    expect(
      toStripeCheckoutSessionDto({
        id: "cs_test_123",
        url: "https://stripe.test/session",
        payment_intent: "pi_123",
        payment_status: "paid",
      })
    ).to.deep.equal({
      id: "cs_test_123",
      url: "https://stripe.test/session",
      providerTransactionId: "pi_123",
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
      sessionId: "cs_test_123",
      providerTransactionId: "pi_123",
      paymentStatus: "paid",
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
