import express from "express";
import { env } from "../../../../../infrastructure/config/env.js";
import { resolvePaymentGatewayStrategy } from "../../../../../infrastructure/providers/payments/paymentGatewayStrategies.js";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "./httpHandlers.js";

export const createPaymentsRoutes = ({
  requireAuth,
  paymentStrategy = resolvePaymentGatewayStrategy({
    provider: env.paymentProvider,
    stripeSecretKey: env.stripeSecretKey,
    stripeWebhookSecret: env.stripeWebhookSecret,
  }),
}) => {
  const paymentsRoutes = express.Router();
  const paymentsUnavailable = (_req, res) =>
    res
      .status(503)
      .json({ message: `${paymentStrategy.label} payments are not configured for this environment` });
  const webhookUnavailable = (_req, res) =>
    res
      .status(503)
      .json({ message: `${paymentStrategy.label} webhook is not configured for this environment` });

  paymentsRoutes.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentStrategy.webhookEnabled ? stripeWebhookHandler : webhookUnavailable
  );
  paymentsRoutes.use(requireAuth);
  paymentsRoutes.post(
    "/create-payment-intent",
    paymentStrategy.paymentsEnabled ? createPaymentIntentHandler : paymentsUnavailable
  );
  paymentsRoutes.get(
    "/session-details/:sessionId",
    paymentStrategy.paymentsEnabled ? getSessionDetailsHandler : paymentsUnavailable
  );

  return paymentsRoutes;
};
