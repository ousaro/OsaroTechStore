export const buildGetUserByIdUseCase = ({ userRepository }) => {
  return async ({ id }) => {
    if (!userRepository.isValidId(id)) {
      const error = new Error("No such user");
      error.statusCode = 404;
      throw error;
    }

    // Keep current behavior stable (placeholder payload).
    return {
      message: `user id ${id} `,
    };
  };
};
