import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";
import { toUserReadModel } from "../read-models/userReadModel.js";

export const buildUpdateUserCartUseCase =
  ({ userRepository }) =>
  async ({ userId, cart }) => {
    assertNonEmptyString(userId, "userId");
    const record = await userRepository.updateById(userId, { cart });
    return toUserReadModel(record);
  };
