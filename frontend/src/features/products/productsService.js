import { createProductCommands } from "./services/productCommands.js";
import { createProductQueries } from "./services/productQueries.js";
import { createProductReadModel } from "./services/productReadModel.js";

export function createProductsModule(deps) {
  const commands = createProductCommands(deps);
  const queries = createProductQueries(deps);
  const readModel = createProductReadModel(deps);

  const inputPort = {
    getAllProducts: queries.getAllProducts,
    getProductById: queries.getProductById,
    createProduct: commands.createProduct,
    updateProduct: commands.updateProduct,
    uploadProductImage: commands.uploadProductImage,
    deleteProduct: commands.deleteProduct,
    addProductReview: commands.addProductReview,
    removeProductsByCategory: commands.removeProductsByCategory,
    readModel,
  };
  return inputPort;
}
