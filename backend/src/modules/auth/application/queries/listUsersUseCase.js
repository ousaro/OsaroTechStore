export const buildListUsersUseCase =
  ({ authUserRepository }) =>
  async () =>
    authUserRepository.findManagedAccountsSorted();
