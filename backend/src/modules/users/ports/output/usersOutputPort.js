import {
  BASE_REPOSITORY_METHODS,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...BASE_REPOSITORY_METHODS,
  "updateById",
  "findByIdWithPassword",
  "updatePasswordById",
  "hashPassword",
  "comparePassword",
];

export const assertUserRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "userRepository");
