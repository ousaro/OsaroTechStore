/**
 * Payments Output Ports.
 * Validated at wiring time in composition.js.
 */
import { assertFunction, assertObject } from "../../../../shared/kernel/assertions/index.js";

const REPO_METHODS = [
  "create",
  "findById",
  "findByOrderId",
  "findBySessionId",
  "updateById",
];

const EVENT_PUBLISHER_METHODS = ["publish"];

const assertMethods = (obj, methods, label) => {
  assertObject(obj, label, `${label} is required`);
  for (const m of methods) {
    assertFunction(obj[m], `${label}.${m}`, `${label} must implement .${m}()`);
  }
  return obj;
};

export const assertPaymentRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "paymentRepository");

export const assertPaymentEventPublisherPort = (publisher) =>
  assertMethods(publisher, EVENT_PUBLISHER_METHODS, "paymentEventPublisher");
