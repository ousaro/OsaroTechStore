export const createStripeGateway = ({ secretKey, webhookSecret }) => {
  return {
    async createRedirectPayment(data) {
      return {
        url: "https://stripe.com/checkout-session",
        provider: "stripe",
        data,
      };
    },

    async getRedirectPayment(paymentId) {
      return {
        paymentId,
        status: "completed",
      };
    },

    async createCheckoutSession(data) {
      return {
        sessionId: "stripe_session_123",
        url: "https://stripe.com/checkout",
      };
    },

    async getCheckoutSession(sessionId) {
      return {
        sessionId,
        status: "open",
      };
    },

    verifyWebhook(payload, signature) {
      if (!webhookSecret) {
        throw new Error("Stripe webhook not configured");
      }

      return {
        valid: true,
        event: payload,
      };
    },
  };
};