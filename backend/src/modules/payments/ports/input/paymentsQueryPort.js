export const createPaymentsQueryPort = ({ getSessionDetails }) => {
  return assertPaymentsQueryPort({ getSessionDetails });
};

export const assertPaymentsQueryPort = (paymentsQueryPort) => {
  if (!paymentsQueryPort || typeof paymentsQueryPort !== "object") {
    throw new Error("paymentsQueryPort is required");
  }

  const requiredMethods = ["getSessionDetails"];

  for (const methodName of requiredMethods) {
    if (typeof paymentsQueryPort[methodName] !== "function") {
      throw new Error(`paymentsQueryPort must implement ${methodName}`);
    }
  }

  return paymentsQueryPort;
};
