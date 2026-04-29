/**
 * List Managed Users Use Case.
 */
export const buildListUsersUseCase = ({ authUserRepository }) =>
  async () => authUserRepository.findManagedAccountsSorted();

/**
 * Get User By Id Use Case.
 */
export const buildGetUserUseCase = ({ authUserRepository }) =>
  async ({ id }) => authUserRepository.findById(id);
