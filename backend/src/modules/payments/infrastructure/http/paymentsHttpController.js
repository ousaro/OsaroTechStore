export const createPaymentsHttpController = ({
  createPaymentIntentUseCase,
  verifyWebhookUseCase,
  getSessionDetailsUseCase,
}) => {
  const createPaymentIntentHandler = async (req, res) => {
    try {
      const payload = await createPaymentIntentUseCase({ items: req.body.items });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  const stripeWebhookHandler = async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"];
      const payload = await verifyWebhookUseCase({ payload: req.body, signature });
      return res.status(200).json(payload);
    } catch (error) {
      return res.sendStatus(400);
    }
  };

  const getSessionDetailsHandler = async (req, res) => {
    try {
      const payload = await getSessionDetailsUseCase({ sessionId: req.params.sessionId });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(500).json({ error: "Failed to retrieve session details" });
    }
  };

  return {
    createPaymentIntentHandler,
    stripeWebhookHandler,
    getSessionDetailsHandler,
  };
};
