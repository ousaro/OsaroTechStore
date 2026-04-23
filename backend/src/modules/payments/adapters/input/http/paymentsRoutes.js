import express from "express";
import { env } from "../../../../../infrastructure/config/env.js";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "./httpHandlers.js";

export const createPaymentsRoutes = ({ requireAuth }) => {
  const paymentsRoutes = express.Router();
  const stripePaymentsUnavailable = (_req, res) =>
    res.status(503).json({ message: "Stripe payments are not configured for this environment" });
  const stripeWebhookUnavailable = (_req, res) =>
    res.status(503).json({ message: "Stripe webhook is not configured for this environment" });

  paymentsRoutes.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    env.stripeWebhookEnabled ? stripeWebhookHandler : stripeWebhookUnavailable
  );
  paymentsRoutes.use(requireAuth);
  paymentsRoutes.post(
    "/create-payment-intent",
    env.stripePaymentsEnabled ? createPaymentIntentHandler : stripePaymentsUnavailable
  );
  paymentsRoutes.get(
    "/session-details/:sessionId",
    env.stripePaymentsEnabled ? getSessionDetailsHandler : stripePaymentsUnavailable
  );

  return paymentsRoutes;
};
