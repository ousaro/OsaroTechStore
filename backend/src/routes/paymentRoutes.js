import express from 'express';
import requireAuth from "../middleware/requireAuth.js";
import {
  createPaymentIntentHandler,
  stripeWebhookHandler,
  getSessionDetailsHandler,
} from "../modules/payments/index.js";

const router = express.Router();

// Middleware to require authentication for all routes in this router.
router.use(requireAuth);

router.post('/create-payment-intent', createPaymentIntentHandler);

// Webhook endpoint to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

router.get('/session-details/:sessionId', getSessionDetailsHandler);

export default router;
