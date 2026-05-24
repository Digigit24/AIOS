import { useAuthStore } from '../store/authStore';

export const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

export function authFetch(url, options = {}) {
  const token = useAuthStore.getState().token;
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(url, { ...options, headers }).then((res) => {
    if (res.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return res;
  });
}
