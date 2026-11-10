import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Check local storage or system preference on load
  const savedTheme = localStorage.getItem('qrcode_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  // Apply immediately
  if (initialDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    isDarkMode: initialDark,
    toggleTheme: () => set((state) => {
      const newMode = !state.isDarkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('qrcode_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('qrcode_theme', 'light');
      }
      return { isDarkMode: newMode };
    }),
  };
});