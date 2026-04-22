import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildVerifyWebhookUseCase } from "../../../../src/modules/payments/application/use-cases/verifyWebhookUseCase.js";

describe("verifyWebhookUseCase", () => {
  it("persists paid state for checkout completion events", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } },
      }),
    };
    const paymentRepository = {
      updatePaymentSessionStatus: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentRepository.updatePaymentSessionStatus.calledOnceWithExactly(
      "cs_test_123",
      "paid"
    )).to.equal(true);
  });

  it("ignores webhook events that do not map to a payment state change", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        type: "payment_intent.created",
        data: { object: { id: "pi_test_123" } },
      }),
    };
    const paymentRepository = {
      updatePaymentSessionStatus: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentRepository.updatePaymentSessionStatus.called).to.equal(false);
  });
});
