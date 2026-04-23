import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildCreatePaymentIntentUseCase } from "../../../../src/modules/payments/application/commands/createPaymentIntentUseCase.js";
import { PaymentValidationError } from "../../../../src/modules/payments/application/errors/PaymentApplicationError.js";

describe("createPaymentIntentUseCase", () => {
  it("throws 400 when items is empty", async () => {
    const paymentGateway = { createRedirectPayment: sinon.stub() };
    const paymentRepository = { savePaymentWorkflow: sinon.stub() };
    const useCase = buildCreatePaymentIntentUseCase({
      paymentGateway,
      paymentRepository,
      clientUrl: "http://localhost:3000",
    });

    try {
      await useCase({ items: [] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(PaymentValidationError);
      expect(error.code).to.equal("PAYMENT_VALIDATION");
      expect(error.message).to.include("items must be a non-empty array");
    }
  });

  it("throws 400 when item payload is invalid", async () => {
    const paymentGateway = { createRedirectPayment: sinon.stub() };
    const paymentRepository = { savePaymentWorkflow: sinon.stub() };
    const useCase = buildCreatePaymentIntentUseCase({
      paymentGateway,
      paymentRepository,
      clientUrl: "http://localhost:3000",
    });

    try {
      await useCase({ items: [{ name: "", price: -1, quantity: 0 }] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(PaymentValidationError);
      expect(error.code).to.equal("PAYMENT_VALIDATION");
      expect(error.message).to.include("Invalid item at index 0");
    }
  });

  it("returns checkout url for valid items", async () => {
    const paymentGateway = {
      createRedirectPayment: sinon.stub().resolves({
        id: "cs_test_123",
        provider: "stripe",
        workflowType: "redirect_session",
        url: "https://stripe.test/session",
      }),
    };
    const paymentRepository = {
      savePaymentWorkflow: sinon.stub().resolves(),
    };
    const useCase = buildCreatePaymentIntentUseCase({
      paymentGateway,
      paymentRepository,
      clientUrl: "http://localhost:3000",
    });

    const result = await useCase({
      items: [{ name: "Phone", price: 100, quantity: 1 }],
    });

    expect(result).to.deep.equal({ url: "https://stripe.test/session" });
    expect(paymentGateway.createRedirectPayment.calledOnce).to.equal(true);
    expect(paymentRepository.savePaymentWorkflow.calledOnceWithExactly({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      url: "https://stripe.test/session",
      paymentStatus: "pending",
    })).to.equal(true);
  });
});
