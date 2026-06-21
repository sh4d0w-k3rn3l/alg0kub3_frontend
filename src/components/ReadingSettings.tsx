'use client';

import React, { useRef, useEffect } from 'react';
import { RotateCcw, Maximize, Minimize } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const DEFAULTS = {
  fontSize: 'medium' as const,
  fontFamily: 'sans' as const,
  lineHeight: 'default' as const,
  contentWidth: 'default' as const,
  focusMode: false,
};

interface SegmentedControlProps {
  options: { value: string; label: string; testGroup: string }[];
  value: string;
  onChange: (value: string) => void;
  colors: Record<string, string>;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, colors }) => (
  <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: colors.border, backgroundColor: colors.bgDeep }}>
    {options.map((opt) => (
      <button
        key={opt.value}
        data-testid={`reading-${opt.testGroup}-${opt.value}`}
        onClick={() => onChange(opt.value)}
        className="flex-1 px-3 py-2 text-sm font-medium transition-all duration-150"
        style={{
          backgroundColor: value === opt.value ? '#22c55e' : 'transparent',
          color: value === opt.value ? '#000' : colors.textSecondary,
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

interface ReadingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: string;
  onFontSizeChange: (value: string) => void;
  fontFamily: string;
  onFontFamilyChange: (value: string) => void;
  lineHeight: string;
  onLineHeightChange: (value: string) => void;
  contentWidth: string;
  onContentWidthChange: (value: string) => void;
  focusMode: boolean;
  onFocusModeChange: (value: boolean) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

const ReadingSettings: React.FC<ReadingSettingsProps> = ({
  isOpen, onClose,
  fontSize, onFontSizeChange,
  fontFamily, onFontFamilyChange,
  lineHeight, onLineHeightChange,
  contentWidth, onContentWidthChange,
  focusMode, onFocusModeChange,
  isFullScreen, onToggleFullScreen,
}) => {
  const { colors } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if ((e.target as HTMLElement).closest('[data-testid="reading-settings-button"]')) return;
        onClose();
      }
    };
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    onFontSizeChange(DEFAULTS.fontSize);
    onFontFamilyChange(DEFAULTS.fontFamily);
    onLineHeightChange(DEFAULTS.lineHeight);
    onContentWidthChange(DEFAULTS.contentWidth);
    onFocusModeChange(DEFAULTS.focusMode);
  };

  const fontSizeOptions = [
    { value: 'xsmall', label: 'A-', testGroup: 'fontsize' },
    { value: 'small', label: 'A', testGroup: 'fontsize' },
    { value: 'medium', label: 'A+', testGroup: 'fontsize' },
    { value: 'large', label: 'A++', testGroup: 'fontsize' },
    { value: 'xlarge', label: 'A+++', testGroup: 'fontsize' },
  ];

  const fontFamilyOptions = [
    { value: 'sans', label: 'Sans', testGroup: 'fontfamily' },
    { value: 'serif', label: 'Serif', testGroup: 'fontfamily' },
    { value: 'mono', label: 'Mono', testGroup: 'fontfamily' },
  ];

  const lineHeightOptions = [
    { value: 'compact', label: 'Compact', testGroup: 'lineheight' },
    { value: 'default', label: 'Default', testGroup: 'lineheight' },
    { value: 'relaxed', label: 'Relaxed', testGroup: 'lineheight' },
    { value: 'spacious', label: 'Spacious', testGroup: 'lineheight' },
  ];

  const contentWidthOptions = [
    { value: 'narrow', label: 'Narrow', testGroup: 'contentwidth' },
    { value: 'default', label: 'Default', testGroup: 'contentwidth' },
    { value: 'wide', label: 'Wide', testGroup: 'contentwidth' },
  ];

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full right-0 mb-2 w-[340px] border rounded-xl shadow-2xl overflow-hidden z-[70]"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      data-testid="reading-settings-panel"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: colors.border }}>
        <span className="text-sm font-bold" style={{ color: colors.text }}>Reading Settings</span>
        <button
          data-testid="reading-settings-reset"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
          style={{ color: colors.textSecondary }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Font Size</label>
          <SegmentedControl options={fontSizeOptions} value={fontSize} onChange={onFontSizeChange} colors={colors} />
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Font Family</label>
          <SegmentedControl options={fontFamilyOptions} value={fontFamily} onChange={onFontFamilyChange} colors={colors} />
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Line Height</label>
          <SegmentedControl options={lineHeightOptions} value={lineHeight} onChange={onLineHeightChange} colors={colors} />
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Content Width</label>
          <SegmentedControl options={contentWidthOptions} value={contentWidth} onChange={onContentWidthChange} colors={colors} />
        </div>

        <div className="flex items-center justify-between pt-1 pb-0.5 border-t" style={{ borderColor: colors.border }}>
          <div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>Focus Mode</div>
            <div className="text-xs" style={{ color: colors.textMuted }}>Hide sidebar & distractions</div>
          </div>
          <button
            data-testid="reading-focus-mode-toggle"
            onClick={() => onFocusModeChange(!focusMode)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: focusMode ? '#22c55e' : colors.bgDeep || '#2d333b' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"
              style={{
                backgroundColor: focusMode ? '#fff' : colors.textMuted || '#6e7681',
                transform: focusMode ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pb-0.5 border-t pt-3" style={{ borderColor: colors.border }}>
          <div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>Full Screen</div>
            <div className="text-xs" style={{ color: colors.textMuted }}>Immersive reading experience</div>
          </div>
          <button
            data-testid="reading-fullscreen-toggle"
            onClick={onToggleFullScreen}
            className="p-2 rounded-lg transition-colors"
            style={{ color: isFullScreen ? '#22c55e' : colors.textSecondary, backgroundColor: isFullScreen ? '#22c55e15' : 'transparent' }}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export { DEFAULTS };
export default ReadingSettings;
