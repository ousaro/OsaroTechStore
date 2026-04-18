import { describe, it } from "mocha";
import { expect } from "chai";
import { buildDeleteUserUseCase } from "../../../modules/users/application/use-cases/deleteUserUseCase.js";

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

    expect(result).to.equal(deletedUser);
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
      expect(error.message).to.equal("No such user");
      expect(error.statusCode).to.equal(404);
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
      expect(error.message).to.equal("User not found");
      expect(error.statusCode).to.equal(404);
    }
  });
});
