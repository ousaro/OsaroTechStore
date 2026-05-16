export const buildGetUserUseCase =
  ({ authUserRepository }) =>
  async ({ id }) =>
    authUserRepository.findById(id);
