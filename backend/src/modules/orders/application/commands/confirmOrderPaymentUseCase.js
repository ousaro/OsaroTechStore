import { buildUpdateOrderUseCase } from "./updateOrderUseCase.js";
import { assertOrderRepositoryPort } from "../../ports/output/orderRepositoryPort.js";
import { assertFunction,assertNonEmptyString } from "../../../../shared/infrastructure/assertions";

export const buildConfirmOrderPaymentUseCase = ({
  orderRepository,
  updateOrder = null,
  logger = console,
}) => {
  assertOrderRepositoryPort(orderRepository, ["findByPaymentReference"]);

  assertFunction(logger.warn, 'logger.warn')

  const updateOrderUseCase =
    updateOrder ?? buildUpdateOrderUseCase({ orderRepository });

  return async ({ paymentReference, eventId } = {}) => {
    assertNonEmptyString(paymentReference, "paymentReference")

    const order = await orderRepository.findByPaymentReference(paymentReference);

    if (!order) {
      logger.warn(
        `Ignoring PaymentConfirmed for paymentReference ${paymentReference}: correlated order not found`,
        { eventId, paymentReference }
      );
      return null;
    }

    return updateOrderUseCase({
      id: order._id ?? order.id,
      updates: {
        paymentStatus: "paid",
        status: "paid",
      },
    });
  };
};
