import { buildGetAllOrdersUseCase } from "./application/use-cases/getAllOrdersUseCase.js";
import { buildGetOrderByIdUseCase } from "./application/use-cases/getOrderByIdUseCase.js";
import { buildAddOrderUseCase } from "./application/use-cases/addOrderUseCase.js";
import { buildUpdateOrderUseCase } from "./application/use-cases/updateOrderUseCase.js";
import { buildDeleteOrderUseCase } from "./application/use-cases/deleteOrderUseCase.js";
import { createOrdersCommandPort } from "./ports/input/ordersCommandPort.js";
import { createOrdersQueryPort } from "./ports/input/ordersQueryPort.js";
import { createMongooseOrderRepository } from "./infrastructure/repositories/mongooseOrderRepository.js";
import { createOrdersHttpController } from "./infrastructure/http/ordersHttpController.js";

const orderRepository = createMongooseOrderRepository();

const getAllOrdersUseCase = buildGetAllOrdersUseCase({ orderRepository });
const getOrderByIdUseCase = buildGetOrderByIdUseCase({ orderRepository });
const addOrderUseCase = buildAddOrderUseCase({ orderRepository });
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
