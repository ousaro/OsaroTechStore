import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildGetSessionDetailsUseCase } from "../../../../src/modules/payments/application/queries/getSessionDetailsUseCase.js";

describe("getSessionDetailsUseCase", () => {
  it("returns persisted payment session state before falling back to Stripe", async () => {
    const paymentGateway = {
      getCheckoutSession: sinon.stub(),
    };
    const paymentRepository = {
      findPaymentSessionById: sinon
        .stub()
        .resolves({
          id: "cs_test_123",
          paymentReference: "pay_123",
          paymentStatus: "paid",
        }),
      savePaymentSession: sinon.stub(),
    };
    const useCase = buildGetSessionDetailsUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({ sessionId: "cs_test_123" });

    expect(result).to.deep.equal({
      id: "cs_test_123",
      paymentReference: "pay_123",
      paymentStatus: "paid",
    });
    expect(paymentGateway.getCheckoutSession.called).to.equal(false);
    expect(paymentRepository.savePaymentSession.called).to.equal(false);
  });

  it("persists the Stripe session when no internal state exists yet", async () => {
    const paymentGateway = {
      getCheckoutSession: sinon
        .stub()
        .resolves({ id: "cs_test_123", paymentStatus: "pending" }),
    };
    const paymentRepository = {
      findPaymentSessionById: sinon.stub().resolves(null),
      savePaymentSession: sinon.stub().resolves(),
    };
    const useCase = buildGetSessionDetailsUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({ sessionId: "cs_test_123" });

    expect(result).to.deep.equal({
      id: "cs_test_123",
      paymentStatus: "pending",
    });
    expect(paymentRepository.savePaymentSession.calledOnceWithExactly({
      id: "cs_test_123",
      paymentStatus: "pending",
    })).to.equal(true);
  });
});
