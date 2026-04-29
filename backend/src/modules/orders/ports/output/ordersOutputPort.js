/**
 * Orders Output Ports.
 * Validated at wiring time in composition.js.
 */
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
  if (!obj || typeof obj !== "object") throw new Error(`${label} is required`);
  for (const m of methods) {
    if (typeof obj[m] !== "function")
      throw new Error(`${label} must implement .${m}()`);
  }
  return obj;
};

export const assertOrderRepositoryPort = (repo) =>
  assertMethods(repo, REPO_METHODS, "orderRepository");

export const assertOrderEventPublisherPort = (publisher) =>
  assertMethods(publisher, EVENT_PUBLISHER_METHODS, "orderEventPublisher");
