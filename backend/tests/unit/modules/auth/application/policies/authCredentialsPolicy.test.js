import test from "node:test";
import assert from "node:assert/strict";

import {
  assertValidLoginData,
  assertValidRegistrationData,
} from "../../../../../../src/modules/auth/application/policies/authCredentialsPolicy.js";
import { AuthValidationError } from "../../../../../../src/modules/auth/application/errors/AuthApplicationError.js";

const strongPassword = "StrongPass1!";

test("registration policy validates and normalizes valid data", () => {
  assert.equal(
    assertValidRegistrationData({
      firstName: "Ada",
      lastName: "Lovelace",
      email: " ADA@Example.COM ",
      password: strongPassword,
      confirmPassword: strongPassword,
    }),
    "ada@example.com"
  );
});

test("registration policy rejects missing fields, invalid email, and mismatched passwords", () => {
  assert.throws(
    () =>
      assertValidRegistrationData({
        firstName: "",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: strongPassword,
        confirmPassword: strongPassword,
      }),
    AuthValidationError
  );

  assert.throws(
    () =>
      assertValidRegistrationData({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "bad-email",
        password: strongPassword,
        confirmPassword: strongPassword,
      }),
    AuthValidationError
  );

  assert.throws(
    () =>
      assertValidRegistrationData({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: strongPassword,
        confirmPassword: "Different1!",
      }),
    AuthValidationError
  );
});

test("login policy validates, normalizes, and rejects invalid input", () => {
  assert.equal(
    assertValidLoginData({
      email: " ADA@Example.COM ",
      password: "password",
    }),
    "ada@example.com"
  );

  assert.throws(
    () =>
      assertValidLoginData({
        email: "",
        password: "password",
      }),
    AuthValidationError
  );

  assert.throws(
    () =>
      assertValidLoginData({
        email: "bad-email",
        password: "password",
      }),
    AuthValidationError
  );
});
