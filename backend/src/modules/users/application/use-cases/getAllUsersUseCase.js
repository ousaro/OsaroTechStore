import { assertUserRepositoryPort } from "../../ports/output/userRepositoryPort.js";

export const buildGetAllUsersUseCase = ({ userRepository }) => {
  assertUserRepositoryPort(userRepository, ["findAllNonAdminSorted"]);
  return async () => {
    return userRepository.findAllNonAdminSorted();
  };
};
