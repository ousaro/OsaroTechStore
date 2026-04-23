import { describe, it } from "mocha";
import { expect } from "chai";
import { buildUpdateUserPasswordUseCase } from "../../../modules/users/application/use-cases/updateUserPasswordUseCase.js";
import {
  UserNotFoundError,
  UserValidationError,
} from "../../../modules/users/application/errors/UserApplicationError.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("updateUserPasswordUseCase", () => {
  it("throws when required password fields are missing", async () => {
    const updateUserPasswordUseCase = buildUpdateUserPasswordUseCase({
      userRepository: {
        isValidId: () => true,
        getCredentialsById: async () => null,
        comparePassword: async () => false,
        hashPassword: async () => "hashed-password",
        updateCredentialsById: async () => null,
      },
    });

    try {
      await updateUserPasswordUseCase({
        id: "507f1f77bcf86cd799439011",
        requesterId: "507f1f77bcf86cd799439011",
        updates: { currentPassword: "", newPassword: "", confirmPassword: "" },
      });
      expect.fail("Expected updateUserPasswordUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("All fields must be filled");
    }
  });

  it("throws when the current password is incorrect", async () => {
    const updateUserPasswordUseCase = buildUpdateUserPasswordUseCase({
      userRepository: {
        isValidId: () => true,
        getCredentialsById: async () => ({
          _id: "507f1f77bcf86cd799439011",
          password: "stored-hash",
        }),
        comparePassword: async () => false,
        hashPassword: async () => "hashed-password",
        updateCredentialsById: async () => null,
      },
    });

    try {
      await updateUserPasswordUseCase({
        id: "507f1f77bcf86cd799439011",
        requesterId: "507f1f77bcf86cd799439011",
        updates: {
          currentPassword: "wrong-password",
          newPassword: "Password123!",
          confirmPassword: "Password123!",
        },
      });
      expect.fail("Expected updateUserPasswordUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UserValidationError);
      expect(error.message).to.equal("Current password is incorrect");
      expect(error.code).to.equal("USER_VALIDATION");
    }
  });

  it("throws when the target user cannot be found during password update", async () => {
    const updateUserPasswordUseCase = buildUpdateUserPasswordUseCase({
      userRepository: {
        isValidId: () => true,
        getCredentialsById: async () => ({
          _id: "507f1f77bcf86cd799439011",
          password: "stored-hash",
        }),
        comparePassword: async () => true,
        hashPassword: async () => "hashed-password",
        updateCredentialsById: async () => null,
      },
    });

    try {
      await updateUserPasswordUseCase({
        id: "507f1f77bcf86cd799439011",
        requesterId: "507f1f77bcf86cd799439011",
        updates: {
          currentPassword: "Password123!",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        },
      });
      expect.fail("Expected updateUserPasswordUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
      expect(error.message).to.equal("User not found");
      expect(error.code).to.equal("USER_NOT_FOUND");
    }
  });
});
