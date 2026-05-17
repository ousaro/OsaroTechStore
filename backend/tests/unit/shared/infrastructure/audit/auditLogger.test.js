import test from "node:test";
import assert from "node:assert/strict";
import { createAuditLogger } from "../../../../../src/shared/infrastructure/audit/createAuditLogger.js";

test("logs audit entry with all fields", async () => {
  const entries = [];
  const auditLogger = createAuditLogger({
    dbClient: {
      collection: () => ({
        insertOne: async (entry) => entries.push(entry),
      }),
    },
  });

  await auditLogger.log({
    action: "user.deleted",
    actor: "admin@test.com",
    target: { type: "user", id: "u1" },
    details: { reason: "inactive" },
    ip: "192.168.1.1",
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].action, "user.deleted");
  assert.equal(entries[0].actor, "admin@test.com");
  assert.deepEqual(entries[0].target, { type: "user", id: "u1" });
  assert.deepEqual(entries[0].details, { reason: "inactive" });
  assert.equal(entries[0].ip, "192.168.1.1");
  assert.ok(entries[0].timestamp instanceof Date);
});

test("logs audit entry with minimal fields", async () => {
  const entries = [];
  const auditLogger = createAuditLogger({
    dbClient: {
      collection: () => ({
        insertOne: async (entry) => entries.push(entry),
      }),
    },
  });

  await auditLogger.log({
    action: "product.created",
    actor: "admin@test.com",
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].action, "product.created");
  assert.equal(entries[0].actor, "admin@test.com");
  assert.equal(entries[0].target, undefined);
  assert.equal(entries[0].details, undefined);
  assert.equal(entries[0].ip, undefined);
});
