'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ThemeColors } from '@/types';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue);

export const useTheme = () => useContext(ThemeContext);

const lightColors: ThemeColors = {
  bg: '#ffffff',
  bgSecondary: '#f6f8fa',
  bgTertiary: '#f0f2f5',
  bgCard: '#ffffff',
  bgCode: '#f6f8fa',
  bgCodeHeader: '#eff1f3',
  text: '#1f2328',
  textSecondary: '#656d76',
  textMuted: '#8b949e',
  border: '#d0d7de',
  borderLight: '#e8ebef',
  green: '#1a7f37',
  greenBg: 'rgba(26, 127, 55, 0.1)',
  hoverBg: '#f3f4f6',
  activeBg: 'rgba(26, 127, 55, 0.08)',
  headerBg: '#ffffff',
  sidebarBg: '#f6f8fa',
};

const darkColors: ThemeColors = {
  bg: '#0d1117',
  bgSecondary: '#0f1117',
  bgTertiary: '#161b22',
  bgCard: '#161b22',
  bgCode: '#161b22',
  bgCodeHeader: '#1c2333',
  text: '#c9d1d9',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
  border: '#2d333b',
  borderLight: '#1e2533',
  green: '#22c55e',
  greenBg: 'rgba(34, 197, 94, 0.1)',
  hoverBg: '#1c2333',
  activeBg: 'rgba(34, 197, 94, 0.1)',
  headerBg: '#0f1117',
  sidebarBg: '#0f1117',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', colors.bg);
    root.style.setProperty('--theme-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--theme-bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--theme-bg-card', colors.bgCard);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-light', colors.borderLight);
    root.style.setProperty('--theme-green', colors.green);
    root.style.setProperty('--theme-hover-bg', colors.hoverBg);
  }, [isDark, colors]);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
