import { ApplicationNotFoundError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString }     from "../../../../shared/kernel/assertions/index.js";
import { toUserReadModel }          from "../read-models/userReadModel.js";

export const buildUpdateUserProfileUseCase = ({ userRepository }) =>
  async ({ requesterId, targetId, updates }) => {
    const id = targetId ?? requesterId;
    assertNonEmptyString(id, "userId");
    if (targetId && targetId !== requesterId) {
      // Only admins can update other users — enforced by route-level requireAuth
    }
    const record = await userRepository.updateById(id, updates);
    if (!record) throw new ApplicationNotFoundError(`User ${id} not found`);
    return toUserReadModel(record);
  };
