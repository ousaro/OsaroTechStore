import { createStripeProvider } from "./stripe/stripeProvide";
import { createPaypalProvider } from "./paypal/paypalProvider.js";

export const resolvePaymentGatewayStrategy = (config = {}) => {
  const { provider = "stripe", ...providerConfig } = config;

  const providers = {
    stripe: createStripeProvider,
    paypal: createPaypalProvider,
  };

  const createProvider = providers[provider];

  if (!createProvider) {
    throw new Error(`Payment provider "${provider}" not supported`);
  }

  return createProvider(providerConfig);
};