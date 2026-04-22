import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildVerifyWebhookUseCase } from "../../../../src/modules/payments/application/use-cases/verifyWebhookUseCase.js";

describe("verifyWebhookUseCase", () => {
  it("persists paid state for checkout completion events", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        eventId: "evt_test_123",
        sessionId: "cs_test_123",
        paymentStatus: "paid",
      }),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves(true),
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
    expect(paymentRepository.applyWebhookStateChangeOnce.calledOnceWithExactly({
      eventId: "evt_test_123",
      sessionId: "cs_test_123",
      paymentStatus: "paid",
    })).to.equal(true);
  });

  it("ignores webhook events that do not map to a payment state change", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns(null),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves(true),
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
    expect(paymentRepository.applyWebhookStateChangeOnce.called).to.equal(false);
  });

  it("uses Stripe event ids as an idempotency key for repeated webhook deliveries", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        eventId: "evt_test_repeat",
        sessionId: "cs_test_123",
        paymentStatus: "paid",
      }),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves(false),
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
    expect(paymentRepository.applyWebhookStateChangeOnce.calledOnceWithExactly({
      eventId: "evt_test_repeat",
      sessionId: "cs_test_123",
      paymentStatus: "paid",
    })).to.equal(true);
  });
});
