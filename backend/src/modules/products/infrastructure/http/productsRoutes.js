import router from "express";
import cron from "node-cron";
import requireAuth from "../../../auth/infrastructure/http/requireAuthMiddleware.js";
import {
  getAllProductsHandler,
  getProductByIdHandler,
  addProductHandler,
  updateProductHandler,
  deleteProductHandler,
  runNewProductStatusRefreshHandler,
} from "../../index.js";

const productsRoutes = router();
productsRoutes.use(requireAuth);
productsRoutes.get("/", getAllProductsHandler);
productsRoutes.get("/:id", getProductByIdHandler);
productsRoutes.post("/", addProductHandler);
productsRoutes.put("/:id", updateProductHandler);
productsRoutes.delete("/:id", deleteProductHandler);

cron.schedule("0 0 * * *", () => {
  console.log("Running the updateIsNewProductStatus function");
  runNewProductStatusRefreshHandler();
});

export default productsRoutes;
