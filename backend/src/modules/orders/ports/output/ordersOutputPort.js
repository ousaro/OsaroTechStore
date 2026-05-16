import {
  BASE_REPOSITORY_METHODS,
  COLLECTION_REPOSITORY_METHODS,
  WRITABLE_REPOSITORY_METHODS,
  assertPortMethods,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...COLLECTION_REPOSITORY_METHODS,
  ...BASE_REPOSITORY_METHODS,
  "findByOwnerId",
  ...WRITABLE_REPOSITORY_METHODS,
];

const EVENT_PUBLISHER_METHODS = ["publish"];

export const assertOrderRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "orderRepository");

export const assertOrderEventPublisherPort = (publisher) =>
  assertPortMethods(publisher, EVENT_PUBLISHER_METHODS, "orderEventPublisher");
