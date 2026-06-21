import { create } from 'zustand';
import type { FontSizeKey, FontFamilyKey, LineHeightKey, ContentWidthKey, SyntaxThemeKey } from '@/types';

interface SettingsState {
  fontSize: FontSizeKey;
  syntaxTheme: SyntaxThemeKey;
  fontFamily: FontFamilyKey;
  lineHeight: LineHeightKey;
  contentWidth: ContentWidthKey;
  focusMode: boolean;
  setFontSize: (size: FontSizeKey) => void;
  setSyntaxTheme: (theme: SyntaxThemeKey) => void;
  setFontFamily: (family: FontFamilyKey) => void;
  setLineHeight: (height: LineHeightKey) => void;
  setContentWidth: (width: ContentWidthKey) => void;
  setFocusMode: (focus: boolean) => void;
  hydrate: () => void;
}

const getInitial = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? (val as unknown as T) : fallback;
  } catch {
    return fallback;
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 'medium' as FontSizeKey,
  syntaxTheme: 'vscDarkPlus' as SyntaxThemeKey,
  fontFamily: 'sans' as FontFamilyKey,
  lineHeight: 'default' as LineHeightKey,
  contentWidth: 'default' as ContentWidthKey,
  focusMode: false,

  setFontSize: (fontSize) => {
    localStorage.setItem('fontSize', fontSize);
    set({ fontSize });
  },
  setSyntaxTheme: (syntaxTheme) => {
    localStorage.setItem('syntaxTheme', syntaxTheme);
    set({ syntaxTheme });
  },
  setFontFamily: (fontFamily) => {
    localStorage.setItem('fontFamily', fontFamily);
    set({ fontFamily });
  },
  setLineHeight: (lineHeight) => {
    localStorage.setItem('lineHeight', lineHeight);
    set({ lineHeight });
  },
  setContentWidth: (contentWidth) => {
    localStorage.setItem('contentWidth', contentWidth);
    set({ contentWidth });
  },
  setFocusMode: (focusMode) => {
    localStorage.setItem('focusMode', String(focusMode));
    set({ focusMode });
  },
  hydrate: () => set({
    fontSize: getInitial('fontSize', 'medium'),
    syntaxTheme: getInitial('syntaxTheme', 'vscDarkPlus'),
    fontFamily: getInitial('fontFamily', 'sans'),
    lineHeight: getInitial('lineHeight', 'default'),
    contentWidth: getInitial('contentWidth', 'default'),
    focusMode: getInitial<string>('focusMode', 'false') === 'true',
  }),
}));
