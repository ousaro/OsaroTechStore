/**
 * Auth Output Ports.
 * Validated at wiring time in composition.js.
 */
import {
  BASE_REPOSITORY_METHODS,
  assertPortMethods,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...BASE_REPOSITORY_METHODS,
  "findManagedAccountsSorted",
  "findByEmail",
  "findByIdWithPassword",
  "create",
  "findByIdAndUpdate",
  "findByIdAndDelete",
  "findUserExists",
  "hashPassword",
  "comparePassword",
];

const TOKEN_SERVICE_METHODS = ["signUserId", "verify", "extractUserId"];

export const assertAuthUserRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "authUserRepository");

export const assertTokenServicePort = (tokenService) =>
  assertPortMethods(tokenService, TOKEN_SERVICE_METHODS, "tokenService");
