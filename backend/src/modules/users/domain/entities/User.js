import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

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
    throw new DomainValidationError("All fields must be filled");
  }

  if (newPassword !== confirmPassword) {
    throw new DomainValidationError("Password do not match");
  }

  return Object.freeze({
    currentPassword,
    newPassword,
    confirmPassword,
  });
};
