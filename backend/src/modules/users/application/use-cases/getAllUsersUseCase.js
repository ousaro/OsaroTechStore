import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildGetAllUsersUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["findAllNonAdminSorted"]);
  return async () => {
    const users = await userRepository.findAllNonAdminSorted();
    return users.map(toUserReadModel);
  };
};
