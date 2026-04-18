import { buildGetAllOrdersUseCase } from "./application/use-cases/getAllOrdersUseCase.js";
import { buildGetOrderByIdUseCase } from "./application/use-cases/getOrderByIdUseCase.js";
import { buildAddOrderUseCase } from "./application/use-cases/addOrderUseCase.js";
import { buildUpdateOrderUseCase } from "./application/use-cases/updateOrderUseCase.js";
import { buildDeleteOrderUseCase } from "./application/use-cases/deleteOrderUseCase.js";
import { createOrdersInputPort } from "./ports/input/ordersInputPort.js";
import { createMongooseOrderRepository } from "./infrastructure/repositories/mongooseOrderRepository.js";
import { createOrdersHttpController } from "./infrastructure/http/ordersHttpController.js";

const orderRepository = createMongooseOrderRepository();

const getAllOrdersUseCase = buildGetAllOrdersUseCase({ orderRepository });
const getOrderByIdUseCase = buildGetOrderByIdUseCase({ orderRepository });
const addOrderUseCase = buildAddOrderUseCase({ orderRepository });
const updateOrderUseCase = buildUpdateOrderUseCase({ orderRepository });
const deleteOrderUseCase = buildDeleteOrderUseCase({ orderRepository });
export const ordersInputPort = createOrdersInputPort({
  getAllOrders: getAllOrdersUseCase,
  getOrderById: getOrderByIdUseCase,
  addOrder: addOrderUseCase,
  updateOrder: updateOrderUseCase,
  deleteOrder: deleteOrderUseCase,
});

export const {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} = createOrdersHttpController({
  ordersInputPort,
});
