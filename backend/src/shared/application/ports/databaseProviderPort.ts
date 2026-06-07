import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

interface DatabaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnection(): unknown;
}

export const DATABASE_PROVIDER_METHODS: readonly string[] = Object.freeze([
  "connect",
  "disconnect",
  "getConnection",
]);

export const assertDatabaseProviderPort = (
  database: unknown,
  context = "unknown"
): DatabaseProvider => {
  assertObject(database, "database", `[${context}] database provider is required`);
  const db = database as Record<string, unknown>;

  for (const method of DATABASE_PROVIDER_METHODS) {
    assertFunction(
      db[method],
      `database.${method}`,
      `[${context}] database provider must implement .${method}()`
    );
  }

  return db as unknown as DatabaseProvider;
};
