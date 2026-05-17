import test from "node:test";
import assert from "node:assert/strict";
import { seedAdminUser } from "../../../../src/infrastructure/seed/seedAdminUser.js";

test("skips seeding when ADMIN_EMAIL is not set", async () => {
  const logs = [];

  await seedAdminUser({
    authUserRepository: {},
    env: { adminEmail: "", adminPassword: "secret" },
    logger: { info: (entry) => logs.push(entry) },
  });

  assert.equal(logs[0].msg, "ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed");
});

test("skips seeding when ADMIN_PASSWORD is not set", async () => {
  const logs = [];

  await seedAdminUser({
    authUserRepository: {},
    env: { adminEmail: "admin@test.com", adminPassword: "" },
    logger: { info: (entry) => logs.push(entry) },
  });

  assert.equal(logs[0].msg, "ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed");
});

test("skips seeding when admin already exists", async () => {
  const logs = [];

  await seedAdminUser({
    authUserRepository: {
      findByEmail: async () => ({ email: "admin@test.com" }),
    },
    env: { adminEmail: "admin@test.com", adminPassword: "secret" },
    logger: { info: (entry) => logs.push(entry) },
  });

  assert.equal(logs[0].msg, "Admin user already exists");
});

test("creates admin user with hashed password", async () => {
  const logs = [];
  const created = [];

  await seedAdminUser({
    authUserRepository: {
      findByEmail: async () => null,
      hashPassword: async (password) => `hashed:${password}`,
      create: async (data) => created.push(data),
    },
    env: { adminEmail: "admin@test.com", adminPassword: "secret" },
    logger: { info: (entry) => logs.push(entry) },
  });

  assert.deepEqual(created, [
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "hashed:secret",
      admin: true,
    },
  ]);
  assert.equal(logs[0].msg, "Admin user seeded");
});

test("creates admin user and logs email", async () => {
  const logs = [];

  await seedAdminUser({
    authUserRepository: {
      findByEmail: async () => null,
      hashPassword: async (p) => p,
      create: async () => {},
    },
    env: { adminEmail: "admin@test.com", adminPassword: "s3cret!" },
    logger: { info: (entry) => logs.push(entry) },
  });

  assert.equal(logs[0].msg, "Admin user seeded");
  assert.equal(logs[0].email, "admin@test.com");
});
