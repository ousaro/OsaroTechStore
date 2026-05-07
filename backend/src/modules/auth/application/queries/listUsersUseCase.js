/**
 * List Managed Users Use Case.
 */
export const buildListUsersUseCase =
  ({ authUserRepository }) =>
  async () =>
    authUserRepository.findManagedAccountsSorted();
