import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { buildVerifyWebhookUseCase } from "../../../../src/modules/payments/application/commands/verifyWebhookUseCase.js";
import { createPaymentConfirmedEvent } from "../../../../src/modules/payments/domain/events/PaymentConfirmed.js";
import { createPaymentExpiredEvent } from "../../../../src/modules/payments/domain/events/PaymentExpired.js";
import { DomainValidationError } from "../../../../src/shared/domain/errors/DomainValidationError.js";

describe("verifyWebhookUseCase", () => {
  it("persists paid state for checkout completion events", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        eventId: "evt_test_123",
        sessionId: "cs_test_123",
        providerTransactionId: "pi_123",
        occurredAt: new Date("2026-04-22T10:00:00.000Z"),
        paymentStatus: "paid",
      }),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves({
        id: "cs_test_123",
        paymentReference: "pay_123",
        providerTransactionId: "pi_123",
        paymentStatus: "paid",
      }),
    };
    const paymentEventPublisher = {
      publish: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
      paymentEventPublisher,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentRepository.applyWebhookStateChangeOnce.calledOnceWithExactly({
      eventId: "evt_test_123",
      sessionId: "cs_test_123",
      providerTransactionId: "pi_123",
      occurredAt: new Date("2026-04-22T10:00:00.000Z"),
      paymentStatus: "paid",
    })).to.equal(true);
    expect(paymentEventPublisher.publish.calledOnceWithExactly({
      type: "PaymentConfirmed",
      payload: {
        paymentReference: "pay_123",
        sessionId: "cs_test_123",
        paymentStatus: "paid",
        eventId: "evt_test_123",
      },
    })).to.equal(true);
  });

  it("ignores webhook events that do not map to a payment state change", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns(null),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves({
        id: "cs_test_123",
        paymentReference: "pay_123",
        paymentStatus: "paid",
      }),
    };
    const paymentEventPublisher = {
      publish: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
      paymentEventPublisher,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentRepository.applyWebhookStateChangeOnce.called).to.equal(false);
    expect(paymentEventPublisher.publish.called).to.equal(false);
  });

  it("uses Stripe event ids as an idempotency key for repeated webhook deliveries", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        eventId: "evt_test_repeat",
        sessionId: "cs_test_123",
        providerTransactionId: "pi_123",
        occurredAt: new Date("2026-04-22T11:00:00.000Z"),
        paymentStatus: "paid",
      }),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves(null),
    };
    const paymentEventPublisher = {
      publish: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
      paymentEventPublisher,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentRepository.applyWebhookStateChangeOnce.calledOnceWithExactly({
      eventId: "evt_test_repeat",
      sessionId: "cs_test_123",
      providerTransactionId: "pi_123",
      occurredAt: new Date("2026-04-22T11:00:00.000Z"),
      paymentStatus: "paid",
    })).to.equal(true);
    expect(paymentEventPublisher.publish.called).to.equal(false);
  });

  it("publishes PaymentExpired when checkout expires without payment", async () => {
    const paymentGateway = {
      verifyWebhook: sinon.stub().returns({
        eventId: "evt_test_expired",
        sessionId: "cs_test_124",
        occurredAt: new Date("2026-04-22T12:00:00.000Z"),
        paymentStatus: "failed",
        paymentOutcome: "expired",
      }),
    };
    const paymentRepository = {
      applyWebhookStateChangeOnce: sinon.stub().resolves({
        id: "cs_test_124",
        paymentReference: "pay_124",
        paymentStatus: "failed",
      }),
    };
    const paymentEventPublisher = {
      publish: sinon.stub().resolves(),
    };
    const useCase = buildVerifyWebhookUseCase({
      paymentGateway,
      paymentRepository,
      paymentEventPublisher,
    });

    const result = await useCase({
      payload: Buffer.from("{}"),
      signature: "sig_test",
    });

    expect(result).to.deep.equal({ received: true });
    expect(paymentEventPublisher.publish.calledOnceWithExactly({
      type: "PaymentExpired",
      payload: {
        paymentReference: "pay_124",
        sessionId: "cs_test_124",
        paymentStatus: "failed",
        eventId: "evt_test_expired",
      },
    })).to.equal(true);
  });

  it("creates a PaymentConfirmed event with stable payload", () => {
    const event = createPaymentConfirmedEvent({
      eventId: "evt_test_123",
      paymentReference: "pay_123",
      sessionId: "cs_test_123",
      paymentStatus: "paid",
    });

    expect(event).to.deep.equal({
      type: "PaymentConfirmed",
      payload: {
        paymentReference: "pay_123",
        sessionId: "cs_test_123",
        paymentStatus: "paid",
        eventId: "evt_test_123",
      },
    });
  });

  it("creates a PaymentExpired event with stable payload", () => {
    const event = createPaymentExpiredEvent({
      eventId: "evt_test_expired",
      paymentReference: "pay_124",
      sessionId: "cs_test_124",
      paymentStatus: "failed",
      paymentOutcome: "expired",
    });

    expect(event).to.deep.equal({
      type: "PaymentExpired",
      payload: {
        paymentReference: "pay_124",
        sessionId: "cs_test_124",
        paymentStatus: "failed",
        eventId: "evt_test_expired",
      },
    });
  });

  it("requires a session id when creating PaymentConfirmed", () => {
    expect(() =>
      createPaymentConfirmedEvent({
        eventId: "evt_test_123",
        paymentStatus: "paid",
      })
    ).to.throw(
      DomainValidationError,
      "session id is required to create PaymentConfirmed"
    );
  });
});
