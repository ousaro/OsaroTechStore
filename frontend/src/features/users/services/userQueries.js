import { UserProfile } from "../model/UserProfile.js";

export function createUserQueries({ users: repo, sessionStore }) {
  async function getMyProfile() {
    const { ok, data } = await repo.getMe();
    if (!ok) return null;
    const token = sessionStore.get()?.token;
    return new UserProfile({ ...data, token });
  }

  async function getAllUsers() {
    // Admin-only — uses /auth/users from auth module's repo
    // This is intentionally thin; the admin view uses authInputPort.listUsers()
    return [];
  }

  return { getMyProfile, getAllUsers };
}
