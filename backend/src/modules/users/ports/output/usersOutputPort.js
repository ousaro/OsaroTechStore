/**
 * Users Output Ports.
 * Validated at wiring time in composition.js.
 */
import {
  BASE_REPOSITORY_METHODS,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...BASE_REPOSITORY_METHODS,
  "updateById",
];

export const assertUserRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "userRepository");
