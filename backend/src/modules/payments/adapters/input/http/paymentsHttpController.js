import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";

export const createPaymentsHttpController = ({ commandPort, queryPort }) => ({
  createPaymentIntent: asyncHandler(async (req, res) => {
    const payment = await commandPort.createPaymentIntent({
      orderId:    req.body.orderId,
      items:      req.body.items,
      currency:   req.body.currency ?? "USD",
    });
    res.status(201).json(payment);
  }),

  verifyWebhook: asyncHandler(async (req, res) => {
    // req.rawBody is set by the express.raw() middleware on this route only
    const signature = req.headers["stripe-signature"];
    await commandPort.verifyWebhook({ rawBody: req.rawBody, signature });
    res.status(200).json({ received: true });
  }),

  getPaymentByOrderId: asyncHandler(async (req, res) => {
    const payment = await queryPort.getPaymentByOrderId({ orderId: req.params.orderId });
    res.status(200).json(payment);
  }),
});
