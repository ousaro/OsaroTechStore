import test from "node:test";
import assert from "node:assert/strict";

import { createMongoProvider } from "../../../../../src/infrastructure/providers/databases/mongo/mongoProvider.js";

const logger = { info: () => {} };

test("Mongo provider requires a connection uri", () => {
  assert.throws(() => createMongoProvider({ uri: "", logger }));
});

test("Mongo provider refuses to expose connection before connect", () => {
  const provider = createMongoProvider({
    uri: "mongodb://user:pass@localhost:27017/test",
    logger,
  });

  assert.throws(
    () => provider.getConnection(),
    /Connection is not open/
  );
});
