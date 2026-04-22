import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export const createPaymentSession = ({ id, url, payment_status, paymentStatus }) => {
  if (typeof id !== "string" || id.trim() === "") {
    throw new DomainValidationError("payment session id is required");
  }

  const normalizedPaymentStatus = paymentStatus ?? payment_status ?? "pending";
  const props = {
    id,
    ...(url ? { url } : {}),
    paymentStatus: normalizedPaymentStatus,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};
