import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REQUIRED_METHODS = Object.freeze([
  "addCategory",
  "updateCategory",
  "deleteCategory",
  "getAllCategories",
  "getCategoryById",
]);

export const assertCategoriesInputPort = (port) => {
  assertObject(port, "categoriesInputPort", "categoriesInputPort is required");

  for (const method of REQUIRED_METHODS) {
    assertFunction(
      port[method],
      `categoriesInputPort.${method}`,
      `categoriesInputPort must implement .${method}()`
    );
  }

  return port;
};

export const createCategoriesInputPort = (useCases) => assertCategoriesInputPort(useCases);
