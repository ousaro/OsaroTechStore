import validator from "validator";
import { AuthValidationError } from "../errors/AuthApplicationError.js";

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

  if (!validator.isEmail(email)) {
    throw new AuthValidationError("Please enter a valid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new AuthValidationError("Weak Password");
  }

  if (password !== confirmPassword) {
    throw new AuthValidationError("Password do not match");
  }
};

export const assertValidLoginData = ({ email, password }) => {
  if (!email || !password) {
    throw new AuthValidationError("All field must be filled");
  }
};
