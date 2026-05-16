import { Router } from "express";
import express from "express";

export const createPaymentsRoutes = ({ controller, requireAuth, webhookEnabled }) => {
  const router = Router();

  if (webhookEnabled) {
    router.post(
      "/webhook",
      express.raw({ type: "application/json" }),
      (req, _res, next) => {
        req.rawBody = req.body;
        next();
      },
      controller.verifyWebhook
    );
  }

  router.post("/intent", requireAuth, controller.createPaymentIntent);
  router.get("/order/:orderId", requireAuth, controller.getPaymentByOrderId);

  return router;
};
