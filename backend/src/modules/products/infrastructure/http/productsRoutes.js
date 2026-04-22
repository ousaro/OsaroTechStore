import router from "express";
import {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./httpHandlers.js";

export const createProductsRoutes = ({ requireAuth }) => {
  const productsRoutes = router();

  productsRoutes.use(requireAuth);
  productsRoutes.get("/", getAllProductsHandler);
  productsRoutes.get("/:id", getProductByIdHandler);
  productsRoutes.post("/", addProductHandler);
  productsRoutes.put("/:id", updateProductHandler);
  productsRoutes.delete("/:id", deleteProductHandler);

  return productsRoutes;
};
