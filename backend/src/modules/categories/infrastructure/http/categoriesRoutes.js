import router from "express";
import {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} from "../../index.js";

export const createCategoriesRoutes = ({ requireAuth }) => {
  const categoriesRoutes = router();

  categoriesRoutes.use(requireAuth);
  categoriesRoutes.get("/", getAllCategoriesHandler);
  categoriesRoutes.post("/", addNewCategoryHandler);
  categoriesRoutes.delete("/:id", deleteCategoryHandler);

  return categoriesRoutes;
};
