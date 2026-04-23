import Stripe from "stripe";
import {
  toStripeCheckoutSessionDto,
  toStripeWebhookStateChange,
} from "./stripePayloadTranslator.js";

export const createStripeGateway = ({ secretKey, webhookSecret }) => {
  const stripe = new Stripe(secretKey);

  const createRedirectPayment = async ({ items, successUrl, cancelUrl }) => {
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

    return toStripeCheckoutSessionDto(session);
  };

  const getRedirectPayment = async (paymentId) => {
    const session = await stripe.checkout.sessions.retrieve(paymentId);
    return toStripeCheckoutSessionDto(session);
  };

  return {
    createRedirectPayment,
    createCheckoutSession: createRedirectPayment,

    verifyWebhook(payload, signature) {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return toStripeWebhookStateChange(event);
    },

    getRedirectPayment,
    getCheckoutSession: getRedirectPayment,
  };
};
