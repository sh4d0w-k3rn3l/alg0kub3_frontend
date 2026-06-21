'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

const THEMES = [
  { label: 'VS Code Dark+', value: 'vscDarkPlus' },
  { label: 'Atom Dark', value: 'atomDark' },
  { label: 'Dracula', value: 'dracula' },
  { label: 'One Dark', value: 'oneDark' },
  { label: 'Material Dark', value: 'materialDark' },
  { label: 'Night Owl', value: 'nightOwl' },
  { label: 'Coldark Dark', value: 'coldarkDark' },
  { label: 'Nord', value: 'nord' },
];

const LIGHT_THEMES = [
  { label: 'VS Code Light', value: 'vs' },
  { label: 'One Light', value: 'oneLight' },
  { label: 'Material Light', value: 'materialLight' },
  { label: 'Coldark Cold', value: 'coldarkCold' },
];

interface SyntaxThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  syntaxTheme: string;
  onThemeChange: (value: string) => void;
}

const SyntaxThemeSelector: React.FC<SyntaxThemeSelectorProps> = ({ isOpen, onClose, syntaxTheme, onThemeChange }) => {
  const { isDark, colors } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themes = isDark ? THEMES : LIGHT_THEMES;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full mt-2 w-52 border rounded-lg shadow-xl overflow-hidden z-[70]"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border, right: 0 }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: colors.border }}>
        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Code Theme</span>
      </div>
      <div className="p-1.5 max-h-[250px] overflow-y-auto custom-scrollbar">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => { onThemeChange(t.value); onClose(); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors"
            style={{
              color: syntaxTheme === t.value ? colors.green : colors.text,
              backgroundColor: syntaxTheme === t.value ? colors.greenBg : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export { THEMES, LIGHT_THEMES };
export default SyntaxThemeSelector;
