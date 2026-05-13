import { UserProfile } from "../../domain/entities/UserProfile.js";

export function createUserCommands({ users: repo, sessionStore, notify }) {
  const rehydrate = (data) => {
    const token = sessionStore.get()?.token;
    const profile = new UserProfile({ ...data, token });
    sessionStore.set(profile.toJSON());
    return profile;
  };

  async function updateProfile(patch) {
    const { ok, data, error } = await repo.updateMe(patch);
    if (!ok) { notify.error(error || "Update failed"); throw new Error(error); }
    notify.success("Profile updated!");
    return rehydrate(data);
  }

  async function toggleFavorite(productId, action) {
    const { ok, data, error } = await repo.toggleFavorite(productId, action);
    if (!ok) { notify.error(error || "Failed"); throw new Error(error); }
    return rehydrate(data);
  }

  async function deleteAccount(userId) {
    const { ok, error } = await repo.deleteById(userId);
    if (!ok) { notify.error(error || "Delete failed"); throw new Error(error); }
    sessionStore.clear();
    notify.success("Account deleted");
  }

  async function deleteUser(userId) {
    const { ok, error } = await repo.deleteById(userId);
    if (!ok) { notify.error(error || "Delete failed"); throw new Error(error); }
    notify.success("User deleted");
  }

  return { updateProfile, toggleFavorite, deleteAccount, deleteUser };
}
