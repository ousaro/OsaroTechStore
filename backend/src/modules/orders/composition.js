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
import { handleOrderPlaced } from "./application/handlers/handleOrderPlaced.js";


export const createOrdersModule = ({
  orderRepository,
  orderEventPublisher = null,
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

export const registerOrderWorkflows = ({ eventBus }) => {
  eventBus.subscribe("OrderPlaced", handleOrderPlaced);
};

export const configureOrdersModule = (options = {}) => {
  ordersModule = createOrdersModule(options);
  return {
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  } = ordersModule;
};
