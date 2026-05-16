import { buildAddOrderUseCase } from "./application/commands/addOrderUseCase.js";
import { buildUpdateOrderUseCase } from "./application/commands/updateOrderUseCase.js";
import { buildDeleteOrderUseCase } from "./application/commands/deleteOrderUseCase.js";
import { buildConfirmOrderPaymentUseCase } from "./application/commands/confirmOrderPaymentUseCase.js";
import { buildGetAllOrdersUseCase } from "./application/queries/getAllOrdersUseCase.js";
import { buildGetOrderByIdUseCase } from "./application/queries/getOrderByIdUseCase.js";

import { createOrdersInputPort } from "./ports/input/ordersInputPort.js";
import {
  assertOrderRepositoryPort,
  assertOrderEventPublisherPort,
} from "./ports/output/ordersOutputPort.js";

import { createOrdersHttpController } from "./adapters/input/http/ordersHttpController.js";
import { createOrdersRoutes } from "./adapters/input/http/ordersRoutes.js";

export const createOrdersModule = ({ orderRepository, orderEventPublisher, logger }) => {
  assertOrderRepositoryPort(orderRepository);
  assertOrderEventPublisherPort(orderEventPublisher);

  const addOrder = buildAddOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const updateOrder = buildUpdateOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const deleteOrder = buildDeleteOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const confirmOrderPayment = buildConfirmOrderPaymentUseCase({ orderRepository, logger });
  const getAllOrders = buildGetAllOrdersUseCase({ orderRepository });
  const getOrderById = buildGetOrderByIdUseCase({ orderRepository });

  const ordersInputPort = createOrdersInputPort({
    addOrder,
    updateOrder,
    deleteOrder,
    confirmOrderPayment,
    getAllOrders,
    getOrderById,
  });

  const controller = createOrdersHttpController({ ordersInputPort });

  const createRoutes = ({ requireAuth } = {}) => createOrdersRoutes({ controller, requireAuth });

  return {
    createRoutes,
    confirmOrderPayment: ordersInputPort.confirmOrderPayment,
  };
};
