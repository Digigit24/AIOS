import { create } from 'zustand';

const STORAGE_KEY = 'agencyos_auth';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create((set) => {
  const initial = loadFromStorage();
  return {
    token: initial.token,
    user: initial.user,

    setAuth: (token, user) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
      set({ token, user });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ token: null, user: null });
    },

    isAuthenticated: () => !!initial.token,
  };
});
