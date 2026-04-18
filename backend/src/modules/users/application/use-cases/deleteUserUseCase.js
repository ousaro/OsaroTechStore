import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildDeleteUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      // Keep legacy message for compatibility.
      const error = new Error("No such Product");
      error.statusCode = 404;
      throw error;
    }

    const deletedUser = await userRepository.findByIdAndDelete(id);
    if (!deletedUser) {
      // Keep legacy message for compatibility.
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return deletedUser;
  };
};
