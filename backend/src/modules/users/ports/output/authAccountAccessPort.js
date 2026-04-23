const ALLOWED_PROFILE_FIELDS = new Set([
  "firstName",
  "lastName",
  "picture",
  "phone",
  "address",
  "city",
  "country",
  "state",
  "postalCode",
  "favorites",
  "cart",
]);

const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
};

const assertProfile = (profile, fieldName = "managed user profile") => {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error(`${fieldName} must be an object`);
  }

  assertNonEmptyString(profile._id, `${fieldName}._id`);
  assertNonEmptyString(profile.email, `${fieldName}.email`);

  if (typeof profile.admin !== "boolean") {
    throw new Error(`${fieldName}.admin is required`);
  }

  if ("password" in profile) {
    throw new Error(`${fieldName} must not expose password`);
  }
};

export const assertManagedUserProfilePatch = (updates) => {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new Error("managed user profile updates must be an object");
  }

  for (const fieldName of Object.keys(updates)) {
    if (!ALLOWED_PROFILE_FIELDS.has(fieldName)) {
      throw new Error(`managed user profile updates must not include ${fieldName}`);
    }
  }

  return updates;
};

export const assertManagedUserCredentials = (credentials) => {
  if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)) {
    throw new Error("managed user credentials must be an object");
  }

  assertNonEmptyString(credentials._id, "managed user credentials._id");
  assertNonEmptyString(credentials.password, "managed user credentials.password");

  return credentials;
};

export const createValidatedAuthAccountAccess = (authAccountAccess) => {
  assertAuthAccountAccessPort(authAccountAccess, [
    "listManagedUserProfiles",
    "getManagedUserProfile",
    "updateManagedUserProfile",
    "removeManagedUserProfile",
    "getManagedUserCredentials",
    "updateManagedUserCredentials",
  ]);

  return {
    ...authAccountAccess,
    async listManagedUserProfiles() {
      const profiles = await authAccountAccess.listManagedUserProfiles();

      if (!Array.isArray(profiles)) {
        throw new Error("managed user profiles must be an array");
      }

      profiles.forEach((profile) => assertProfile(profile));
      return profiles;
    },
    async getManagedUserProfile(id) {
      const profile = await authAccountAccess.getManagedUserProfile(id);

      if (profile !== null) {
        assertProfile(profile);
      }

      return profile;
    },
    async updateManagedUserProfile(id, updates) {
      assertManagedUserProfilePatch(updates);
      const profile = await authAccountAccess.updateManagedUserProfile(id, updates);

      if (profile !== null) {
        assertProfile(profile);
      }

      return profile;
    },
    async removeManagedUserProfile(id) {
      const profile = await authAccountAccess.removeManagedUserProfile(id);

      if (profile !== null) {
        assertProfile(profile);
      }

      return profile;
    },
    async getManagedUserCredentials(id) {
      const credentials = await authAccountAccess.getManagedUserCredentials(id);

      if (credentials !== null) {
        assertManagedUserCredentials(credentials);
      }

      return credentials;
    },
    async updateManagedUserCredentials(id, updates) {
      if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
        throw new Error("managed user credential updates must be an object");
      }

      assertNonEmptyString(updates.password, "managed user credential updates.password");
      const profile = await authAccountAccess.updateManagedUserCredentials(id, updates);

      if (profile !== null) {
        assertProfile(profile);
      }

      return profile;
    },
  };
};

export const assertAuthAccountAccessPort = (authAccountAccess, requiredMethods = []) => {
  if (!authAccountAccess || typeof authAccountAccess !== "object") {
    throw new Error("authAccountAccess port is required");
  }

  for (const methodName of requiredMethods) {
    if (typeof authAccountAccess[methodName] !== "function") {
      throw new Error(`authAccountAccess port must implement ${methodName}`);
    }
  }

  return authAccountAccess;
};
