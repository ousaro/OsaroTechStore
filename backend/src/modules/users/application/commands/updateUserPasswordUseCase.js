import validator from "validator";
import {
  ApplicationNotFoundError,
  ApplicationUnauthorizedError,
  ApplicationValidationError,
} from "../../../../shared/application/errors/index.js";
import { assertNonEmptyString } from "../../../../shared/kernel/assertions/index.js";

export const buildUpdateUserPasswordUseCase =
  ({ userRepository }) =>
  async ({ userId, currentPassword, newPassword, confirmPassword }) => {
    assertNonEmptyString(userId, "userId");

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApplicationValidationError("All password fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new ApplicationValidationError("Passwords do not match");
    }

    if (currentPassword === newPassword) {
      throw new ApplicationValidationError("New password must be different from current password");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new ApplicationValidationError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and symbol"
      );
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new ApplicationNotFoundError(`User ${userId} not found`);

    const matches = await userRepository.comparePassword(currentPassword, user.password);
    if (!matches) throw new ApplicationUnauthorizedError("Current password is incorrect");

    const hashedPassword = await userRepository.hashPassword(newPassword);
    await userRepository.updatePasswordById(userId, hashedPassword);

    return { success: true };
  };
