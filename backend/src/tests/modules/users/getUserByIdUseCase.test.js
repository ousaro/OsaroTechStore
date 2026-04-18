import { describe, it } from "mocha";
import { expect } from "chai";
import { buildGetUserByIdUseCase } from "../../../modules/users/application/use-cases/getUserByIdUseCase.js";

describe("getUserByIdUseCase", () => {
  it("returns the user when the repository finds it", async () => {
    const user = { _id: "507f1f77bcf86cd799439011", email: "john@example.com" };
    const getUserByIdUseCase = buildGetUserByIdUseCase({
      userRepository: {
        isValidId: () => true,
        findById: async () => user,
      },
    });

    const result = await getUserByIdUseCase({ id: user._id });

    expect(result).to.equal(user);
  });

  it("throws 404 when the user id is invalid", async () => {
    const getUserByIdUseCase = buildGetUserByIdUseCase({
      userRepository: {
        isValidId: () => false,
        findById: async () => null,
      },
    });

    try {
      await getUserByIdUseCase({ id: "bad-id" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error.message).to.equal("No such user");
      expect(error.statusCode).to.equal(404);
    }
  });

  it("throws 404 when the user cannot be found", async () => {
    const getUserByIdUseCase = buildGetUserByIdUseCase({
      userRepository: {
        isValidId: () => true,
        findById: async () => null,
      },
    });

    try {
      await getUserByIdUseCase({ id: "507f1f77bcf86cd799439011" });
      throw new Error("Expected use case to throw");
    } catch (error) {
      expect(error.message).to.equal("User not found");
      expect(error.statusCode).to.equal(404);
    }
  });
});
