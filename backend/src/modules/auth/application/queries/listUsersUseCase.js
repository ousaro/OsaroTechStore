const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const toPagination = ({ limit, offset } = {}) => ({
  limit: Math.min(Math.max(Number.parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT),
  offset: Math.max(Number.parseInt(offset, 10) || 0, 0),
});

export const buildListUsersUseCase =
  ({ authUserRepository }) =>
  async ({ limit, offset } = {}) =>
    authUserRepository.findManagedAccountsSorted(toPagination({ limit, offset }));
