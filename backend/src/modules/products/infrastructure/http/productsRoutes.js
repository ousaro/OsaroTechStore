import router from "express";
import { verifyAccessToken } from "../../../auth/index.js";
import { createRequireAuthMiddleware } from "../../../../shared/infrastructure/http/createRequireAuthMiddleware.js";
import {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../../index.js";

const productsRoutes = router();
const requireAuth = createRequireAuthMiddleware({ verifyAccessToken });

productsRoutes.use(requireAuth);
productsRoutes.get("/", getAllProductsHandler);
productsRoutes.get("/:id", getProductByIdHandler);
productsRoutes.post("/", addProductHandler);
productsRoutes.put("/:id", updateProductHandler);
productsRoutes.delete("/:id", deleteProductHandler);

export default productsRoutes;
