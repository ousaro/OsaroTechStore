import { createPaypalGateway } from "../gateways/paypalGateway.js";
import { ServiceUnavailableError } from "../../../../shared/application/errors/ServiceUnavailableError.js";

export const createPaypalProvider = (config = {}) => {
  const enabled = Boolean(config.clientId && config.clientSecret);

  if (!enabled) {
    throw new ServiceUnavailableError("PayPal is not configured");
  }

  const gateway = createPaypalGateway(config);

  return {
    provider: "paypal",
    gateway,
  };
};