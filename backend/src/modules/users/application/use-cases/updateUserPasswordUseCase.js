export const buildUpdateUserPasswordUseCase = ({ userRepository }) => {
  return async ({ id, requesterId, updates }) => {
    if (!userRepository.isValidId(id)) {
      const error = new Error(`No such user ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const patch = { ...updates };

    if (patch.newPassword) {
      if (id.toString() === requesterId.toString()) {
        const currentUser = await userRepository.findById(id);
        if (!currentUser) {
          const error = new Error("User not found");
          error.statusCode = 404;
          throw error;
        }

        const match = await userRepository.comparePassword(
          patch.currentPassword,
          currentUser.password
        );
        if (!match) {
          const error = new Error("Current password is incorrect");
          error.statusCode = 400;
          throw error;
        }
      }

      patch.password = await userRepository.hashPassword(patch.newPassword);
    }

    if (!patch.currentPassword || !patch.newPassword || !patch.confirmPassword) {
      const error = new Error("All fields must be filled");
      error.statusCode = 400;
      throw error;
    }

    delete patch.newPassword;
    delete patch.currentPassword;

    const user = await userRepository.findByIdAndUpdate(id, patch);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  };
};
