import { useEffect, useState } from 'react';
import { ThemeMode, ThemeConfig } from '../types';
import { defaultTheme } from '../styles/theme';

// Key for localStorage
const THEME_KEY = 'kyystatus-theme';

// Get system theme preference
export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Get stored theme or default
export function getStoredTheme(): ThemeConfig {
  if (typeof window === 'undefined') return defaultTheme;
  
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
  }
  
  return defaultTheme;
}

// Set theme in localStorage
export function setStoredTheme(theme: ThemeConfig) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

// Apply theme to document
export function applyTheme(mode: ThemeMode) {
  const root = window.document.documentElement;
  
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Custom hook for theme management
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(getStoredTheme());
  
  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme.mode === 'system' ? getSystemTheme() : storedTheme.mode);
  }, []);
  
  // Update theme
  const setThemeMode = (mode: ThemeMode) => {
    const newTheme: ThemeConfig = {
      ...theme,
      mode,
    };
    
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(mode === 'system' ? getSystemTheme() : mode);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const currentMode = theme.mode === 'system' ? getSystemTheme() : theme.mode;
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };
  
  // System theme change listener
  useEffect(() => {
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme.mode]);
  
  // Get current effective theme mode
  const effectiveMode = theme.mode === 'system' ? getSystemTheme() : theme.mode;
  
  return {
    theme,
    mode: effectiveMode,
    setTheme: setThemeMode,
    toggleTheme,
    isDark: effectiveMode === 'dark',
    isLight: effectiveMode === 'light',
  };
}

// Hook to get theme colors
export function useThemeColors() {
  const { isDark } = useTheme();
  
  // You can add more theme-specific colors here
  return {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: isDark ? '#0f172a' : '#ffffff',
    surface: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    border: isDark ? '#334155' : '#e2e8f0',
  };
}
