import { describe, it } from "mocha";
import { expect } from "chai";
import { buildUpdateUserUseCase } from "../../../modules/users/application/use-cases/updateUserUseCase.js";
import { UserNotFoundError } from "../../../modules/users/application/errors/UserApplicationError.js";
import { DomainValidationError } from "../../../shared/domain/errors/DomainValidationError.js";

describe("updateUserUseCase", () => {
  it("updates supported profile fields through the users profile model", async () => {
    let persistedPatch = null;
    const updateUserUseCase = buildUpdateUserUseCase({
      userRepository: {
        isValidId: () => true,
        findByIdAndUpdate: async (_id, patch) => {
          persistedPatch = patch.toPrimitives();
          return { _id: "507f1f77bcf86cd799439011", ...persistedPatch };
        },
      },
    });

    const result = await updateUserUseCase({
      id: "507f1f77bcf86cd799439011",
      updates: {
        firstName: "Jane",
        city: "Rabat",
      },
    });

    expect(persistedPatch).to.deep.equal({
      firstName: "Jane",
      city: "Rabat",
    });
    expect(result).to.deep.equal({
      _id: "507f1f77bcf86cd799439011",
      firstName: "Jane",
      city: "Rabat",
    });
  });

  it("rejects credential fields in the profile update path", async () => {
    const updateUserUseCase = buildUpdateUserUseCase({
      userRepository: {
        isValidId: () => true,
        findByIdAndUpdate: async () => {
          throw new Error("should not update");
        },
      },
    });

    try {
      await updateUserUseCase({
        id: "507f1f77bcf86cd799439011",
        updates: {
          password: "new-password",
        },
      });
      throw new Error("Expected updateUserUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(DomainValidationError);
      expect(error.message).to.equal("password is not part of the user profile model");
    }
  });

  it("throws when the user id is invalid", async () => {
    const updateUserUseCase = buildUpdateUserUseCase({
      userRepository: {
        isValidId: () => false,
        findByIdAndUpdate: async () => null,
      },
    });

    try {
      await updateUserUseCase({
        id: "bad-id",
        updates: { firstName: "Jane" },
      });
      throw new Error("Expected updateUserUseCase to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
      expect(error.message).to.equal("No such user bad-id");
    }
  });
});
