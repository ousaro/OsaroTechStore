import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const ALLOWED_PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"]);
const ALLOWED_WORKFLOW_TYPES = new Set(["redirect_session"]);

export const createPaymentWorkflow = ({
  id,
  url,
  paymentReference,
  provider = "stripe",
  workflowType = "redirect_session",
  providerPaymentId,
  providerTransactionId,
  providerStatus,
  payment_status,
  paymentStatus,
}) => {
  if (typeof id !== "string" || id.trim() === "") {
    throw new DomainValidationError("payment workflow id is required");
  }

  const normalizedPaymentStatus = (paymentStatus ?? payment_status ?? "pending")
    .trim()
    .toLowerCase();

  if (!ALLOWED_PAYMENT_STATUSES.has(normalizedPaymentStatus)) {
    throw new DomainValidationError("Invalid payment workflow status");
  }

  if (typeof provider !== "string" || provider.trim() === "") {
    throw new DomainValidationError("payment provider is required");
  }

  if (
    typeof workflowType !== "string" ||
    workflowType.trim() === "" ||
    !ALLOWED_WORKFLOW_TYPES.has(workflowType.trim().toLowerCase())
  ) {
    throw new DomainValidationError("Invalid payment workflow type");
  }

  const props = {
    id,
    ...(paymentReference ? { paymentReference } : {}),
    ...(url ? { url } : {}),
    provider: provider.trim().toLowerCase(),
    workflowType: workflowType.trim().toLowerCase(),
    ...(providerPaymentId ?? providerTransactionId
      ? { providerPaymentId: providerPaymentId ?? providerTransactionId }
      : {}),
    ...(providerStatus ? { providerStatus } : {}),
    paymentStatus: normalizedPaymentStatus,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return { ...props };
    },
  });
};

export const createPaymentSession = createPaymentWorkflow;
