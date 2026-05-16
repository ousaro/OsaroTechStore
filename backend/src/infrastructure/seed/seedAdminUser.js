export const seedAdminUser = async ({ authUserRepository, env, logger }) => {
  if (!env.adminEmail || !env.adminPassword) {
    logger?.info({ msg: "ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed" });
    return;
  }

  const existing = await authUserRepository.findByEmail(env.adminEmail);
  if (existing) {
    logger?.info({ msg: "Admin user already exists", email: env.adminEmail });
    return;
  }

  const hashedPassword = await authUserRepository.hashPassword(env.adminPassword);
  await authUserRepository.create({
    firstName: "Admin",
    lastName: "User",
    email: env.adminEmail,
    password: hashedPassword,
    admin: true,
  });

  logger?.info({ msg: "Admin user seeded", email: env.adminEmail });
};
