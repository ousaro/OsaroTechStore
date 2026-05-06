/**
 * Products Output Ports.
 * Validated at wiring time in composition.js.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REPO_METHODS = [
  "findAll",
  "findById",
  "create",
  "updateById",
  "deleteById",
  "deleteByCategoryId",
  "updateStatusBefore",
];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const assertProductRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "productRepository");
