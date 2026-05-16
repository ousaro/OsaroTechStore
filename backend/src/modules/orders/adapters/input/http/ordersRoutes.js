import { Router } from "express";

export const createOrdersRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.getAllOrders);
  router.get("/:id", controller.getOrderById);
  router.post("/", controller.addOrder);
  router.put("/:id", controller.updateOrder);
  router.delete("/:id", controller.deleteOrder);

  return router;
};
