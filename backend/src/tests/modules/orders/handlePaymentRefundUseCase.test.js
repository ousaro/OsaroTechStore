import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildHandlePaymentRefundUseCase } from "../../../modules/orders/application/commands/handlePaymentRefundUseCase.js";

describe("handlePaymentRefundUseCase", () => {
  it("cancels cancellable orders when a payment is refunded", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "cancelled",
      paymentStatus: "refunded",
    });
    const useCase = buildHandlePaymentRefundUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves({
          _id: "o1",
          status: "paid",
          paymentReference: "pay_123",
        }),
      },
      updateOrder,
      logger: { warn: sinon.stub() },
    });

    await useCase({
      paymentReference: "pay_123",
      eventId: "evt_test_126",
    });

    expect(updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: {
        paymentStatus: "refunded",
        status: "cancelled",
      },
    })).to.equal(true);
  });

  it("keeps shipped orders in their fulfillment state when a payment is refunded", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "shipped",
      paymentStatus: "refunded",
    });
    const useCase = buildHandlePaymentRefundUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves({
          _id: "o1",
          status: "shipped",
          paymentReference: "pay_123",
        }),
      },
      updateOrder,
      logger: { warn: sinon.stub() },
    });

    await useCase({
      paymentReference: "pay_123",
      eventId: "evt_test_127",
    });

    expect(updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: {
        paymentStatus: "refunded",
      },
    })).to.equal(true);
  });
});
