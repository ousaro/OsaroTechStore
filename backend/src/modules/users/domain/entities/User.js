import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const ALLOWED_USER_PROFILE_FIELDS = new Set([
  "firstName",
  "lastName",
  "picture",
  "phone",
  "address",
  "city",
  "country",
  "state",
  "postalCode",
  "favorites",
  "cart",
]);

export const createUserProfileUpdatePatch = (updates) => {
  if (!updates || typeof updates !== "object") {
    throw new DomainValidationError("profile updates are required");
  }

  const patch = Object.fromEntries(
    Object.entries(updates).filter(([fieldName]) =>
      ALLOWED_USER_PROFILE_FIELDS.has(fieldName)
    )
  );

  const unsupportedField = Object.keys(updates).find(
    (fieldName) => !ALLOWED_USER_PROFILE_FIELDS.has(fieldName)
  );

  if (unsupportedField) {
    throw new DomainValidationError(
      `${unsupportedField} is not part of the user profile model`
    );
  }

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
