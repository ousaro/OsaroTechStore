import { createStripeGateway } from "../../../modules/payments/adapters/output/gateways/stripeGateway.js";
import { ServiceUnavailableError } from "../../../shared/application/errors/ServiceUnavailableError.js";

const PAYMENT_LABELS = Object.freeze({
  none: "Payment",
  paypal: "PayPal",
  stripe: "Stripe",
});

const createUnavailablePaymentGateway = ({
  label,
  paymentsEnabled,
  webhookEnabled,
}) => ({
  async createRedirectPayment() {
    throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
  },
  async getRedirectPayment() {
    throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
  },
  verifyWebhook() {
    if (!webhookEnabled) {
      throw new ServiceUnavailableError(`${label} webhook is not configured for this environment`);
    }

    throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
  },
  createCheckoutSession() {
    if (!paymentsEnabled) {
      throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
    }

    throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
  },
  getCheckoutSession() {
    if (!paymentsEnabled) {
      throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
    }

    throw new ServiceUnavailableError(`${label} payments are not configured for this environment`);
  },
});

export const resolvePaymentGatewayStrategy = ({
  provider = "stripe",
  stripeSecretKey = "",
  stripeWebhookSecret = "",
} = {}) => {
  switch (provider) {
    case "stripe": {
      const paymentsEnabled = Boolean(stripeSecretKey);
      const webhookEnabled = Boolean(stripeSecretKey && stripeWebhookSecret);

      return {
        provider,
        label: PAYMENT_LABELS.stripe,
        paymentsEnabled,
        webhookEnabled,
        paymentGateway: paymentsEnabled
          ? createStripeGateway({
              secretKey: stripeSecretKey,
              webhookSecret: stripeWebhookSecret,
            })
          : createUnavailablePaymentGateway({
              label: PAYMENT_LABELS.stripe,
              paymentsEnabled,
              webhookEnabled,
            }),
      };
    }
    case "none":
    case "paypal":
    default: {
      const label = PAYMENT_LABELS[provider] || provider;

      return {
        provider,
        label,
        paymentsEnabled: false,
        webhookEnabled: false,
        paymentGateway: createUnavailablePaymentGateway({
          label,
          paymentsEnabled: false,
          webhookEnabled: false,
        }),
      };
    }
  }
};
