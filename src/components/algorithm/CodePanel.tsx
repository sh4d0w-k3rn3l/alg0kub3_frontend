'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Copy, Check, Plus, Minus, Palette } from 'lucide-react';
import SyntaxHighlight from './SyntaxHighlight';

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22];
const DEFAULT_FONT_SIZE = 14;

// Code editor themes
const CODE_THEMES = {
  'vs-dark': {
    name: 'VS Code Dark+',
    background: '#1e1e1e',
    headerBg: '#252526',
    border: '#3c3c3c',
    lineNumber: '#858585',
    lineNumberHighlight: '#c6c6c6',
    text: '#d4d4d4',
    highlight: '#264f78',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    function: '#dcdcaa',
    number: '#b5cea8',
    operator: '#d4d4d4',
    class: '#4ec9b0'
  },
  'dracula': {
    name: 'Dracula',
    background: '#282a36',
    headerBg: '#21222c',
    border: '#44475a',
    lineNumber: '#6272a4',
    lineNumberHighlight: '#f8f8f2',
    text: '#f8f8f2',
    highlight: '#44475a',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    function: '#50fa7b',
    number: '#bd93f9',
    operator: '#ff79c6',
    class: '#8be9fd'
  },
  'atom-dark': {
    name: 'Atom Dark',
    background: '#1d1f21',
    headerBg: '#282a2e',
    border: '#373b41',
    lineNumber: '#707880',
    lineNumberHighlight: '#c5c8c6',
    text: '#c5c8c6',
    highlight: '#373b41',
    keyword: '#b294bb',
    string: '#b5bd68',
    comment: '#969896',
    function: '#81a2be',
    number: '#de935f',
    operator: '#8abeb7',
    class: '#f0c674'
  },
  'night-owl': {
    name: 'Night Owl',
    background: '#011627',
    headerBg: '#0b2942',
    border: '#1d3b53',
    lineNumber: '#4b6479',
    lineNumberHighlight: '#d6deeb',
    text: '#d6deeb',
    highlight: '#1d3b53',
    keyword: '#c792ea',
    string: '#ecc48d',
    comment: '#637777',
    function: '#82aaff',
    number: '#f78c6c',
    operator: '#7fdbca',
    class: '#ffcb8b'
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    background: '#002b36',
    headerBg: '#073642',
    border: '#586e75',
    lineNumber: '#586e75',
    lineNumberHighlight: '#93a1a1',
    text: '#839496',
    highlight: '#073642',
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    function: '#268bd2',
    number: '#d33682',
    operator: '#93a1a1',
    class: '#b58900'
  },
  'material-oceanic': {
    name: 'Material Oceanic',
    background: '#263238',
    headerBg: '#1e272c',
    border: '#37474f',
    lineNumber: '#546e7a',
    lineNumberHighlight: '#b0bec5',
    text: '#b0bec5',
    highlight: '#37474f',
    keyword: '#c792ea',
    string: '#c3e88d',
    comment: '#546e7a',
    function: '#82aaff',
    number: '#f78c6c',
    operator: '#89ddff',
    class: '#ffcb6b'
  }
};

interface CodePanelProps {
  code: Record<string, string>;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  highlightedLines: number[];
}

const CodePanel = ({
  code,
  selectedLanguage,
  onLanguageChange,
  highlightedLines
}: CodePanelProps) => {
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [selectedTheme, setSelectedTheme] = useState('vs-dark');
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const theme = CODE_THEMES[selectedTheme as keyof typeof CODE_THEMES];
  const currentCode = code[selectedLanguage] || code.java;
  const codeLines = currentCode.split('\n');

  const languageLabels: Record<string, string> = {
    java: 'Java',
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    csharp: 'C#',
    cpp: 'C++',
    go: 'Go'
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  };

  // Auto-scroll to highlighted line
  useEffect(() => {
    if (highlightedLines.length > 0 && codeContainerRef.current) {
      const targetLine = highlightedLines[0];
      const lineHeight = fontSize * 1.6;
      const containerHeight = codeContainerRef.current.clientHeight;
      const scrollTarget = (targetLine - 1) * lineHeight - containerHeight / 2 + lineHeight;

      codeContainerRef.current.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });
    }
  }, [highlightedLines, fontSize]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close dropdowns when clicking outside
  const closeDropdowns = () => {
    setShowLangDropdown(false);
    setShowThemeDropdown(false);
  };

  return (
    <div
      className="rounded-lg overflow-hidden h-full flex flex-col"
      style={{ backgroundColor: theme.background }}
      data-testid="code-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: theme.headerBg, borderColor: theme.border }}
      >
        {/* Left side - Language and Theme selectors */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowThemeDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-white hover:opacity-80 transition-colors"
              style={{ backgroundColor: theme.border }}
              data-testid="language-selector"
            >
              {languageLabels[selectedLanguage]}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showLangDropdown && (
              <div
                className="absolute top-full left-0 mt-1 rounded shadow-lg z-20 min-w-[120px]"
                style={{ backgroundColor: theme.border }}
              >
                {Object.entries(languageLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onLanguageChange(key);
                      setShowLangDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-colors"
                    style={{
                      color: selectedLanguage === key ? '#22c55e' : theme.text
                    }}
                    data-testid={`lang-option-${key}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeDropdown(!showThemeDropdown);
                setShowLangDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-white hover:opacity-80 transition-colors"
              style={{ backgroundColor: theme.border }}
              data-testid="theme-selector"
            >
              <Palette className="w-4 h-4" />
              {theme.name}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showThemeDropdown && (
              <div
                className="absolute top-full left-0 mt-1 rounded shadow-lg z-20 min-w-[160px]"
                style={{ backgroundColor: theme.border }}
              >
                {Object.entries(CODE_THEMES).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedTheme(key);
                      setShowThemeDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-colors flex items-center gap-2"
                    style={{
                      color: selectedTheme === key ? '#22c55e' : theme.text
                    }}
                    data-testid={`theme-option-${key}`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: themeOption.background, border: `1px solid ${themeOption.border}` }}
                    />
                    {themeOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Controls */}
          <div className="flex items-center gap-1 mr-2" data-testid="font-size-controls">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize === FONT_SIZES[0]}
              className="p-1.5 hover:opacity-80 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: theme.lineNumber }}
              title="Decrease font size"
              data-testid="decrease-font-btn"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              className="text-xs min-w-[32px] text-center"
              style={{ color: theme.lineNumber }}
              data-testid="font-size-display"
            >
              {fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              disabled={fontSize === FONT_SIZES[FONT_SIZES.length - 1]}
              className="p-1.5 hover:opacity-80 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: theme.lineNumber }}
              title="Increase font size"
              data-testid="increase-font-btn"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm hover:opacity-80 transition-colors"
            style={{ color: theme.lineNumber }}
            data-testid="copy-code-btn"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-[#22c55e]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-auto font-mono"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        data-testid="code-content"
      >
        <div className="p-4">
          {codeLines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightedLines.includes(lineNum);

            return (
              <div
                key={index}
                className="flex transition-colors duration-200"
                style={{
                  minHeight: `${fontSize * 1.6}px`,
                  backgroundColor: isHighlighted ? theme.highlight : 'transparent'
                }}
                data-testid={`code-line-${lineNum}`}
              >
                <span
                  className="text-right pr-4 select-none flex-shrink-0"
                  style={{
                    width: `${Math.max(40, fontSize * 2.5)}px`,
                    color: isHighlighted ? theme.lineNumberHighlight : theme.lineNumber
                  }}
                >
                  {lineNum}
                </span>
                <span className="whitespace-pre" style={{ color: theme.text }}>
                  <SyntaxHighlight code={line} language={selectedLanguage} theme={theme} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {(showLangDropdown || showThemeDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={closeDropdowns}
        />
      )}
    </div>
  );
};

export default CodePanel;
