import { UserNotFoundError } from "../errors/UserApplicationError.js";
import { assertUserRepositoryQueryPort } from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildGetUserByIdUseCase = ({ userRepository }) => {
  assertUserRepositoryQueryPort(userRepository, ["isValidId", "findById"]);
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      throw new UserNotFoundError("No such user");
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }

    return toUserReadModel(user);
  };
};
