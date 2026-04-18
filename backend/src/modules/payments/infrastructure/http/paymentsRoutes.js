import express from "express";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "../../index.js";

const paymentsRoutes = express.Router();
paymentsRoutes.use(requireAuth);
paymentsRoutes.post("/create-payment-intent", createPaymentIntentHandler);
paymentsRoutes.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
paymentsRoutes.get("/session-details/:sessionId", getSessionDetailsHandler);

export default paymentsRoutes;
