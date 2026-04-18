// Backward-compatible exports for any existing imports.
import {
  getAllProductsHandler as getAllProducts,
  getProductByIdHandler as getProductById,
  addProductHandler as addProduct,
  updateProductHandler as updateProduct,
  deleteProductHandler as deleteProduct,
  runNewProductStatusRefreshHandler as updateIsNewProductStatus,
} from "../modules/products/index.js";

export {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  updateIsNewProductStatus,
};
