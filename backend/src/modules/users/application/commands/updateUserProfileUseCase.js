import { ApplicationNotFoundError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

const PROFILE_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "city",
  "country",
  "state",
  "postalCode",
  "picture",
]);

const toProfileUpdates = (updates = {}) =>
  Object.fromEntries(Object.entries(updates).filter(([key]) => PROFILE_FIELDS.has(key)));

export const buildUpdateUserProfileUseCase =
  ({ userRepository }) =>
  async ({ requesterId, targetId, updates }) => {
    const id = targetId ?? requesterId;
    assertNonEmptyString(id, "userId");
    const record = await userRepository.updateById(id, toProfileUpdates(updates));
    if (!record) throw new ApplicationNotFoundError(`User ${id} not found`);
    return toUserReadModel(record);
  };
