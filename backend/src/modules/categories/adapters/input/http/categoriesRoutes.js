import { Router } from "express";
export const createCategoriesRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.get("/", controller.getAllCategories);
  router.get("/:id", controller.getCategoryById);
  router.post("/", requireAuth, requireAuth.requireAdmin, controller.addCategory);
  router.put("/:id", requireAuth, requireAuth.requireAdmin, controller.updateCategory);
  router.delete("/:id", requireAuth, requireAuth.requireAdmin, controller.deleteCategory);
  return router;
};
