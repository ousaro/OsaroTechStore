import validator from "validator";
import { ApiError } from "../../../../shared/domain/errors/ApiError.js";

export const createRegistrationCommand = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  picture = "",
}) => {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new ApiError("All field must be filled", 400);
  }
  if (!validator.isEmail(email)) {
    throw new ApiError("Please enter a valid email", 400);
  }
  if (!validator.isStrongPassword(password)) {
    throw new ApiError("Weak Password", 400);
  }
  if (password !== confirmPassword) {
    throw new ApiError("Password do not match", 400);
  }

  return Object.freeze({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    picture,
  });
};

export const createLoginCommand = ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError("All field must be filled", 400);
  }

  return Object.freeze({ email, password });
};
