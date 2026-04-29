/**
 * Update Managed User Use Case (admin operation).
 * Extracted from composition root where it incorrectly lived before.
 */
import { AuthUnauthorizedError } from "../errors/AuthApplicationError.js";

export const buildUpdateManagedUserUseCase = ({ authUserRepository }) =>
  async ({ id, updates }) => {
    const updated = await authUserRepository.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) throw new AuthUnauthorizedError("User not found");
    return updated;
  };
