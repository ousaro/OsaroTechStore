import { assertFunction, assertObject } from "../../kernel/assertions/index.js";

export const DATABASE_PROVIDER_METHODS = Object.freeze(["connect", "disconnect", "getConnection"]);

export const assertDatabaseProviderPort = (database, context = "unknown") => {
  assertObject(database, "database", `[${context}] database provider is required`);

  for (const method of DATABASE_PROVIDER_METHODS) {
    assertFunction(
      database[method],
      `database.${method}`,
      `[${context}] database provider must implement .${method}()`
    );
  }

  return database;
};
