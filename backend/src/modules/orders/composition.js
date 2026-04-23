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
import { createOrdersHttpController } from "./adapters/input/http/ordersHttpController.js";

const defaultOrderEventPublisher = null;

export const createOrdersModule = ({
  orderRepository,
  orderEventPublisher = defaultOrderEventPublisher,
} = {}) => {
  const getAllOrdersUseCase = buildGetAllOrdersUseCase({ orderRepository });
  const getOrderByIdUseCase = buildGetOrderByIdUseCase({ orderRepository });
  const confirmOrderPayment = buildConfirmOrderPaymentUseCase({
    orderRepository,
  });
  const handlePaymentFailure = buildHandlePaymentFailureUseCase({
    orderRepository,
  });
  const handlePaymentExpiration = buildHandlePaymentExpirationUseCase({
    orderRepository,
  });
  const handlePaymentRefund = buildHandlePaymentRefundUseCase({
    orderRepository,
  });
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

  return {
    ...createOrdersHttpController({
      ordersCommandPort,
      ordersQueryPort,
    }),
    confirmOrderPayment,
    handlePaymentFailure,
    handlePaymentExpiration,
    handlePaymentRefund,
  };
};

export let getAllOrdersHandler;
export let getOrderByIdHandler;
export let addOrderHandler;
export let updateOrderHandler;
export let deleteOrderHandler;

let ordersModule;

const getConfiguredOrdersModule = () => {
  if (!ordersModule) {
    throw new Error("Orders module has not been configured");
  }

  return ordersModule;
};

export const confirmOrderPayment = (...args) =>
  getConfiguredOrdersModule().confirmOrderPayment(...args);

export const handlePaymentFailure = (...args) =>
  getConfiguredOrdersModule().handlePaymentFailure(...args);

export const handlePaymentExpiration = (...args) =>
  getConfiguredOrdersModule().handlePaymentExpiration(...args);

export const handlePaymentRefund = (...args) =>
  getConfiguredOrdersModule().handlePaymentRefund(...args);

export const configureOrdersModule = (options = {}) => {
  ordersModule = createOrdersModule(options);
  ({
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  } = ordersModule);
};
