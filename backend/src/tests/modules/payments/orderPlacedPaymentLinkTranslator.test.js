import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { createOrderPlacedPaymentLinkTranslator } from "../../../modules/payments/infrastructure/collaboration/orderPlacedPaymentLinkTranslator.js";

describe("orderPlacedPaymentLinkTranslator", () => {
  it("translates OrderPlaced into payment-to-order linking", async () => {
    const linkPaymentToOrder = sinon.stub().resolves();
    const translator = createOrderPlacedPaymentLinkTranslator({
      linkPaymentToOrder,
    });

    await translator.publish({
      type: "OrderPlaced",
      payload: {
        orderId: "order-1",
        ownerId: "user-1",
        status: "pending",
        paymentStatus: "pending",
        paymentReference: "pay_123",
        totalPrice: 100,
      },
    });

    expect(linkPaymentToOrder.calledOnceWithExactly({
      paymentReference: "pay_123",
      orderId: "order-1",
    })).to.equal(true);
  });

  it("rejects OrderPlaced events that do not carry a payment reference", async () => {
    const linkPaymentToOrder = sinon.stub().resolves();
    const translator = createOrderPlacedPaymentLinkTranslator({
      linkPaymentToOrder,
    });

    try {
      await translator.publish({
        type: "OrderPlaced",
        payload: {
          orderId: "order-1",
          ownerId: "user-1",
          status: "pending",
          paymentStatus: "pending",
          totalPrice: 100,
        },
      });
      expect.fail("Expected translator to reject invalid OrderPlaced payload");
    } catch (error) {
      expect(error.message).to.equal("event.payload.paymentReference is required");
    }

    expect(linkPaymentToOrder.called).to.equal(false);
  });
});
