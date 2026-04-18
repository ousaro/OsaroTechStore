import router from "express";
import { verifyAccessToken } from "../../../auth/index.js";
import { createRequireAuthMiddleware } from "../../../../shared/infrastructure/http/createRequireAuthMiddleware.js";
import {
  getAllCategoriesHandler,
  addNewCategoryHandler,
  deleteCategoryHandler,
} from "../../index.js";

const categoriesRoutes = router();
const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

categoriesRoutes.use(requireAuth);
categoriesRoutes.get("/", getAllCategoriesHandler);
categoriesRoutes.post("/", addNewCategoryHandler);
categoriesRoutes.delete("/:id", deleteCategoryHandler);

export default categoriesRoutes;
