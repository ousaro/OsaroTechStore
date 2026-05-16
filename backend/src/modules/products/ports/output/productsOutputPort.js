import {
  BASE_REPOSITORY_METHODS,
  COLLECTION_REPOSITORY_METHODS,
  WRITABLE_REPOSITORY_METHODS,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...COLLECTION_REPOSITORY_METHODS,
  ...BASE_REPOSITORY_METHODS,
  ...WRITABLE_REPOSITORY_METHODS,
  "deleteByCategoryId",
  "addReview",
  "updateStatusBefore",
];

export const assertProductRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "productRepository");
