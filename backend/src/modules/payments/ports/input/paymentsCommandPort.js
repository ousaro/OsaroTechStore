export const createPaymentsCommandPort = ({ createPaymentIntent, verifyWebhook }) => {
  return assertPaymentsCommandPort({
    createPaymentIntent,
    verifyWebhook,
  });
};

export const assertPaymentsCommandPort = (paymentsCommandPort) => {
  if (!paymentsCommandPort || typeof paymentsCommandPort !== "object") {
    throw new Error("paymentsCommandPort is required");
  }

  const requiredMethods = ["createPaymentIntent", "verifyWebhook"];

  for (const methodName of requiredMethods) {
    if (typeof paymentsCommandPort[methodName] !== "function") {
      throw new Error(`paymentsCommandPort must implement ${methodName}`);
    }
  }

  return paymentsCommandPort;
};
