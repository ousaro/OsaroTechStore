/**
 * Delete Managed User Use Case (admin operation).
 */
import { AuthUnauthorizedError } from "../errors/AuthApplicationError.js";

export const buildDeleteUserUseCase = ({ authUserRepository }) =>
  async ({ id }) => {
    const deleted = await authUserRepository.findByIdAndDelete(id);
    if (!deleted) throw new AuthUnauthorizedError("User not found");
    return deleted;
  };
