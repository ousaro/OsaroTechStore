export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

export const createAuthHeaderForUser = ({ tokenService, user }) =>
  bearer(tokenService.signUserId(user._id));
