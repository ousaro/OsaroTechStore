import { createOrder } from "../../domain/entities/Order.js";
import { applyPaymentOutcomeToOrder } from "../../domain/services/orderDomainServices.js";
import { OrderNotFoundError } from "../errors/OrderApplicationError.js";
import { toOrderReadModel } from "../read-models/orderReadModel.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildConfirmOrderPaymentUseCase =
  ({ orderRepository, logger }) =>
  async ({ orderId, paymentStatus }) => {
    assertNonEmptyString(orderId, "orderId");
    assertNonEmptyString(paymentStatus, "paymentStatus");

    const existing = await orderRepository.findById(orderId);
    if (!existing) throw new OrderNotFoundError(`Order ${orderId} not found`);

    const order = createOrder(existing);
    const updated = applyPaymentOutcomeToOrder(order, paymentStatus);
    const saved = await orderRepository.updateById(orderId, updated.toPrimitives());

    logger?.info({ msg: "Order payment confirmed", orderId, paymentStatus });
    return toOrderReadModel(saved);
  };
