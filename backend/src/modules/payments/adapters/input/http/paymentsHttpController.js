import { asyncHandler } from "../../../../../shared/infrastructure/http/middleware/asyncHandler.js";
import { PaymentWebhookError } from "../../../application/errors/PaymentApplicationError.js";
import { assertPaymentsCommandPort } from "../../../ports/input/paymentsCommandPort.js";
import { assertPaymentsQueryPort } from "../../../ports/input/paymentsQueryPort.js";

export const createPaymentsHttpController = ({
  paymentsCommandPort,
  paymentsQueryPort,
}) => {
  assertPaymentsCommandPort(paymentsCommandPort);
  assertPaymentsQueryPort(paymentsQueryPort);

  const createPaymentIntentHandler = asyncHandler(async (req, res) => {
    const payload = await paymentsCommandPort.createPaymentIntent({ items: req.body.items });
    return res.status(200).json(payload);
  });

  const stripeWebhookHandler = asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
      const payload = await paymentsCommandPort.verifyWebhook({
        payload: req.body,
        signature,
      });
      return res.status(200).json(payload);
    } catch (_error) {
      throw new PaymentWebhookError("Webhook signature verification failed");
    }
  });

  const getSessionDetailsHandler = asyncHandler(async (req, res) => {
    const payload = await paymentsQueryPort.getSessionDetails({
      sessionId: req.params.sessionId,
    });
    return res.status(200).json(payload);
  });

  return {
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  };
};
