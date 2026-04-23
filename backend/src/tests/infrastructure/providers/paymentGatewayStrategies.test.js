import { describe, it } from "mocha";
import { expect } from "chai";
import { resolvePaymentGatewayStrategy } from "../../../infrastructure/providers/payments/paymentGatewayStrategies.js";

describe("payment gateway strategies", () => {
  it("returns Stripe when the provider is selected and configured", () => {
    const paymentStrategy = resolvePaymentGatewayStrategy({
      provider: "stripe",
      stripeSecretKey: "sk_test_123",
      stripeWebhookSecret: "whsec_test_123",
    });

    expect(paymentStrategy.label).to.equal("Stripe");
    expect(paymentStrategy.paymentsEnabled).to.equal(true);
    expect(paymentStrategy.webhookEnabled).to.equal(true);
    expect(paymentStrategy.paymentGateway.createRedirectPayment).to.be.a("function");
  });

  it("creates an unavailable payment gateway for unsupported providers", async () => {
    const paymentStrategy = resolvePaymentGatewayStrategy({
      provider: "paypal",
    });

    expect(paymentStrategy.paymentsEnabled).to.equal(false);
    expect(paymentStrategy.webhookEnabled).to.equal(false);

    let capturedError;

    try {
      await paymentStrategy.paymentGateway.createRedirectPayment();
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).to.be.instanceOf(Error);
    expect(capturedError.message).to.equal("PayPal payments are not configured for this environment");
  });
});
