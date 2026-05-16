const KEY = "ots_session";

export const sessionStore = {
  get() {
    try { return JSON.parse(localStorage.getItem(KEY)); }
    catch { return null; }
  },
  set(payload)  { localStorage.setItem(KEY, JSON.stringify(payload)); },
  clear()       { localStorage.removeItem(KEY); },
  patch(partial) {
    const stored = sessionStore.get();
    if (!stored) return;
    sessionStore.set({ ...stored, ...partial, token: stored.token });
  },
};
