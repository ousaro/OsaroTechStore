export const buildVerifyAccessTokenUseCase = ({ tokenService, authUserRepository }) => {
  return async ({ authorizationHeader }) => {
    if (!authorizationHeader) {
      const error = new Error("Authorization token required");
      error.statusCode = 401;
      throw error;
    }
    const userId = tokenService.verifyAndExtractUserId(authorizationHeader);
    return authUserRepository.findUserIdOnly(userId);
  };
};
