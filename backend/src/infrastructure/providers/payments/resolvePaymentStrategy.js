/**
 * Payment Gateway Strategy Resolver.
 *
 * Returns the correct payment gateway adapter based on config.
 * All adapters satisfy the paymentGatewayPort interface.
 *
 * To add a new provider (e.g. PayPal):
 *   1. Create infrastructure/providers/payments/paypal/paypalGateway.js
 *   2. Add a case below — no module code changes needed.
 */

import { createStripeGateway } from "./stripe/stripeGateway.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";

const DISABLED_GATEWAY = Object.freeze({
  provider: "disabled",
  paymentsEnabled: false,
  webhookEnabled: false,
  label: "Payments",
  gateway: null,
});

export const resolvePaymentStrategy = ({ provider, env, logger }) => {
  switch (provider) {
    case "stripe": {
      const gateway = createStripeGateway({
        secretKey:     env.stripeSecretKey,
        webhookSecret: env.stripeWebhookSecret,
        logger,
      });
      return {
        provider: "stripe",
        label: "Stripe",
        paymentsEnabled: true,
        webhookEnabled: Boolean(env.stripeWebhookSecret),
        gateway,
      };
    }

    case "paypal":
      // Placeholder — implement createPaypalGateway when needed
      throw new ServiceUnavailableError(
        "PayPal gateway is not yet implemented. " +
          "Set PAYMENT_PROVIDER=stripe or implement createPaypalGateway."
      );

    case "disabled":
      return DISABLED_GATEWAY;

    default:
      throw new ServiceUnavailableError(
        `Unknown payment provider: "${provider}". ` +
          `Supported: "stripe", "paypal", "disabled". Check PAYMENT_PROVIDER in .env`
      );
  }
};
