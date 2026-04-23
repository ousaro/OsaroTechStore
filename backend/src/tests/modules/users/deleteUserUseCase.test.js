import { describe, it } from "mocha";
import { expect } from "chai";
import { buildDeleteUserUseCase } from "../../../modules/users/application/commands/deleteUserUseCase.js";
import { UserNotFoundError } from "../../../modules/users/application/errors/UserApplicationError.js";

describe("deleteUserUseCase", () => {
  it("returns the deleted user when the repository deletes it", async () => {
    const deletedUser = { _id: "507f1f77bcf86cd799439011", email: "john@example.com" };
    const deleteUserUseCase = buildDeleteUserUseCase({
      userRepository: {
        isValidId: () => true,
        findByIdAndDelete: async () => deletedUser,
      },
    });

    const result = await deleteUserUseCase({ id: deletedUser._id });

    expect(result).to.deep.equal(deletedUser);
  });

  it("throws 404 when the user id is invalid", async () => {
    const deleteUserUseCase = buildDeleteUserUseCase({
      userRepository: {
        isValidId: () => false,
        findByIdAndDelete: async () => null,
      },
    });

    try {
      await deleteUserUseCase({ id: "bad-id" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
      expect(error.message).to.equal("No such user");
      expect(error.code).to.equal("USER_NOT_FOUND");
    }
  });

  it("throws 404 when the user cannot be found", async () => {
    const deleteUserUseCase = buildDeleteUserUseCase({
      userRepository: {
        isValidId: () => true,
        findByIdAndDelete: async () => null,
      },
    });

    try {
      await deleteUserUseCase({ id: "507f1f77bcf86cd799439011" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UserNotFoundError);
      expect(error.message).to.equal("User not found");
      expect(error.code).to.equal("USER_NOT_FOUND");
    }
  });
});
