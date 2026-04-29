import { Router } from "express";
export const createCategoriesRoutes = ({ controller, requireAuth }) => {
  const router = Router();
  router.get("/",       controller.getAllCategories);
  router.get("/:id",    controller.getCategoryById);
  router.post("/",      requireAuth, controller.addCategory);
  router.put("/:id",    requireAuth, controller.updateCategory);
  router.delete("/:id", requireAuth, controller.deleteCategory);
  return router;
};
