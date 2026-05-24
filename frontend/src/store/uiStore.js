import { create } from 'zustand';
import { getThemeConfig, saveThemeConfig, DEFAULT_THEME_CONFIG } from '../api/services/themeService';

export const useUiStore = create((set, get) => {
  // Read initial states
  const initialTheme = localStorage.getItem('agencyos_theme') || 'light';
  document.documentElement.dataset.theme = initialTheme;

  const initialConfig = getThemeConfig();

  return {
    // Theme Mode
    theme: initialTheme,
    toggleTheme: () => {
      const nextTheme = get().theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('agencyos_theme', nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      set({ theme: nextTheme });
      
      // Push toast notification
      get().addToast({
        type: 'info',
        title: 'Theme Changed',
        message: `Switched to ${nextTheme} mode`
      });
    },

    // Custom Dynamic Theme Configuration
    themeConfig: initialConfig,
    setThemeConfig: (partial) => {
      const current = get().themeConfig;
      const next = { ...current, ...partial };
      saveThemeConfig(next);
      set({ themeConfig: next });
    },
    resetThemeConfig: () => {
      saveThemeConfig(DEFAULT_THEME_CONFIG);
      set({ themeConfig: DEFAULT_THEME_CONFIG });
      
      get().addToast({
        type: 'success',
        title: 'Settings Reset',
        message: 'Reverted back to template defaults'
      });
    },

    // Drawer and Sidebar Open States
    isSettingsOpen: false,
    setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

    isMediaOpen: false,
    setMediaOpen: (isOpen) => set({ isMediaOpen: isOpen }),

    isToolsOpen: false,
    setToolsOpen: (isOpen) => set({ isToolsOpen: isOpen }),

    mobileSidebarOpen: false,
    setMobileSidebarOpen: (isOpen) => set({ mobileSidebarOpen: isOpen }),

    // Toast Notifications State
    toasts: [],
    addToast: ({ type, title, message }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message };
      
      set((state) => {
        // Enforce max 3 toasts concurrently
        const nextToasts = [...state.toasts, newToast].slice(-3);
        return { toasts: nextToasts };
      });

      // Auto dismiss after 3000ms
      setTimeout(() => {
        get().removeToast(id);
      }, 3000);
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }
  };
});

export default useUiStore;
