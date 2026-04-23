import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildGetSessionDetailsUseCase } from "../../../../src/modules/payments/application/queries/getSessionDetailsUseCase.js";

describe("getSessionDetailsUseCase", () => {
  it("returns persisted payment session state before falling back to Stripe", async () => {
    const paymentGateway = {
      getRedirectPayment: sinon.stub(),
    };
    const paymentRepository = {
      findPaymentWorkflowById: sinon
        .stub()
        .resolves({
          id: "cs_test_123",
          paymentReference: "pay_123",
          provider: "stripe",
          workflowType: "redirect_session",
          providerPaymentId: "pi_123",
          paymentStatus: "paid",
        }),
      savePaymentWorkflow: sinon.stub(),
    };
    const useCase = buildGetSessionDetailsUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({ sessionId: "cs_test_123" });

    expect(result).to.deep.equal({
      id: "cs_test_123",
      paymentReference: "pay_123",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "paid",
    });
    expect(paymentGateway.getRedirectPayment.called).to.equal(false);
    expect(paymentRepository.savePaymentWorkflow.called).to.equal(false);
  });

  it("persists the Stripe session when no internal state exists yet", async () => {
    const paymentGateway = {
      getRedirectPayment: sinon.stub().resolves({
        id: "cs_test_123",
        provider: "stripe",
        workflowType: "redirect_session",
        paymentStatus: "pending",
      }),
    };
    const paymentRepository = {
      findPaymentWorkflowById: sinon.stub().resolves(null),
      savePaymentWorkflow: sinon.stub().resolves(),
    };
    const useCase = buildGetSessionDetailsUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({ sessionId: "cs_test_123" });

    expect(result).to.deep.equal({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "pending",
    });
    expect(paymentRepository.savePaymentWorkflow.calledOnceWithExactly({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "pending",
    })).to.equal(true);
  });
});
