import { describe, it } from "mocha";
import { expect } from "chai";
import { createPaymentStateChangeEvent } from "../../../modules/payments/domain/events/createPaymentStateChangeEvent.js";

describe("createPaymentStateChangeEvent", () => {
  it("creates PaymentFailed for failed outcomes", () => {
    expect(
      createPaymentStateChangeEvent({
        eventId: "evt_test_1",
        sessionId: "cs_test_1",
        paymentReference: "pay_1",
        paymentStatus: "failed",
      })
    ).to.deep.equal({
      type: "PaymentFailed",
      payload: {
        paymentReference: "pay_1",
        sessionId: "cs_test_1",
        paymentStatus: "failed",
        eventId: "evt_test_1",
      },
    });
  });

  it("creates PaymentExpired for explicit expiry outcomes", () => {
    expect(
      createPaymentStateChangeEvent({
        eventId: "evt_test_2",
        sessionId: "cs_test_2",
        paymentReference: "pay_2",
        paymentStatus: "failed",
        paymentOutcome: "expired",
      })
    ).to.deep.equal({
      type: "PaymentExpired",
      payload: {
        paymentReference: "pay_2",
        sessionId: "cs_test_2",
        paymentStatus: "failed",
        eventId: "evt_test_2",
      },
    });
  });

  it("creates PaymentRefunded for refunded outcomes", () => {
    expect(
      createPaymentStateChangeEvent({
        eventId: "evt_test_3",
        sessionId: "cs_test_3",
        paymentReference: "pay_3",
        paymentStatus: "refunded",
      })
    ).to.deep.equal({
      type: "PaymentRefunded",
      payload: {
        paymentReference: "pay_3",
        sessionId: "cs_test_3",
        paymentStatus: "refunded",
        eventId: "evt_test_3",
      },
    });
  });
});
