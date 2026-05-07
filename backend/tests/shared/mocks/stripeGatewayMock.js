import crypto from "node:crypto";

export const createStripeGatewayMock = () => {
  const calls = {
    createRedirectPayment: [],
    verifyWebhook: [],
  };

  const sessions = new Map();
  let nextPaymentResult = "success";

  const createSession = ({ id, url, paymentStatus = "pending", paymentIntent } = {}) => ({
    id: id ?? `cs_test_${crypto.randomUUID()}`,
    provider: "stripe",
    workflowType: "redirect_session",
    url: url ?? "https://checkout.stripe.test/session",
    paymentStatus,
    providerPaymentId: paymentIntent,
  });

  return {
    calls,
    reset() {
      calls.createRedirectPayment.length = 0;
      calls.verifyWebhook.length = 0;
      sessions.clear();
      nextPaymentResult = "success";
    },
    setNextPaymentResult(result) {
      nextPaymentResult = result;
    },
    createRedirectPayment: async ({ items, successUrl, cancelUrl }) => {
      calls.createRedirectPayment.push({ items, successUrl, cancelUrl });
      if (nextPaymentResult === "failure") {
        throw new Error("Stripe checkout session creation failed");
      }
      const session = createSession();
      sessions.set(session.id, session);
      return session;
    },
    createCheckoutSession(...args) {
      return this.createRedirectPayment(...args);
    },
    getRedirectPayment: async (sessionId) =>
      sessions.get(sessionId) ?? createSession({ id: sessionId }),
    getCheckoutSession(sessionId) {
      return this.getRedirectPayment(sessionId);
    },
    verifyWebhook: (payload, signature) => {
      calls.verifyWebhook.push({ payload, signature });
      if (signature !== "valid-test-signature") {
        throw new Error("Invalid Stripe signature");
      }
      const event = Buffer.isBuffer(payload)
        ? JSON.parse(payload.toString("utf8"))
        : JSON.parse(String(payload));
      const session = event.data?.object ?? {};
      const statusByType = {
        "checkout.session.completed": "paid",
        "checkout.session.async_payment_failed": "failed",
        "checkout.session.expired": "expired",
      };
      const paymentStatus = statusByType[event.type];
      if (!paymentStatus || !event.id || !session.id) return null;
      return {
        eventId: event.id,
        id: session.id,
        sessionId: session.id,
        provider: "stripe",
        workflowType: "redirect_session",
        providerPaymentId: session.payment_intent,
        providerStatus: session.payment_status,
        occurredAt: new Date((event.created ?? 1_700_000_000) * 1000),
        paymentStatus,
      };
    },
  };
};

export const buildStripeCheckoutWebhook = ({
  type = "checkout.session.completed",
  sessionId,
  paymentIntent = "pi_test_123",
  paymentStatus = "paid",
} = {}) => ({
  id: `evt_test_${crypto.randomUUID()}`,
  type,
  created: 1_700_000_000,
  data: {
    object: {
      id: sessionId,
      object: "checkout.session",
      payment_intent: paymentIntent,
      payment_status: paymentStatus,
    },
  },
});
