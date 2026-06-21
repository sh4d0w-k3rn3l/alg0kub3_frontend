'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface FontSizePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: string;
  onFontSizeChange: (value: string) => void;
}

const FontSizePopover: React.FC<FontSizePopoverProps> = ({ isOpen, onClose, fontSize, onFontSizeChange }) => {
  const { colors } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = [
    { label: 'Small', value: 'small', px: '14px' },
    { label: 'Medium', value: 'medium', px: '15.5px' },
    { label: 'Large', value: 'large', px: '17px' },
    { label: 'X-Large', value: 'xlarge', px: '19px' },
  ];

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full right-0 mb-2 w-44 border rounded-lg shadow-xl overflow-hidden z-[70]"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: colors.border }}>
        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Font Size</span>
      </div>
      <div className="p-1.5">
        {sizes.map((s) => (
          <button
            key={s.value}
            onClick={() => { onFontSizeChange(s.value); onClose(); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors"
            style={{
              color: fontSize === s.value ? colors.green : colors.text,
              backgroundColor: fontSize === s.value ? colors.greenBg : 'transparent',
            }}
          >
            <span className="flex items-center justify-between">
              <span style={{ fontSize: s.px }}>{s.label}</span>
              <span className="text-xs" style={{ color: colors.textMuted }}>{s.px}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FontSizePopover;
