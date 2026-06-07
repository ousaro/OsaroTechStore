import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const BASE_REPOSITORY_METHODS: readonly string[] = Object.freeze(["findById"]);
export const COLLECTION_REPOSITORY_METHODS: readonly string[] = Object.freeze(["findAll"]);
export const WRITABLE_REPOSITORY_METHODS: readonly string[] = Object.freeze([
  "create",
  "updateById",
  "deleteById",
]);

export const assertPortMethods = (
  obj: unknown,
  methods: readonly string[],
  label: string
): Record<string, unknown> => {
  assertObject(obj, label, `${label} is required`);
  const o = obj as Record<string, unknown>;
  for (const method of methods) {
    assertFunction(o[method], `${label}.${method}`, `${label} must implement .${method}()`);
  }
  return o;
};

export const assertRepositoryPort = (
  repo: unknown,
  methods: readonly string[],
  label: string
): Record<string, unknown> => assertPortMethods(repo, methods, label);
