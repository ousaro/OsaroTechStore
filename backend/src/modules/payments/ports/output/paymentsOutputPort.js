/**
 * Payments Output Ports.
 * Validated at wiring time in composition.js.
 */
import {
  BASE_REPOSITORY_METHODS,
  assertPortMethods,
  assertRepositoryPort,
} from "../../../../shared/application/ports/repositoryPort.js";

const REPO_METHODS = [
  ...BASE_REPOSITORY_METHODS,
  "create",
  "findByOrderId",
  "findBySessionId",
  "updateById",
];

const EVENT_PUBLISHER_METHODS = ["publish"];

export const assertPaymentRepositoryPort = (repo) =>
  assertRepositoryPort(repo, REPO_METHODS, "paymentRepository");

export const assertPaymentEventPublisherPort = (publisher) =>
  assertPortMethods(publisher, EVENT_PUBLISHER_METHODS, "paymentEventPublisher");
