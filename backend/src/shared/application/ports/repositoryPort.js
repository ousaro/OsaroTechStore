/**
 * Repository Port Helpers — Shared Application Layer.
 *
 * Modules compose these method groups with their own output-port methods.
 * Keep this file limited to repository conventions that are truly shared.
 */
import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const BASE_REPOSITORY_METHODS = Object.freeze(["findById"]);

export const COLLECTION_REPOSITORY_METHODS = Object.freeze(["findAll"]);

export const WRITABLE_REPOSITORY_METHODS = Object.freeze(["create", "updateById", "deleteById"]);

export const assertPortMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const method of methods) {
    assertFunction(obj[method], `${label}.${method}`, `${label} must implement .${method}()`);
  }
  return obj;
};

export const assertRepositoryPort = (repo, methods, label) =>
  assertPortMethods(repo, methods, label);
