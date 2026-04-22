import Stripe from "stripe";
import { toCheckoutSessionRecord } from "./checkoutSessionMapper.js";

const WEBHOOK_PAYMENT_STATUS_BY_EVENT_TYPE = {
  "checkout.session.completed": "paid",
  "checkout.session.async_payment_failed": "failed",
  "checkout.session.expired": "failed",
};

const toStripeWebhookStateChange = (event) => {
  const paymentStatus = WEBHOOK_PAYMENT_STATUS_BY_EVENT_TYPE[event?.type];
  const eventId = event?.id;
  const sessionId = event?.data?.object?.id;

  if (
    !paymentStatus ||
    typeof eventId !== "string" ||
    eventId.trim() === "" ||
    typeof sessionId !== "string" ||
    sessionId.trim() === ""
  ) {
    return null;
  }

  return {
    eventId,
    sessionId,
    paymentStatus,
  };
};

export const createStripeGateway = ({ secretKey, webhookSecret }) => {
  const stripe = new Stripe(secretKey);

  return {
    async createCheckoutSession({ items, successUrl, cancelUrl }) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        })),
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return toCheckoutSessionRecord(session);
    },

    verifyWebhook(payload, signature) {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return toStripeWebhookStateChange(event);
    },

    async getCheckoutSession(sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return toCheckoutSessionRecord(session);
    },
  };
};
