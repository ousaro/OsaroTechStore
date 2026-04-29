import validator from "validator";
import { AuthValidationError } from "../errors/AuthApplicationError.js";
import { createEmail } from "../../domain/value-objects/Email.js";
import { DomainValidationError } from "../../../../shared/domain/errors/index.js";

export const assertValidRegistrationData = ({
  firstName, lastName, email, password, confirmPassword,
}) => {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new AuthValidationError("All fields must be filled");
  }
  let normalizedEmail;
  try {
    normalizedEmail = createEmail(email).toPrimitives();
  } catch (err) {
    if (err instanceof DomainValidationError) throw new AuthValidationError(err.message);
    throw err;
  }
  if (!validator.isStrongPassword(password)) {
    throw new AuthValidationError(
      "Password must be at least 8 characters with uppercase, lowercase, number, and symbol"
    );
  }
  if (password !== confirmPassword) {
    throw new AuthValidationError("Passwords do not match");
  }
  return normalizedEmail;
};

export const assertValidLoginData = ({ email, password }) => {
  if (!email || !password) throw new AuthValidationError("All fields must be filled");
  try {
    return createEmail(email).toPrimitives();
  } catch (err) {
    if (err instanceof DomainValidationError) throw new AuthValidationError(err.message);
    throw err;
  }
};
