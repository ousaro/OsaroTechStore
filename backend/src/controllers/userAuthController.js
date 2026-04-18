// Backward-compatible controller exports for existing tests/imports.
import {
  registerUserHandler as registerUser,
  loginUserHandler as loginUser,
} from "../modules/auth/index.js";

export { registerUser, loginUser };
