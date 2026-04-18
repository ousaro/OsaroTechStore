import router from "express";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../../index.js";

const productsRoutes = router();
productsRoutes.use(requireAuth);
productsRoutes.get("/", getAllProductsHandler);
productsRoutes.get("/:id", getProductByIdHandler);
productsRoutes.post("/", addProductHandler);
productsRoutes.put("/:id", updateProductHandler);
productsRoutes.delete("/:id", deleteProductHandler);

export default productsRoutes;
