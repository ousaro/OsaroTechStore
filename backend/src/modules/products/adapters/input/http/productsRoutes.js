import { Router } from "express";
export const createProductsRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.get("/", controller.getAllProducts);
  router.get("/:id", controller.getProductById);
  router.post("/", requireAuth, requireAuth.requireAdmin, controller.addProduct);
  router.put("/:id", requireAuth, requireAuth.requireAdmin, controller.updateProduct);
  router.delete("/:id", requireAuth, requireAuth.requireAdmin, controller.deleteProduct);
  return router;
};
