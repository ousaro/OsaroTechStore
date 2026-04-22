import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { PaymentWebhookError } from "../../application/errors/PaymentApplicationError.js";
import { assertPaymentsInputPort } from "../../ports/input/paymentsInputPort.js";

export const createPaymentsHttpController = ({ paymentsInputPort }) => {
  assertPaymentsInputPort(paymentsInputPort);

  const createPaymentIntentHandler = asyncHandler(async (req, res) => {
    const payload = await paymentsInputPort.createPaymentIntent({ items: req.body.items });
    return res.status(200).json(payload);
  });

  const stripeWebhookHandler = asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
      const payload = await paymentsInputPort.verifyWebhook({ payload: req.body, signature });
      return res.status(200).json(payload);
    } catch (_error) {
      throw new PaymentWebhookError("Webhook signature verification failed");
    }
  });

  const getSessionDetailsHandler = asyncHandler(async (req, res) => {
    const payload = await paymentsInputPort.getSessionDetails({ sessionId: req.params.sessionId });
    return res.status(200).json(payload);
  });

  return {
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  };
};
