import test from "node:test";
import assert from "node:assert/strict";

import { ApplicationNotFoundError } from "../../../../../src/shared/application/errors/index.js";
import { buildGetUserProfileUseCase } from "../../../../../src/modules/users/application/queries/getUserProfileUseCase.js";
import { buildUpdateUserProfileUseCase } from "../../../../../src/modules/users/application/commands/updateUserProfileUseCase.js";
import { buildUpdateUserPasswordUseCase } from "../../../../../src/modules/users/application/commands/updateUserPasswordUseCase.js";
import { buildUpdateUserCartUseCase } from "../../../../../src/modules/users/application/commands/updateUserCartUseCase.js";
import { buildUpdateUserFavoritesUseCase } from "../../../../../src/modules/users/application/commands/updateUserFavoritesUseCase.js";

const userRecord = {
  _id: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  favorites: ["p1"],
  cart: [],
};

test("getUserProfile returns requester profile by default", async () => {
  const getUserProfile = buildGetUserProfileUseCase({
    userRepository: { findById: async (id) => ({ ...userRecord, _id: id }) },
  });

  const result = await getUserProfile({ requesterId: "u1" });

  assert.equal(result._id, "u1");
  assert.equal(result.email, "ada@example.com");
});

test("getUserProfile throws when user is missing", async () => {
  const getUserProfile = buildGetUserProfileUseCase({
    userRepository: { findById: async () => null },
  });

  await assert.rejects(() => getUserProfile({ requesterId: "missing" }), ApplicationNotFoundError);
});

test("updateUserProfile updates target and returns read model", async () => {
  const updates = [];
  const updateUserProfile = buildUpdateUserProfileUseCase({
    userRepository: {
      updateById: async (id, update) => {
        updates.push({ id, update });
        return { ...userRecord, ...update, _id: id };
      },
    },
  });

  const result = await updateUserProfile({
    requesterId: "u1",
    updates: { city: "Casablanca" },
  });

  assert.deepEqual(updates[0], { id: "u1", update: { city: "Casablanca" } });
  assert.equal(result.city, "Casablanca");
});

test("updateUserPassword verifies current password and stores hash", async () => {
  const updates = [];
  const updateUserPassword = buildUpdateUserPasswordUseCase({
    userRepository: {
      findByIdWithPassword: async (id) => ({ ...userRecord, _id: id, password: "stored-hash" }),
      comparePassword: async (plain, hash) => plain === "Password123!" && hash === "stored-hash",
      hashPassword: async (plain) => `hashed:${plain}`,
      updatePasswordById: async (id, password) => updates.push({ id, password }),
    },
  });

  const result = await updateUserPassword({
    userId: "u1",
    currentPassword: "Password123!",
    newPassword: "BetterPassword123!",
    confirmPassword: "BetterPassword123!",
  });

  assert.deepEqual(result, { success: true });
  assert.deepEqual(updates, [{ id: "u1", password: "hashed:BetterPassword123!" }]);
});

test("updateUserPassword rejects incorrect current password", async () => {
  const updateUserPassword = buildUpdateUserPasswordUseCase({
    userRepository: {
      findByIdWithPassword: async () => ({ ...userRecord, password: "stored-hash" }),
      comparePassword: async () => false,
      hashPassword: async () => {
        throw new Error("should not hash");
      },
      updatePasswordById: async () => {
        throw new Error("should not update");
      },
    },
  });

  await assert.rejects(
    () => updateUserPassword({
      userId: "u1",
      currentPassword: "wrong",
      newPassword: "BetterPassword123!",
      confirmPassword: "BetterPassword123!",
    }),
    /Current password is incorrect/
  );
});

test("updateUserCart writes cart and returns read model", async () => {
  const cart = [{ productId: "p1", quantity: 2 }];
  const updateUserCart = buildUpdateUserCartUseCase({
    userRepository: {
      updateById: async (id, update) => ({ ...userRecord, _id: id, ...update }),
    },
  });

  const result = await updateUserCart({ userId: "u1", cart });

  assert.deepEqual(result.cart, cart);
});

test("updateUserFavorites adds unique favorites and removes by id", async () => {
  const updates = [];
  const repository = {
    findById: async () => ({ ...userRecord, favorites: ["p1", "p2"] }),
    updateById: async (id, update) => {
      updates.push({ id, update });
      return { ...userRecord, _id: id, ...update };
    },
  };

  const updateFavorites = buildUpdateUserFavoritesUseCase({ userRepository: repository });
  const addResult = await updateFavorites({ userId: "u1", productId: "p2", action: "add" });
  const removeResult = await updateFavorites({ userId: "u1", productId: "p1", action: "remove" });

  assert.deepEqual(addResult.favorites, ["p1", "p2"]);
  assert.deepEqual(removeResult.favorites, ["p2"]);
  assert.deepEqual(
    updates.map((item) => item.update),
    [{ favorites: ["p1", "p2"] }, { favorites: ["p2"] }]
  );
});

test("updateUserFavorites throws when user is missing", async () => {
  const updateFavorites = buildUpdateUserFavoritesUseCase({
    userRepository: {
      findById: async () => null,
      updateById: async () => {
        throw new Error("should not update");
      },
    },
  });

  await assert.rejects(
    () => updateFavorites({ userId: "missing", productId: "p1", action: "add" }),
    ApplicationNotFoundError
  );
});
