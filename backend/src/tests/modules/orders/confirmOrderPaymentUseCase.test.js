import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildConfirmOrderPaymentUseCase } from "../../../modules/orders/application/commands/confirmOrderPaymentUseCase.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("confirmOrderPaymentUseCase", () => {
  it("updates the correlated order through order application logic", async () => {
    const updateOrder = sinon.stub().resolves({
      _id: "o1",
      status: "paid",
      paymentStatus: "paid",
    });
    const useCase = buildConfirmOrderPaymentUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves({
          _id: "o1",
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
        paymentStatus: "paid",
        status: "paid",
      },
    })).to.equal(true);
    expect(result).to.deep.equal({
      _id: "o1",
      status: "paid",
      paymentStatus: "paid",
    });
  });

  it("logs and ignores PaymentConfirmed when no correlated order exists", async () => {
    const logger = { warn: sinon.stub() };
    const updateOrder = sinon.stub().resolves();
    const useCase = buildConfirmOrderPaymentUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves(null),
      },
      updateOrder,
      logger,
    });

    const result = await useCase({
      paymentReference: "cs_missing",
      eventId: "evt_test_404",
    });

    expect(result).to.equal(null);
    expect(updateOrder.called).to.equal(false);
    expect(logger.warn.calledOnce).to.equal(true);
  });

  it("requires a payment reference", async () => {
    const useCase = buildConfirmOrderPaymentUseCase({
      orderRepository: {
        findByPaymentReference: sinon.stub().resolves(null),
      },
      updateOrder: sinon.stub().resolves(),
      logger: { warn: sinon.stub() },
    });

    try {
      await useCase({ eventId: "evt_test_123" });
      throw new Error("Expected confirmOrderPaymentUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("paymentReference is required");
    }
  });
});
