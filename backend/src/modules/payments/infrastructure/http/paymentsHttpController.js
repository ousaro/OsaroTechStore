import { asyncHandler } from "../../../../shared/infrastructure/http/asyncHandler.js";
import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const createPaymentsHttpController = ({
  createPaymentIntentUseCase,
  verifyWebhookUseCase,
  getSessionDetailsUseCase,
}) => {
  const createPaymentIntentHandler = asyncHandler(async (req, res) => {
    const payload = await createPaymentIntentUseCase({ items: req.body.items });
    return res.status(200).json(payload);
  });

  const stripeWebhookHandler = asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
      const payload = await verifyWebhookUseCase({ payload: req.body, signature });
      return res.status(200).json(payload);
    } catch (_error) {
      throw new ApiError("Webhook signature verification failed", 400);
    }
  });

  const getSessionDetailsHandler = asyncHandler(async (req, res) => {
    const payload = await getSessionDetailsUseCase({ sessionId: req.params.sessionId });
    return res.status(200).json(payload);
  });

  return {
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  };
};
