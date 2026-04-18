import router from "express";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} from "../../index.js";

const categoriesRoutes = router();
categoriesRoutes.use(requireAuth);
categoriesRoutes.get("/", getAllCategoriesHandler);
categoriesRoutes.post("/", addNewCategoryHandler);
categoriesRoutes.delete("/:id", deleteCategoryHandler);

export default categoriesRoutes;
