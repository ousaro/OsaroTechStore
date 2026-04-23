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

const orderRepository = createMongooseOrderRepository();
const defaultOrderEventPublisher = null;

const getAllOrdersUseCase = buildGetAllOrdersUseCase({ orderRepository });
const getOrderByIdUseCase = buildGetOrderByIdUseCase({ orderRepository });
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
const buildOrderModule = ({
  orderEventPublisher = defaultOrderEventPublisher,
} = {}) => {
  const addOrderUseCase = buildAddOrderUseCase({
    orderRepository,
    orderEventPublisher,
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

  return createOrdersHttpController({
    ordersCommandPort,
    ordersQueryPort,
  });
};

export let getAllOrdersHandler;
export let getOrderByIdHandler;
export let addOrderHandler;
export let updateOrderHandler;
export let deleteOrderHandler;

export const configureOrdersModule = (options = {}) => {
  ({
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  } = buildOrderModule(options));
};

configureOrdersModule();
