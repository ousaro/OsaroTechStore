export const createPaypalGateway = () => {
  return {
    async createRedirectPayment(data) {
      return {
        url: "https://paypal.com/checkout",
        provider: "paypal",
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
        sessionId: "paypal_session_123",
        url: "https://paypal.com/session",
      };
    },

    async getCheckoutSession(sessionId) {
      return {
        sessionId,
        status: "active",
      };
    },

    verifyWebhook(payload) {
      return {
        valid: true,
        event: payload,
      };
    },
  };
};