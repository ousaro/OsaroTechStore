import { Router }  from "express";
import express      from "express";

export const createPaymentsRoutes = ({ controller, requireAuth, webhookEnabled }) => {
  const router = Router();

  // Webhook: raw body needed for Stripe signature verification.
  // express.json() is bypassed for this route in createApp.js.
  if (webhookEnabled) {
    router.post(
      "/webhook",
      express.raw({ type: "application/json" }),
      (req, _res, next) => {
        req.rawBody = req.body; // Buffer
        next();
      },
      controller.verifyWebhook
    );
  }

  // Protected routes
  router.post("/intent",          requireAuth, controller.createPaymentIntent);
  router.get("/order/:orderId",   requireAuth, controller.getPaymentByOrderId);

  return router;
};
