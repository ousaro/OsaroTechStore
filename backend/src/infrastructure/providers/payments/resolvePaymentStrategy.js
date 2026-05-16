import { createStripeGateway } from "./stripe/stripeGateway.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/index.js";
import { assertPaymentStrategyPort } from "../../../shared/application/ports/paymentStrategyPort.js";

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
        secretKey: env.stripeSecretKey,
        webhookSecret: env.stripeWebhookSecret,
        logger,
      });

      return assertPaymentStrategyPort(
        {
          provider: "stripe",
          label: "Stripe",
          paymentsEnabled: true,
          webhookEnabled: Boolean(env.stripeWebhookSecret),
          gateway,
        },
        "resolvePaymentStrategy"
      );
    }

    case "disabled":
      return assertPaymentStrategyPort(DISABLED_GATEWAY, "resolvePaymentStrategy");

    default:
      throw new ServiceUnavailableError(
        `Unknown payment provider: "${provider}". ` +
          `Supported: "stripe", "disabled". Check PAYMENT_PROVIDER in .env`
      );
  }
};
