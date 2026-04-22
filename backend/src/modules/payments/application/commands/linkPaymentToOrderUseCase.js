import { assertPaymentRepositoryPort } from "../../ports/output/paymentRepositoryPort.js";

export const buildLinkPaymentToOrderUseCase = ({ paymentRepository }) => {
  assertPaymentRepositoryPort(paymentRepository, ["linkPaymentToOrder"]);

  return async ({ paymentReference, orderId }) => {
    if (typeof paymentReference !== "string" || paymentReference.trim() === "") {
      throw new Error("paymentReference is required");
    }

    if (typeof orderId !== "string" || orderId.trim() === "") {
      throw new Error("orderId is required");
    }

    return paymentRepository.linkPaymentToOrder({ paymentReference, orderId });
  };
};
