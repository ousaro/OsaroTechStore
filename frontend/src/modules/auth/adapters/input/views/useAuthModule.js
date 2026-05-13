/**
 * AUTH — Input Adapter: React View Hook
 *
 * This is the input adapter for auth. It translates React state lifecycle
 * into calls to the auth input port — mirroring how the backend's HTTP
 * controller translates HTTP requests into input port calls.
 *
 * Views import THIS hook, never the use cases or repositories directly.
 */
import { useState, useEffect, useCallback, useContext, createContext, useMemo } from "react";
import { Events } from "../../../../../shared/domain/events/DomainEvent.js";

export const AuthViewContext = createContext(null);

export function createAuthViewAdapter({ authInputPort, eventBus }) {
  /**
   * Provider: wraps the React tree. Placed in the app root by the router.
   */
  function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate from session on mount
    useEffect(() => {
      setUser(authInputPort.getSession());
      setLoading(false);
    }, []);

    // React to domain events so every part of the UI stays in sync
    useEffect(() => {
      const onLogin    = (e) => setUser(e.payload.user);
      const onLogout   = ()  => setUser(null);
      const onRegister = (e) => setUser(e.payload.user);

      eventBus.subscribe(Events.USER_LOGGED_IN,  onLogin);
      eventBus.subscribe(Events.USER_LOGGED_OUT, onLogout);
      eventBus.subscribe(Events.USER_REGISTERED, onRegister);

      return () => {
        eventBus.unsubscribe(Events.USER_LOGGED_IN,  onLogin);
        eventBus.unsubscribe(Events.USER_LOGGED_OUT, onLogout);
        eventBus.unsubscribe(Events.USER_REGISTERED, onRegister);
      };
    }, []);

    const login    = useCallback(authInputPort.login,    []);
    const register = useCallback(authInputPort.register, []);
    const logout   = useCallback(authInputPort.logout,   []);

    const value = useMemo(
      () => ({ user, loading, login, register, logout }),
      [user, loading]
    );

    return (
      <AuthViewContext.Provider value={value}>
        {children}
      </AuthViewContext.Provider>
    );
  }

  return { AuthProvider };
}

export function useAuth() {
  const ctx = useContext(AuthViewContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
