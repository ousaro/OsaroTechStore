import router from "express";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from "../../index.js";

const ordersRoutes = router();
ordersRoutes.use(requireAuth);
ordersRoutes.get("/", getAllOrdersHandler);
ordersRoutes.get("/:id", getOrderByIdHandler);
ordersRoutes.post("/", addOrderHandler);
ordersRoutes.put("/:id", updateOrderHandler);
ordersRoutes.delete("/:id", deleteOrderHandler);

export default ordersRoutes;
