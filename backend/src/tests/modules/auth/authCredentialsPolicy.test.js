import { describe, it } from "mocha";
import { expect } from "chai";
import {
  assertValidLoginData,
  assertValidRegistrationData,
} from "../../../modules/auth/application/policies/authCredentialsPolicy.js";
import { createEmail } from "../../../modules/auth/domain/value-objects/Email.js";
import {
  AuthConflictError,
  AuthUnauthorizedError,
  AuthValidationError,
} from "../../../modules/auth/application/errors/AuthApplicationError.js";
import { buildRegisterUserUseCase } from "../../../modules/auth/application/use-cases/registerUserUseCase.js";
import { buildLoginUserUseCase } from "../../../modules/auth/application/use-cases/loginUserUseCase.js";
import { buildVerifyAccessTokenUseCase } from "../../../modules/auth/application/use-cases/verifyAccessTokenUseCase.js";

describe("auth credentials policy", () => {
  it("rejects invalid registration payloads with auth validation errors", () => {
    expect(() =>
      assertValidRegistrationData({
        firstName: "Jane",
        lastName: "Doe",
        email: "not-an-email",
        password: "Password123!",
        confirmPassword: "Password123!",
      })
    ).to.throw(AuthValidationError, "Please enter a valid email");
  });

  it("rejects incomplete login payloads with auth validation errors", () => {
    expect(() => assertValidLoginData({ email: "", password: "" })).to.throw(
      AuthValidationError,
      "All field must be filled"
    );
  });

  it("normalizes valid emails through the email value object", () => {
    expect(
      assertValidRegistrationData({
        firstName: "Jane",
        lastName: "Doe",
        email: "  JANE@Example.COM  ",
        password: "Password123!",
        confirmPassword: "Password123!",
      })
    ).to.equal("jane@example.com");

    expect(createEmail("  JANE@Example.COM  ").toPrimitives()).to.equal("jane@example.com");
  });
});

describe("auth use case errors", () => {
  it("maps duplicate email registration to an auth conflict error", async () => {
    const lookedUpEmails = [];
    const registerUser = buildRegisterUserUseCase({
      authUserRepository: {
        findByEmail: async (email) => {
          lookedUpEmails.push(email);
          return { _id: "existing-user" };
        },
        hashPassword: async () => "hashed-password",
        create: async () => {
          throw new Error("should not create");
        },
      },
      tokenService: {
        signUserId: () => "token",
      },
    });

    try {
      await registerUser({
        firstName: "Jane",
        lastName: "Doe",
        email: "  JANE@Example.COM  ",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect.fail("Expected registerUser to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(AuthConflictError);
      expect(error.message).to.equal("Email already exist!");
      expect(lookedUpEmails).to.deep.equal(["jane@example.com"]);
    }
  });

  it("maps invalid login credentials to an auth unauthorized error", async () => {
    const loginUser = buildLoginUserUseCase({
      authUserRepository: {
        findByEmail: async () => null,
        comparePassword: async () => false,
      },
      tokenService: {
        signUserId: () => "token",
      },
    });

    try {
      await loginUser({
        email: "jane@example.com",
        password: "Password123!",
      });
      expect.fail("Expected loginUser to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(AuthUnauthorizedError);
      expect(error.message).to.equal("Email or Password are not correct");
    }
  });

  it("maps missing authorization header to an auth unauthorized error", async () => {
    const verifyAccessToken = buildVerifyAccessTokenUseCase({
      tokenService: {
        verifyAndExtractUserId: () => "user-id",
      },
      authUserRepository: {
        findUserIdOnly: async () => ({ _id: "user-id" }),
      },
    });

    try {
      await verifyAccessToken({ authorizationHeader: "" });
      expect.fail("Expected verifyAccessToken to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(AuthUnauthorizedError);
      expect(error.message).to.equal("Authorization token required");
    }
  });
});
