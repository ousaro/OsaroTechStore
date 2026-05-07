let sequence = 0;

export const buildUserPayload = (overrides = {}) => {
  sequence += 1;
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    email: `ada.${sequence}@example.test`,
    password: "Password123!",
    confirmPassword: "Password123!",
    picture: "",
    ...overrides,
  };
};

export const persistUser = async ({ authUserRepository, overrides = {} }) => {
  const payload = buildUserPayload(overrides);
  const hashedPassword = await authUserRepository.hashPassword(payload.password);
  return authUserRepository.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: hashedPassword,
    picture: payload.picture,
  });
};

export const persistAdminUser = async ({ authUserRepository, overrides = {} }) => {
  const user = await persistUser({ authUserRepository, overrides });
  return authUserRepository.findByIdAndUpdate(user._id, { admin: true });
};
