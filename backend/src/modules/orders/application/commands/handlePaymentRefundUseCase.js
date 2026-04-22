import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { buildUpdateOrderUseCase } from "./updateOrderUseCase.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";

const CANCELLABLE_REFUND_ORDER_STATUSES = new Set(["pending", "paid", "processing"]);

export const buildHandlePaymentRefundUseCase = ({
  orderRepository,
  updateOrder = null,
  logger = console,
}) => {
  assertOrderRepositoryPort(orderRepository, ["findByPaymentReference"]);

  if (!logger || typeof logger.warn !== "function") {
    throw new Error("logger.warn is required");
  }

  const updateOrderUseCase =
    updateOrder ?? buildUpdateOrderUseCase({ orderRepository });

  return async ({ paymentReference, eventId } = {}) => {
    if (typeof paymentReference !== "string" || paymentReference.trim() === "") {
      throw new DomainValidationError("paymentReference is required");
    }

    const order = await orderRepository.findByPaymentReference(paymentReference);

    if (!order) {
      logger.warn(
        `Ignoring PaymentRefunded for paymentReference ${paymentReference}: correlated order not found`,
        { eventId, paymentReference }
      );
      return null;
    }

    return updateOrderUseCase({
      id: order._id ?? order.id,
      updates: {
        paymentStatus: "refunded",
        ...(CANCELLABLE_REFUND_ORDER_STATUSES.has(order.status)
          ? { status: "cancelled" }
          : {}),
      },
    });
  };
};
