import { UserProfile } from "../model/UserProfile.js";

export function createUserQueries({ users: repo, sessionStore }) {
  async function getMyProfile() {
    const { ok, data } = await repo.getMe();
    if (!ok) return null;
    const token = sessionStore.get()?.token;
    return new UserProfile({ ...data, token });
  }

  async function getAllUsers() {
    return [];
  }

  return { getMyProfile, getAllUsers };
}
