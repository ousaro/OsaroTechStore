/**
 * Users Output Ports.
 * Validated at wiring time in composition.js.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REPO_METHODS = [
  "findById",
  "updateById",
];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const assertUserRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "userRepository");
