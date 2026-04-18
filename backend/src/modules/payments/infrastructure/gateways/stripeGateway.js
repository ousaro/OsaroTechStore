import Stripe from "stripe";
import { toCheckoutSessionEntity } from "../../domain/entities/CheckoutSessionEntity.js";

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

      return toCheckoutSessionEntity(session);
    },

    verifyWebhook(payload, signature) {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    },

    async getCheckoutSession(sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return toCheckoutSessionEntity(session);
    },
  };
};
