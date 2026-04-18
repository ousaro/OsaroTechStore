// Backward-compatible exports for any existing imports.
import {
  getAllOrdersHandler as getAllOrders,
  getOrderByIdHandler as getOrderById,
  addOrderHandler as addOrder,
  updateOrderHandler as updateOrder,
  deleteOrderHandler as deleteOrder,
} from "../modules/orders/index.js";

export { getAllOrders, getOrderById, addOrder, updateOrder, deleteOrder };
