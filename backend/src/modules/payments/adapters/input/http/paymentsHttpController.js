import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { assertPaymentsCommandsPort } from "../../../ports/input/paymentsCommandsPort.js";
import { assertPaymentsQueriesPort } from "../../../ports/input/paymentsQueriesPort.js";

export const createPaymentsHttpController = ({ paymentsCommands, paymentsQueries }) => {
  assertPaymentsCommandsPort(paymentsCommands);
  assertPaymentsQueriesPort(paymentsQueries);

  return {
    createPaymentIntent: asyncHandler(async (req, res) => {
      const payment = await paymentsCommands.createPaymentIntent({
        orderId: req.body.orderId,
        items: req.body.items,
        currency: req.body.currency ?? "USD",
      });
      res.status(201).json(payment);
    }),

    verifyWebhook: asyncHandler(async (req, res) => {
      const signature = req.headers["stripe-signature"];
      await paymentsCommands.verifyWebhook({ rawBody: req.rawBody, signature });
      res.status(200).json({ received: true });
    }),

    getPaymentByOrderId: asyncHandler(async (req, res) => {
      const payment = await paymentsQueries.getPaymentByOrderId({ orderId: req.params.orderId });
      res.status(200).json(payment);
    }),
  };
};
