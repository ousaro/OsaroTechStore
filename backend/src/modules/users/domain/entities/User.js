import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const createUserUpdatePatch = (updates) => {
  const patch = { ...updates };
  return Object.freeze({
    toPrimitives() {
      return { ...patch };
    },
  });
};

export const createUserPasswordUpdateCommand = (updates) => {
  const { currentPassword, newPassword, confirmPassword } = updates || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError("All fields must be filled", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError("Password do not match", 400);
  }

  return Object.freeze({
    currentPassword,
    newPassword,
    confirmPassword,
  });
};
