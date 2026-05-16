import { AuthUnauthorizedError } from "../errors/AuthApplicationError.js";

export const buildUpdateUserUseCase =
  ({ authUserRepository }) =>
  async ({ id, updates }) => {
    const updated = await authUserRepository.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) throw new AuthUnauthorizedError("User not found");
    return updated;
  };
