/**
 * USERS — Input Adapter: React View Hook
 *
 * Provides rich user profile state to views.
 * Syncs with session after every mutation so Navbar cart count,
 * favorites, etc. stay accurate without a full re-fetch.
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../../../auth/adapters/input/views/useAuthModule.js";
import { UserProfile } from "../../../domain/entities/UserProfile.js";

export const UsersViewContext = createContext(null);

export function createUsersViewAdapter({ usersInputPort, sessionStore, eventBus }) {
  function UsersProvider({ children }) {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);

    // Build a UserProfile from the session whenever authUser changes
    useEffect(() => {
      if (!authUser) { setProfile(null); return; }
      const raw = sessionStore.get();
      setProfile(raw ? new UserProfile(raw) : null);
    }, [authUser?.id]); // eslint-disable-line

    const refreshProfile = useCallback(async () => {
      const p = await usersInputPort.getMyProfile();
      if (p) setProfile(p);
    }, []);

    const updateProfile = useCallback(async (patch) => {
      const updated = await usersInputPort.updateProfile(patch);
      setProfile(updated);
      return updated;
    }, []);

    const toggleFavorite = useCallback(async (productId, action) => {
      const updated = await usersInputPort.toggleFavorite(productId, action);
      setProfile(updated);
      return updated;
    }, []);

    const deleteAccount = useCallback(async (userId) => {
      await usersInputPort.deleteAccount(userId);
      setProfile(null);
    }, []);

    const value = useMemo(() => ({
      profile,
      updateProfile,
      toggleFavorite,
      deleteAccount,
      refreshProfile,
      deleteUser: usersInputPort.deleteUser,
    }), [profile]);

    return (
      <UsersViewContext.Provider value={value}>
        {children}
      </UsersViewContext.Provider>
    );
  }

  return { UsersProvider };
}

export function useUsers() {
  const ctx = useContext(UsersViewContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
