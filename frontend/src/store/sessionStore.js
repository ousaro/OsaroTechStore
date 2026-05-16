const KEY = "ots_session";

export const sessionStore = {
  get() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); }
    catch { return null; }
  },
  set(payload)  { sessionStorage.setItem(KEY, JSON.stringify(payload)); },
  clear()       { sessionStorage.removeItem(KEY); },
  patch(partial) {
    const stored = sessionStore.get();
    if (!stored) return;
    sessionStore.set({ ...stored, ...partial, token: stored.token });
  },
};
