import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertPaymentsInputPort } from "../../../ports/input/paymentsInputPort.js";

export const createPaymentsHttpController = ({ paymentsInputPort }) => {
  assertPaymentsInputPort(paymentsInputPort);

  return {
    createPaymentIntent: asyncHandler(async (req, res) => {
      const payment = await paymentsInputPort.createPaymentIntent({
        orderId: req.body.orderId,
        items: req.body.items,
        currency: req.body.currency ?? "USD",
      });
      res.status(201).json(payment);
    }),

    verifyWebhook: asyncHandler(async (req, res) => {
      const signature = req.headers["stripe-signature"];
      await paymentsInputPort.verifyWebhook({ rawBody: req.rawBody, signature });
      res.status(200).json({ received: true });
    }),

    getPaymentByOrderId: asyncHandler(async (req, res) => {
      const payment = await paymentsInputPort.getPaymentByOrderId({ orderId: req.params.orderId });
      res.status(200).json(payment);
    }),
  };
};
