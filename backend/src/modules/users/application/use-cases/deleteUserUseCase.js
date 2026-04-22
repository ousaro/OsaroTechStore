import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildDeleteUserUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["isValidId", "findByIdAndDelete"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError("No such user");
    }

    const deletedUser = await userRepository.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new UserNotFoundError("User not found");
    }

    return deletedUser;
  };
};
