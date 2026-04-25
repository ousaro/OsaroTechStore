import express from "express";
import { env } from "../../../../../infrastructure/config/env.js";
import { resolvePaymentGatewayStrategy } from "../../../../../infrastructure/providers/payments/resolvePaymentGateway.js";
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
  const canHandlePayments =
    paymentStrategy.paymentsEnabled &&
    typeof createPaymentIntentHandler === "function" &&
    typeof getSessionDetailsHandler === "function";
  const canHandleWebhook =
    paymentStrategy.webhookEnabled && typeof stripeWebhookHandler === "function";
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
    canHandleWebhook ? stripeWebhookHandler : webhookUnavailable
  );
  paymentsRoutes.use(requireAuth);
  paymentsRoutes.post(
    "/create-payment-intent",
    canHandlePayments ? createPaymentIntentHandler : paymentsUnavailable
  );
  paymentsRoutes.get(
    "/session-details/:sessionId",
    canHandlePayments ? getSessionDetailsHandler : paymentsUnavailable
  );

  return paymentsRoutes;
};
