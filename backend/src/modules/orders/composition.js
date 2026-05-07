/**
 * Orders Module Composition.
 *
 * Pure factory function. The composition root calls this once and holds
 * the returned instance. No module-level let singletons. No env imports.
 *
 */
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
  // ── Validate output ports ────────────────────────────────────────────────
  assertOrderRepositoryPort(orderRepository);
  assertOrderEventPublisherPort(orderEventPublisher);

  // ── Use cases ────────────────────────────────────────────────────────────
  const addOrder = buildAddOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const updateOrder = buildUpdateOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const deleteOrder = buildDeleteOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const confirmOrderPayment = buildConfirmOrderPaymentUseCase({ orderRepository, logger });
  const getAllOrders = buildGetAllOrdersUseCase({ orderRepository });
  const getOrderById = buildGetOrderByIdUseCase({ orderRepository });

  // ── Input port ───────────────────────────────────────────────────────────
  const ordersInputPort = createOrdersInputPort({
    addOrder,
    updateOrder,
    deleteOrder,
    confirmOrderPayment,
    getAllOrders,
    getOrderById,
  });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createOrdersHttpController({ ordersInputPort });

  const createRoutes = ({ requireAuth } = {}) => createOrdersRoutes({ controller, requireAuth });

  // ── Public surface ───────────────────────────────────────────────────────
  // confirmOrderPayment is exposed for the collaboration translator
  // wired in the composition root — not called directly by other modules.
  return {
    createRoutes,
    confirmOrderPayment: ordersInputPort.confirmOrderPayment,
  };
};
