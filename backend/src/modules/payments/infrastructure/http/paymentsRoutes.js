import express from "express";
import { verifyAccessToken } from "../../../auth/index.js";
import { createRequireAuthMiddleware } from "../../../../shared/infrastructure/http/createRequireAuthMiddleware.js";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "../../index.js";

const paymentsRoutes = express.Router();
const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

paymentsRoutes.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
paymentsRoutes.use(requireAuth);
paymentsRoutes.post("/create-payment-intent", createPaymentIntentHandler);
paymentsRoutes.get("/session-details/:sessionId", getSessionDetailsHandler);

export default paymentsRoutes;
