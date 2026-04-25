import { createStripeGateway } from "../gateways/stripeGateway.js"
import { ServiceUnavailableError } from "../../../shared/application/errors/ServiceUnavailableError.js";

export const createStripeProvider = ({
  stripeSecretKey,
  stripeWebhookSecret,
}) => {
  const paymentsEnabled = Boolean(stripeSecretKey);
  const webhookEnabled = Boolean(stripeSecretKey && stripeWebhookSecret);

  if (!paymentsEnabled) {
    throw new ServiceUnavailableError("Stripe is not configured (missing secret key)");
  }

  const gateway = createStripeGateway({
    secretKey: stripeSecretKey,
    webhookSecret: stripeWebhookSecret,
  });

  return {
    provider: "stripe",
    paymentsEnabled,
    webhookEnabled,
    gateway,
  };
};