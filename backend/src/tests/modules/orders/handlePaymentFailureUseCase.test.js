import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildHandlePaymentFailureUseCase } from "../../../modules/orders/application/commands/handlePaymentFailureUseCase.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("handlePaymentFailureUseCase", () => {
  it("updates only the order payment state when the payment fails", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "pending",
      paymentStatus: "failed",
    });
    const useCase = buildHandlePaymentFailureUseCase({
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

    const result = await useCase({
      paymentReference: "pay_123",
      eventId: "evt_test_123",
    });

    expect(updateOrder.calledOnceWithExactly({
      id: "o1",
      updates: {
        paymentStatus: "failed",
      },
    })).to.equal(true);
    expect(result).to.deep.equal({
      _id: "o1",
      status: "pending",
      paymentStatus: "failed",
    });
  });

  it("requires a payment reference", async () => {
    const useCase = buildHandlePaymentFailureUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves(null),
      },
      updateOrder: sinon.stub().resolves(),
      logger: { warn: sinon.stub() },
    });

    try {
      await useCase({ eventId: "evt_test_123" });
      throw new Error("Expected handlePaymentFailureUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("paymentReference is required");
    }
  });
});
