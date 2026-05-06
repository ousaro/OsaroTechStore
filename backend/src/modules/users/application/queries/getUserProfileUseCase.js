import { ApplicationNotFoundError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString }     from "../../../../shared/kernel/assertions/index.js";
import { toUserReadModel }          from "../read-models/userReadModel.js";

export const buildGetUserProfileUseCase = ({ userRepository }) =>
  async ({ requesterId, targetId }) => {
    const id = targetId ?? requesterId;
    assertNonEmptyString(id, "userId");
    const record = await userRepository.findById(id);
    if (!record) throw new ApplicationNotFoundError(`User ${id} not found`);
    return toUserReadModel(record);
  };
