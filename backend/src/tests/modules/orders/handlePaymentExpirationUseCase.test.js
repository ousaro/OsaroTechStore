import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildHandlePaymentExpirationUseCase } from "../../../modules/orders/application/commands/handlePaymentExpirationUseCase.js";

describe("handlePaymentExpirationUseCase", () => {
  it("cancels pending orders when the payment expires", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "cancelled",
      paymentStatus: "failed",
    });
    const useCase = buildHandlePaymentExpirationUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves({
          _id: "o1",
          status: "pending",
          paymentReference: "pay_123",
        }),
      },
      updateOrder,
      logger: { warn: sinon.stub() },
    });

    await useCase({
      paymentReference: "pay_123",
      eventId: "evt_test_124",
    });

    expect(updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: {
        paymentStatus: "failed",
        status: "cancelled",
      },
    })).to.equal(true);
  });

  it("keeps fulfillment state unchanged for non-pending orders when the payment expires", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "processing",
      paymentStatus: "failed",
    });
    const useCase = buildHandlePaymentExpirationUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves({
          _id: "o1",
          status: "processing",
          paymentReference: "pay_123",
        }),
      },
      updateOrder,
      logger: { warn: sinon.stub() },
    });

    await useCase({
      paymentReference: "pay_123",
      eventId: "evt_test_125",
    });

    expect(updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: {
        paymentStatus: "failed",
      },
    })).to.equal(true);
  });
});
