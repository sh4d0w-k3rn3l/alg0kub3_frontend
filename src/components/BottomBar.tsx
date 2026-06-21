'use client';

import React, { useState } from 'react';
import { PenLine, Star, CheckCircle, Sparkles, ChevronRight, ChevronLeft, Settings, Palette } from 'lucide-react';
import ReadingSettings from './ReadingSettings';
import SyntaxThemeSelector from './SyntaxThemeSelector';
import { useTheme } from '@/context/ThemeContext';

interface LessonNav {
  slug: string;
  title: string;
}

interface BottomBarProps {
  nextLesson?: LessonNav | null;
  prevLesson?: LessonNav | null;
  onNavigate: (slug: string) => void;
  onToggleComplete: () => void;
  onToggleStar: () => void;
  isCompleted: boolean;
  isStarred: boolean;
  onOpenNotes: () => void;
  onOpenAskAI: () => void;
  fontSize: string;
  onFontSizeChange: (fs: string) => void;
  fontFamily: string;
  onFontFamilyChange: (ff: string) => void;
  lineHeight: string;
  onLineHeightChange: (lh: string) => void;
  contentWidth: string;
  onContentWidthChange: (cw: string) => void;
  focusMode: boolean;
  onFocusModeChange: (fm: boolean) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  syntaxTheme: string;
  onSyntaxThemeChange: (theme: string) => void;
}

const BottomBar = ({
  nextLesson, prevLesson, onNavigate,
  onToggleComplete, onToggleStar, isCompleted, isStarred,
  onOpenNotes, onOpenAskAI,
  fontSize, onFontSizeChange,
  fontFamily, onFontFamilyChange,
  lineHeight, onLineHeightChange,
  contentWidth, onContentWidthChange,
  focusMode, onFocusModeChange,
  isFullScreen, onToggleFullScreen,
  syntaxTheme, onSyntaxThemeChange,
}: BottomBarProps) => {
  const { colors } = useTheme();
  const [readingSettingsOpen, setReadingSettingsOpen] = useState(false);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);

  if (focusMode) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[48px] border-t flex items-center justify-center px-4 z-50 transition-all duration-300" style={{ backgroundColor: colors.headerBg, borderColor: colors.borderLight }}>
        <div className="flex items-center gap-2">
          {prevLesson && (
            <button onClick={() => onNavigate(prevLesson.slug)} className="flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-md transition-colors" style={{ borderColor: colors.border, color: colors.text }}>
              <ChevronLeft size={13} /><span className="max-w-[120px] truncate">{prevLesson.title}</span>
            </button>
          )}
          <div className="relative">
            <button data-testid="reading-settings-button" onClick={() => setReadingSettingsOpen(!readingSettingsOpen)} className="text-sm font-semibold px-2.5 py-1.5 rounded-md transition-colors border" style={{ color: colors.textSecondary, borderColor: colors.border }}>
              Aa
            </button>
            <ReadingSettings
              isOpen={readingSettingsOpen} onClose={() => setReadingSettingsOpen(false)}
              fontSize={fontSize} onFontSizeChange={onFontSizeChange}
              fontFamily={fontFamily} onFontFamilyChange={onFontFamilyChange}
              lineHeight={lineHeight} onLineHeightChange={onLineHeightChange}
              contentWidth={contentWidth} onContentWidthChange={onContentWidthChange}
              focusMode={focusMode} onFocusModeChange={onFocusModeChange}
              isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen}
            />
          </div>
          {nextLesson && (
            <button onClick={() => onNavigate(nextLesson.slug)} className="flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-md transition-colors" style={{ borderColor: colors.border, color: colors.text }}>
              <span className="max-w-[120px] truncate">{nextLesson.title}</span><ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[48px] border-t flex items-center justify-between px-2 sm:px-4 z-50" style={{ backgroundColor: colors.headerBg, borderColor: colors.borderLight }}>
      <div className="hidden md:flex items-center gap-1">
        <button className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded" style={{ color: colors.textSecondary }}>
          <Settings size={13} /><span>Vote/Request Content</span>
        </button>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        <button data-testid="open-notes-button" onClick={onOpenNotes} className="flex items-center gap-1 sm:gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded" style={{ color: colors.textSecondary }}>
          <PenLine size={13} /><span className="hidden sm:inline">Take Notes</span>
        </button>
        <button data-testid="toggle-star-button" onClick={onToggleStar} className="flex items-center gap-1 sm:gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded" style={{ color: isStarred ? '#facc15' : colors.textSecondary }}>
          <Star size={13} fill={isStarred ? '#facc15' : 'none'} /><span className="hidden sm:inline">Star</span>
        </button>
        <button data-testid="toggle-complete-button" onClick={onToggleComplete} className="flex items-center gap-1 sm:gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded" style={{ color: isCompleted ? colors.green : colors.textSecondary }}>
          <CheckCircle size={13} fill={isCompleted ? colors.green : 'none'} /><span className="hidden sm:inline">Complete</span>
        </button>
        <button data-testid="open-ask-ai-button" onClick={onOpenAskAI} className="flex items-center gap-1 sm:gap-1.5 text-xs transition-colors px-2 sm:px-3 py-1.5 rounded" style={{ color: colors.textSecondary }}>
          <Sparkles size={13} /><span className="hidden sm:inline">AI Tutor</span>
        </button>

        <div className="w-px h-4 mx-1" style={{ backgroundColor: colors.border }} />

        <div className="relative">
          <button data-testid="syntax-theme-selector-button" onClick={() => setThemePopoverOpen(!themePopoverOpen)} className="p-1.5 rounded transition-colors" style={{ color: colors.textSecondary }} title="Code Theme">
            <Palette size={14} />
          </button>
          <SyntaxThemeSelector isOpen={themePopoverOpen} onClose={() => setThemePopoverOpen(false)} syntaxTheme={syntaxTheme} onThemeChange={onSyntaxThemeChange} />
        </div>

        <div className="relative">
          <button data-testid="reading-settings-button" onClick={() => setReadingSettingsOpen(!readingSettingsOpen)} className="text-sm font-semibold px-2 py-1 rounded transition-colors" style={{ color: readingSettingsOpen ? '#22c55e' : colors.textSecondary }}>
            Aa
          </button>
          <ReadingSettings
            isOpen={readingSettingsOpen} onClose={() => setReadingSettingsOpen(false)}
            fontSize={fontSize} onFontSizeChange={onFontSizeChange}
            fontFamily={fontFamily} onFontFamilyChange={onFontFamilyChange}
            lineHeight={lineHeight} onLineHeightChange={onLineHeightChange}
            contentWidth={contentWidth} onContentWidthChange={onContentWidthChange}
            focusMode={focusMode} onFocusModeChange={onFocusModeChange}
            isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {prevLesson && (
          <button onClick={() => onNavigate(prevLesson.slug)} className="hidden lg:flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-md transition-colors" style={{ borderColor: colors.border, color: colors.text }}>
            <ChevronLeft size={13} /><span className="max-w-[120px] truncate">{prevLesson.title}</span>
          </button>
        )}
        {nextLesson && (
          <button onClick={() => onNavigate(nextLesson.slug)} className="flex items-center gap-1.5 border text-xs font-medium px-2 sm:px-3 py-1.5 rounded-md transition-colors" style={{ borderColor: colors.border, color: colors.text }}>
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{nextLesson.title}</span><ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomBar;
