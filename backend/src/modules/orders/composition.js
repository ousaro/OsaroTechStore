import { buildGetAllOrdersUseCase } from "./application/queries/getAllOrdersUseCase.js";
import { buildGetOrderByIdUseCase } from "./application/queries/getOrderByIdUseCase.js";
import { buildAddOrderUseCase } from "./application/commands/addOrderUseCase.js";
import { buildConfirmOrderPaymentUseCase } from "./application/commands/confirmOrderPaymentUseCase.js";
import { buildUpdateOrderUseCase } from "./application/commands/updateOrderUseCase.js";
import { buildDeleteOrderUseCase } from "./application/commands/deleteOrderUseCase.js";
import { buildHandlePaymentExpirationUseCase } from "./application/commands/handlePaymentExpirationUseCase.js";
import { buildHandlePaymentFailureUseCase } from "./application/commands/handlePaymentFailureUseCase.js";
import { buildHandlePaymentRefundUseCase } from "./application/commands/handlePaymentRefundUseCase.js";
import { createOrdersCommandPort } from "./ports/input/ordersCommandPort.js";
import { createOrdersQueryPort } from "./ports/input/ordersQueryPort.js";
import { createMongooseOrderRepository } from "./adapters/output/repositories/mongooseOrderRepository.js";
import { createOrdersHttpController } from "./adapters/input/http/ordersHttpController.js";
import { applicationEventBus } from "../../app/applicationEventBus.js";

const orderRepository = createMongooseOrderRepository();
const orderEventPublisher = applicationEventBus;

const getAllOrdersUseCase = buildGetAllOrdersUseCase({ orderRepository });
const getOrderByIdUseCase = buildGetOrderByIdUseCase({ orderRepository });
const addOrderUseCase = buildAddOrderUseCase({
  orderRepository,
  orderEventPublisher,
});
export const confirmOrderPayment = buildConfirmOrderPaymentUseCase({
  orderRepository,
});
export const handlePaymentFailure = buildHandlePaymentFailureUseCase({
  orderRepository,
});
export const handlePaymentExpiration = buildHandlePaymentExpirationUseCase({
  orderRepository,
});
export const handlePaymentRefund = buildHandlePaymentRefundUseCase({
  orderRepository,
});
const updateOrderUseCase = buildUpdateOrderUseCase({ orderRepository });
const deleteOrderUseCase = buildDeleteOrderUseCase({ orderRepository });
const ordersCommandPort = createOrdersCommandPort({
  addOrder: addOrderUseCase,
  updateOrder: updateOrderUseCase,
  deleteOrder: deleteOrderUseCase,
});
const ordersQueryPort = createOrdersQueryPort({
  getAllOrders: getAllOrdersUseCase,
  getOrderById: getOrderByIdUseCase,
});

export const {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} = createOrdersHttpController({
  ordersCommandPort,
  ordersQueryPort,
});
