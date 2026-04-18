import { createUserUpdatePatch } from "../../domain/entities/User.js";

export const buildUpdateUserUseCase = ({ userRepository }) => {
  return async ({ id, updates }) => {
    if (!userRepository.isValidId(id)) {
      const error = new Error(`No such user ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const patch = createUserUpdatePatch(updates);

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  };
};
