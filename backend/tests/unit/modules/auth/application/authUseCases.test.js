import test from "node:test";
import assert from "node:assert/strict";

import { buildRegisterUserUseCase } from "../../../../../src/modules/auth/application/commands/registerUserUseCase.js";
import { buildLoginUserUseCase } from "../../../../../src/modules/auth/application/commands/loginUserUseCase.js";
import {
  AuthConflictError,
  AuthUnauthorizedError,
  AuthValidationError,
} from "../../../../../src/modules/auth/application/errors/AuthApplicationError.js";

const validPassword = "StrongPass1!";

const userRecord = {
  _id: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  admin: false,
  favorites: [],
  cart: [],
};

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info: (entry) => entries.push(entry),
  };
};

test("registerUser validates, normalizes email, hashes password, signs token, and logs", async () => {
  const createdRecords = [];
  const logger = createLogger();
  const registerUser = buildRegisterUserUseCase({
    authUserRepository: {
      findByEmail: async () => null,
      hashPassword: async (password) => `hashed:${password}`,
      create: async (record) => {
        createdRecords.push(record);
        return { ...userRecord, ...record, _id: "u1" };
      },
    },
    tokenService: { signUserId: (id) => `token:${id}` },
    logger,
  });

  const result = await registerUser({
    firstName: "Ada",
    lastName: "Lovelace",
    email: " ADA@Example.COM ",
    password: validPassword,
    confirmPassword: validPassword,
  });

  assert.equal(createdRecords[0].email, "ada@example.com");
  assert.equal(createdRecords[0].password, `hashed:${validPassword}`);
  assert.equal(result.token, "token:u1");
  assert.equal(result.email, "ada@example.com");
  assert.deepEqual(logger.entries[0], { msg: "User registered", userId: "u1" });
});

test("registerUser rejects duplicate email", async () => {
  const registerUser = buildRegisterUserUseCase({
    authUserRepository: {
      findByEmail: async () => userRecord,
      hashPassword: async () => {
        throw new Error("should not hash duplicate");
      },
    },
    tokenService: { signUserId: () => "token" },
    logger: createLogger(),
  });

  await assert.rejects(
    () => registerUser({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: validPassword,
      confirmPassword: validPassword,
    }),
    AuthConflictError
  );
});

test("registerUser rejects weak passwords", async () => {
  const registerUser = buildRegisterUserUseCase({
    authUserRepository: {
      findByEmail: async () => null,
      hashPassword: async () => "hash",
      create: async () => userRecord,
    },
    tokenService: { signUserId: () => "token" },
    logger: createLogger(),
  });

  await assert.rejects(
    () => registerUser({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "weak",
      confirmPassword: "weak",
    }),
    AuthValidationError
  );
});

test("loginUser signs token and logs when credentials match", async () => {
  const logger = createLogger();
  const loginUser = buildLoginUserUseCase({
    authUserRepository: {
      findByEmail: async (email) => ({ ...userRecord, email }),
      findByIdWithPassword: async () => ({ ...userRecord, password: "hash" }),
      comparePassword: async (password, hash) => {
        assert.equal(password, validPassword);
        assert.equal(hash, "hash");
        return true;
      },
    },
    tokenService: { signUserId: (id) => `token:${id}` },
    logger,
  });

  const result = await loginUser({
    email: " ADA@Example.COM ",
    password: validPassword,
  });

  assert.equal(result.email, "ada@example.com");
  assert.equal(result.token, "token:u1");
  assert.deepEqual(logger.entries[0], { msg: "User logged in", userId: "u1" });
});

test("loginUser rejects unknown user or invalid password", async () => {
  const unknownUserLogin = buildLoginUserUseCase({
    authUserRepository: {
      findByEmail: async () => null,
      findByIdWithPassword: async () => null,
      comparePassword: async () => true,
    },
    tokenService: { signUserId: () => "token" },
    logger: createLogger(),
  });

  await assert.rejects(
    () => unknownUserLogin({ email: "ada@example.com", password: validPassword }),
    AuthUnauthorizedError
  );

  const invalidPasswordLogin = buildLoginUserUseCase({
    authUserRepository: {
      findByEmail: async () => userRecord,
      findByIdWithPassword: async () => ({ ...userRecord, password: "hash" }),
      comparePassword: async () => false,
    },
    tokenService: { signUserId: () => "token" },
    logger: createLogger(),
  });

  await assert.rejects(
    () => invalidPasswordLogin({ email: "ada@example.com", password: validPassword }),
    AuthUnauthorizedError
  );
});
