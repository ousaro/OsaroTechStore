import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { UserProfile } from "../model/UserProfile.js";

export const UsersViewContext = createContext(null);

export function createUsersViewAdapter({ usersInputPort, sessionStore }) {
  function UsersProvider({ children }) {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
      if (!authUser) { setProfile(null); return; }
      const raw = sessionStore.get();
      setProfile(raw ? new UserProfile(raw) : null);
    }, [authUser?.id]); // eslint-disable-line

    const refreshProfile = async () => {
      const p = await usersInputPort.getMyProfile();
      if (p) setProfile(p);
    };

    const updateProfile = async (patch) => {
      const updated = await usersInputPort.updateProfile(patch);
      setProfile(updated);
      return updated;
    };

    const updatePassword = (payload) => usersInputPort.updatePassword(payload);

    const toggleFavorite = async (productId, action) => {
      const updated = await usersInputPort.toggleFavorite(productId, action);
      setProfile(updated);
      return updated;
    };

    const deleteAccount = async (userId) => {
      await usersInputPort.deleteAccount(userId);
      setProfile(null);
    };

    const value = {
      profile,
      updateProfile,
      updatePassword,
      toggleFavorite,
      deleteAccount,
      refreshProfile,
      deleteUser: usersInputPort.deleteUser,
    };

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
