import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const ALLOWED_PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"]);

export const createPaymentSession = ({
  id,
  url,
  paymentReference,
  providerTransactionId,
  payment_status,
  paymentStatus,
}) => {
  if (typeof id !== "string" || id.trim() === "") {
    throw new DomainValidationError("payment session id is required");
  }

  const normalizedPaymentStatus = (paymentStatus ?? payment_status ?? "pending")
    .trim()
    .toLowerCase();

  if (!ALLOWED_PAYMENT_STATUSES.has(normalizedPaymentStatus)) {
    throw new DomainValidationError("Invalid payment session status");
  }

  const props = {
    id,
    ...(paymentReference ? { paymentReference } : {}),
    ...(url ? { url } : {}),
    ...(providerTransactionId ? { providerTransactionId } : {}),
    paymentStatus: normalizedPaymentStatus,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};
