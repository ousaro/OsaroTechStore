import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = Object.freeze([
  "addProduct",
  "updateProduct",
  "deleteProduct",
  "removeProductsByCategory",
  "addProductReview",
  "getAllProducts",
  "getProductById",
]);

export const assertProductsInputPort = (port) => {
  assertObject(port, "productsInputPort", "productsInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `productsInputPort.${method}`,
      `productsInputPort must implement .${method}()`
    );
  }

  return port;
};

export const createProductsInputPort = (useCases) => assertProductsInputPort(useCases);
