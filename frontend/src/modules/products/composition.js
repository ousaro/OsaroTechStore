import { createProductCommands }   from "./application/commands/productCommands.js";
import { createProductQueries }    from "./application/queries/productQueries.js";
import { createProductReadModel }  from "./application/read-models/productReadModel.js";
import { assertInputPort }         from "../../shared/kernel/assertions/portAssertions.js";

const PRODUCTS_INPUT_PORT_METHODS = [
  "getAllProducts", "getProductById", "createProduct",
  "updateProduct",  "deleteProduct",  "removeProductsByCategory",
];

export function createProductsModule(deps) {
  const commands = createProductCommands(deps);
  const queries  = createProductQueries(deps);
  const readModel = createProductReadModel(deps);

  const inputPort = {
    getAllProducts:          queries.getAllProducts,
    getProductById:         queries.getProductById,
    createProduct:          commands.createProduct,
    updateProduct:          commands.updateProduct,
    deleteProduct:          commands.deleteProduct,
    removeProductsByCategory: commands.removeProductsByCategory,
    // Expose read model factory for view adapters
    readModel,
  };

  assertInputPort("ProductsInputPort", inputPort, PRODUCTS_INPUT_PORT_METHODS);
  return inputPort;
}
