export const buildGetAllUsersUseCase = ({ userRepository }) => {
  return async () => {
    return userRepository.findAllNonAdminSorted();
  };
};
