/**
 * Get User By Id Use Case.
 */
export const buildGetUserUseCase = ({ authUserRepository }) =>
  async ({ id }) => authUserRepository.findById(id);
