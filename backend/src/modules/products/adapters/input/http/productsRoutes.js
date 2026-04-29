import { Router } from "express";
export const createProductsRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.get("/",       controller.getAllProducts);
  router.get("/:id",    controller.getProductById);
  router.post("/",      requireAuth, controller.addProduct);
  router.put("/:id",    requireAuth, controller.updateProduct);
  router.delete("/:id", requireAuth, controller.deleteProduct);
  return router;
};
