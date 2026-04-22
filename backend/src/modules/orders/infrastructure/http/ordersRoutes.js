import router from "express";
import {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from "./httpHandlers.js";

export const createOrdersRoutes = ({ requireAuth }) => {
  const ordersRoutes = router();

  ordersRoutes.use(requireAuth);
  ordersRoutes.get("/", getAllOrdersHandler);
  ordersRoutes.get("/:id", getOrderByIdHandler);
  ordersRoutes.post("/", addOrderHandler);
  ordersRoutes.put("/:id", updateOrderHandler);
  ordersRoutes.delete("/:id", deleteOrderHandler);

  return ordersRoutes;
};
