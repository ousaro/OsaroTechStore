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
        paymentReference: "pay_123",
      },
    });

    expect(linkPaymentToOrder.calledOnceWithExactly({
      paymentReference: "pay_123",
      orderId: "order-1",
    })).to.equal(true);
  });

  it("ignores OrderPlaced events that do not carry a payment reference", async () => {
    const linkPaymentToOrder = sinon.stub().resolves();
    const translator = createOrderPlacedPaymentLinkTranslator({
      linkPaymentToOrder,
    });

    await translator.publish({
      type: "OrderPlaced",
      payload: {
        orderId: "order-1",
      },
    });

    expect(linkPaymentToOrder.called).to.equal(false);
  });
});
