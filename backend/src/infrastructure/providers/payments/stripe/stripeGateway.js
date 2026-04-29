/**
 * Stripe Payment Gateway Adapter.
 *
 * Implements the payment gateway port for Stripe Checkout Sessions.
 * The payments module never imports this — it only knows the port interface.
 * Switching to PayPal means replacing this adapter in resolvePaymentStrategy.js.
 */

import Stripe from "stripe";
import { toStripeCheckoutSessionDto, toStripeWebhookStateChange } from "./stripePayloadTranslator.js";

export const createStripeGateway = ({ secretKey, webhookSecret, logger }) => {
  if (!secretKey) {
    throw new Error(
      "[Stripe] STRIPE_SECRET_KEY is required. " +
        "Set PAYMENT_PROVIDER=stripe and STRIPE_SECRET_KEY=<key> in .env"
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-04-10" });

  const createRedirectPayment = async ({ items, successUrl, cancelUrl }) => {
    logger?.debug({ msg: "Stripe: creating checkout session", itemCount: items.length });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    logger?.info({ msg: "Stripe: checkout session created", sessionId: session.id });
    return toStripeCheckoutSessionDto(session);
  };

  const getRedirectPayment = async (sessionId) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return toStripeCheckoutSessionDto(session);
  };

  return {
    createRedirectPayment,
    createCheckoutSession: createRedirectPayment, // alias

    verifyWebhook(payload, signature) {
      if (!webhookSecret) {
        throw new Error(
          "[Stripe] STRIPE_WEBHOOK_SECRET is required for webhook verification."
        );
      }
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return toStripeWebhookStateChange(event);
    },

    getRedirectPayment,
    getCheckoutSession: getRedirectPayment, // alias
  };
};
