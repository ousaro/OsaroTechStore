/**
 * Orders Output Ports.
 * Validated at wiring time in composition.js.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REPO_METHODS = [
  "findAll",
  "findById",
  "findByOwnerId",
  "create",
  "updateById",
  "deleteById",
];

const EVENT_PUBLISHER_METHODS = ["publish"];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const assertOrderRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "orderRepository");

export const assertOrderEventPublisherPort = (publisher) =>
  assertMethods(publisher, EVENT_PUBLISHER_METHODS, "orderEventPublisher");
