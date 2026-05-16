import { useState, useEffect, useContext, createContext } from "react";
import { Events } from "../../../lib/events.js";

export const AuthViewContext = createContext(null);

export function createAuthViewAdapter({ authInputPort, eventBus }) {
  function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setUser(authInputPort.getSession());
      setLoading(false);
    }, []);

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

    const value = {
      user,
      loading,
      login: (...args) => authInputPort.login(...args),
      register: (...args) => authInputPort.register(...args),
      logout: (...args) => authInputPort.logout(...args),
    };

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
