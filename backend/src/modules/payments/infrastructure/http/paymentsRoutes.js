import express from "express";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "../../index.js";

export const createPaymentsRoutes = ({ requireAuth }) => {
  const paymentsRoutes = express.Router();

  paymentsRoutes.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
  paymentsRoutes.use(requireAuth);
  paymentsRoutes.post("/create-payment-intent", createPaymentIntentHandler);
  paymentsRoutes.get("/session-details/:sessionId", getSessionDetailsHandler);

  return paymentsRoutes;
};
