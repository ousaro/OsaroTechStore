import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import Stripe from "stripe";
import { createStripeGateway } from "../../../modules/payments/infrastructure/gateways/stripeGateway.js";
import { assertRedirectPaymentGatewayPort } from "../../../modules/payments/ports/output/paymentGatewayPort.js";

describe("stripe gateway contract", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("implements the expected payment gateway port", () => {
    const gateway = createStripeGateway({
      secretKey: "sk_test_123",
      webhookSecret: "whsec_test_123",
    });

    expect(() =>
      assertRedirectPaymentGatewayPort(gateway, [
        "createRedirectPayment",
        "verifyWebhook",
        "getRedirectPayment",
      ])
    ).to.not.throw();
  });

  it("delegates checkout session creation/retrieval and translates Stripe webhook events into provider-neutral state changes", async () => {
    const stripe = new Stripe("sk_test_123");
    const sessionsProto = Object.getPrototypeOf(stripe.checkout.sessions);
    const checkoutCreateStub = sinon
      .stub(sessionsProto, "create")
      .resolves({ id: "cs_test_123", url: "https://stripe.test/session" });
    const checkoutRetrieveStub = sinon
      .stub(sessionsProto, "retrieve")
      .resolves({ id: "cs_test_123", payment_status: "paid" });

    const gateway = createStripeGateway({
      secretKey: "sk_test_123",
      webhookSecret: "whsec_test_123",
    });

    const createResult = await gateway.createRedirectPayment({
      items: [{ name: "Phone", price: 100, quantity: 2 }],
      successUrl: "http://localhost:3000/success",
      cancelUrl: "http://localhost:3000/cancel",
    });
    const retrieveResult = await gateway.getRedirectPayment("cs_test_123");

    const webhookPayload = JSON.stringify({
      id: "evt_test_123",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
        },
      },
    });
    const webhookSignature = stripe.webhooks.generateTestHeaderString({
      payload: webhookPayload,
      secret: "whsec_test_123",
    });
    const webhookResult = gateway.verifyWebhook(Buffer.from(webhookPayload), webhookSignature);

    expect(checkoutCreateStub.calledOnce).to.equal(true);
    expect(checkoutCreateStub.firstCall.args[0]).to.deep.equal({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Phone",
            },
            unit_amount: 10000,
          },
          quantity: 2,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    expect(createResult).to.deep.equal({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      url: "https://stripe.test/session",
    });

    expect(checkoutRetrieveStub.calledOnceWithExactly("cs_test_123")).to.equal(true);
    expect(retrieveResult).to.deep.equal({
      id: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      providerStatus: "paid",
      paymentStatus: "paid",
    });

    expect(webhookResult).to.deep.include({
      eventId: "evt_test_123",
      id: "cs_test_123",
      sessionId: "cs_test_123",
      provider: "stripe",
      workflowType: "redirect_session",
      paymentStatus: "paid",
    });
  });
});
