/**
 * Orders Module Composition.
 *
 * Pure factory function. The composition root calls this once and holds
 * the returned instance. No module-level let singletons. No env imports.
 *
 * Fixed from original:
 *  - Removed all module-level `export let handler` declarations (crash bug).
 *  - configureOrdersModule / createOrdersModule duality eliminated.
 *  - confirmOrderPayment exposed as a collaboration method for translators.
 *  - createRoutes is a factory that receives requireAuth at registration time.
 */
import {
  buildAddOrderUseCase,
  buildUpdateOrderUseCase,
  buildDeleteOrderUseCase,
  buildConfirmOrderPaymentUseCase,
  buildGetAllOrdersUseCase,
  buildGetOrderByIdUseCase,
} from "./application/useCases.js";

import { createOrdersCommandPort, createOrdersQueryPort }
  from "./ports/input/ordersInputPort.js";
import { assertOrderRepositoryPort, assertOrderEventPublisherPort }
  from "./ports/output/ordersOutputPort.js";

import { createOrdersHttpController } from "./adapters/input/http/ordersHttpController.js";
import { createOrdersRoutes }         from "./adapters/input/http/ordersRoutes.js";

export const createOrdersModule = ({
  orderRepository,
  orderEventPublisher,
  logger,
}) => {
  // ── Validate output ports ────────────────────────────────────────────────
  assertOrderRepositoryPort(orderRepository);
  assertOrderEventPublisherPort(orderEventPublisher);

  // ── Use cases ────────────────────────────────────────────────────────────
  const addOrder            = buildAddOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const updateOrder         = buildUpdateOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const deleteOrder         = buildDeleteOrderUseCase({ orderRepository, orderEventPublisher, logger });
  const confirmOrderPayment = buildConfirmOrderPaymentUseCase({ orderRepository, logger });
  const getAllOrders         = buildGetAllOrdersUseCase({ orderRepository });
  const getOrderById        = buildGetOrderByIdUseCase({ orderRepository });

  // ── Input ports ──────────────────────────────────────────────────────────
  const commandPort = createOrdersCommandPort({
    addOrder, updateOrder, deleteOrder, confirmOrderPayment,
  });

  const queryPort = createOrdersQueryPort({ getAllOrders, getOrderById });

  // ── HTTP adapter ─────────────────────────────────────────────────────────
  const controller = createOrdersHttpController({ commandPort, queryPort });

  const createRoutes = ({ requireAuth } = {}) =>
    createOrdersRoutes({ controller, requireAuth });

  // ── Public surface ───────────────────────────────────────────────────────
  // confirmOrderPayment is exposed for the collaboration translator
  // wired in the composition root — not called directly by other modules.
  return {
    createRoutes,
    confirmOrderPayment,  // consumed by paymentConfirmedOrderSyncTranslator
  };
};
