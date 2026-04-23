import { assertUserRepositoryQueryPort } from "../../ports/output/userRepositoryPort.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildGetAllUsersUseCase = ({ userRepository }) => {
  assertUserRepositoryQueryPort(userRepository, ["findAllNonAdminSorted"]);
  return async () => {
    const users = await userRepository.findAllNonAdminSorted();
    return users.map(toUserReadModel);
  };
};
