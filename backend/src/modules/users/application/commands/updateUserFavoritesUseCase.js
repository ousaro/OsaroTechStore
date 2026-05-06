import { ApplicationNotFoundError } from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString }     from "../../../../shared/kernel/assertions/index.js";
import { toUserReadModel }          from "../read-models/userReadModel.js";

export const buildUpdateUserFavoritesUseCase = ({ userRepository }) =>
  async ({ userId, productId, action }) => {
    assertNonEmptyString(userId,    "userId");
    assertNonEmptyString(productId, "productId");
    const user = await userRepository.findById(userId);
    if (!user) throw new ApplicationNotFoundError(`User ${userId} not found`);

    const favorites = action === "add"
      ? [...new Set([...(user.favorites ?? []), productId])]
      : (user.favorites ?? []).filter((id) => id.toString() !== productId);

    const record = await userRepository.updateById(userId, { favorites });
    return toUserReadModel(record);
  };
