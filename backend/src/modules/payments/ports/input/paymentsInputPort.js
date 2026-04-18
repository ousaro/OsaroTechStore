export const createPaymentsInputPort = ({
  createPaymentIntent,
  verifyWebhook,
  getSessionDetails,
}) => {
  return assertPaymentsInputPort({
    createPaymentIntent,
    verifyWebhook,
    getSessionDetails,
  });
};

export const assertPaymentsInputPort = (paymentsInputPort) => {
  if (!paymentsInputPort || typeof paymentsInputPort !== "object") {
    throw new Error("paymentsInputPort is required");
  }

  const requiredMethods = ["createPaymentIntent", "verifyWebhook", "getSessionDetails"];

  for (const methodName of requiredMethods) {
    if (typeof paymentsInputPort[methodName] !== "function") {
      throw new Error(`paymentsInputPort must implement ${methodName}`);
    }
  }
  return paymentsInputPort;
};
