import router from "express";
import { verifyAccessToken } from "../../../auth/index.js";
import { createRequireAuthMiddleware } from "../../../../shared/infrastructure/http/createRequireAuthMiddleware.js";
import {
  getAllOrdersHandler,
  getOrderByIdHandler,
  addOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
} from "../../index.js";

const ordersRoutes = router();
const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

ordersRoutes.use(requireAuth);
ordersRoutes.get("/", getAllOrdersHandler);
ordersRoutes.get("/:id", getOrderByIdHandler);
ordersRoutes.post("/", addOrderHandler);
ordersRoutes.put("/:id", updateOrderHandler);
ordersRoutes.delete("/:id", deleteOrderHandler);

export default ordersRoutes;
