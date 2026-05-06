/**
 * Auth Output Ports.
 * Validated at wiring time in composition.js.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REPO_METHODS = [
  "findManagedAccountsSorted",
  "findByEmail",
  "findById",
  "findByIdWithPassword",
  "create",
  "findByIdAndUpdate",
  "findByIdAndDelete",
  "findUserExists",
  "hashPassword",
  "comparePassword",
];

const TOKEN_SERVICE_METHODS = [
  "signUserId",
  "verify",
  "extractUserId",
];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const assertAuthUserRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "authUserRepository");

export const assertTokenServicePort = (tokenService) =>
  assertMethods(tokenService, TOKEN_SERVICE_METHODS, "tokenService");
