import validator from "validator";
import { AuthValidationError } from "../errors/AuthApplicationError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createEmail } from "../../domain/value-objects/Email.js";

export const assertValidRegistrationData = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) => {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new AuthValidationError("All field must be filled");
  }

  let normalizedEmail;

  try {
    normalizedEmail = createEmail(email).toPrimitives();
  } catch (error) {
    if (error instanceof DomainValidationError) {
      throw new AuthValidationError(error.message);
    }

    throw error;
  }

  if (!validator.isStrongPassword(password)) {
    throw new AuthValidationError("Weak Password");
  }

  if (password !== confirmPassword) {
    throw new AuthValidationError("Password do not match");
  }

  return normalizedEmail;
};

export const assertValidLoginData = ({ email, password }) => {
  if (!email || !password) {
    throw new AuthValidationError("All field must be filled");
  }

  try {
    return createEmail(email).toPrimitives();
  } catch (error) {
    if (error instanceof DomainValidationError) {
      throw new AuthValidationError(error.message);
    }

    throw error;
  }
};
