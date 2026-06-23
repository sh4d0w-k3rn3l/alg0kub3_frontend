'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, atomDark, dracula, oneDark, materialDark, nightOwl, coldarkDark, nord, vs, oneLight, materialLight, coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Copy, Hash, ChevronUp, ChevronDown, Maximize2, Minimize2, Check, Loader2, RotateCcw, Edit3, X, Palette, Terminal, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { CodeExecutionResponse } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useLanguagePref } from '@/context/LanguagePrefContext';
import SyntaxThemeSelector from '@/components/SyntaxThemeSelector';

const themeMap: Record<string, typeof vscDarkPlus> = { vscDarkPlus, atomDark, dracula, oneDark, materialDark, nightOwl, coldarkDark, nord, vs, oneLight, materialLight, coldarkCold };

const LANG_META: Record<string, { label: string; syntax: string; icon: string }> = {
  python:     { label: 'Python',     syntax: 'python',     icon: '🐍' },
  javascript: { label: 'JavaScript', syntax: 'javascript', icon: 'JS' },
  typescript: { label: 'TypeScript', syntax: 'typescript', icon: 'TS' },
  java:       { label: 'Java',       syntax: 'java',       icon: '☕' },
  c:          { label: 'C',          syntax: 'c',          icon: 'C' },
  cpp:        { label: 'C++',        syntax: 'cpp',        icon: 'C+' },
  go:         { label: 'Go',         syntax: 'go',         icon: 'Go' },
  rust:       { label: 'Rust',       syntax: 'rust',       icon: '🦀' },
  ruby:       { label: 'Ruby',       syntax: 'ruby',       icon: '💎' },
  php:        { label: 'PHP',        syntax: 'php',        icon: 'PH' },
  perl:       { label: 'Perl',       syntax: 'perl',       icon: 'Pl' },
  bash:       { label: 'Bash',       syntax: 'bash',       icon: '$_' },
  sql:        { label: 'SQL',        syntax: 'sql',        icon: 'DB' },
  shell:      { label: 'Bash',       syntax: 'bash',       icon: '$_' },
  sh:         { label: 'Bash',       syntax: 'bash',       icon: '$_' },
};

function getLangMeta(lang?: string) {
  const key = (lang || 'python').toLowerCase().replace('python3', 'python').replace('node', 'javascript').replace('js', 'javascript').replace('ts', 'typescript').replace('c++', 'cpp').replace('golang', 'go').replace('rs', 'rust').replace('rb', 'ruby').replace('pl', 'perl');
  return LANG_META[key] || { label: lang || 'Code', syntax: (lang || 'text').toLowerCase(), icon: '>' };
}

const RUNNABLE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust', 'ruby', 'php', 'perl', 'bash', 'sql'];

interface CodeBlockProps {
  code?: string;
  language?: string;
  runnable?: boolean;
  syntaxTheme?: string;
  onSyntaxThemeChange?: (theme: string) => void;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code = '', language = 'Python', runnable = false, syntaxTheme: propTheme, onSyntaxThemeChange }) => {
  const { colors } = useTheme();
  const { setPreferredLang } = useLanguagePref();
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedLang, setSelectedLang] = useState((language || 'python').toLowerCase());
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [stdinValue, setStdinValue] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langPickerRef = useRef<HTMLDivElement>(null);

  const syntaxTheme = propTheme || 'vscDarkPlus';
  const currentCode = isEditing ? editedCode : code;
  const selectedStyle = themeMap[syntaxTheme] || vscDarkPlus;
  const langMeta = getLangMeta(selectedLang);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) setShowLangPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setHasError(false);
    try {
      const res = await api.post<CodeExecutionResponse>('/execute-code', {
        code: currentCode,
        language: selectedLang,
        stdin: stdinValue || '',
      });
      const { stdout, stderr, exit_code } = res.data;
      if (stderr && exit_code !== 0) { setOutput(stderr); setHasError(true); }
      else if (stdout) { setOutput(stdout.trimEnd()); setHasError(false); }
      else if (stderr) { setOutput(stderr); setHasError(true); }
      else { setOutput('Code executed successfully (no output).'); setHasError(false); }
    } catch (err) { setOutput(`Execution error: ${(err as Error).message}`); setHasError(true); }
    finally { setIsRunning(false); }
  };

  const handleEdit = () => { setIsEditing(true); setEditedCode(currentCode); setTimeout(() => textareaRef.current?.focus(), 100); };
  const handleReset = () => { setEditedCode(code); setIsEditing(false); setOutput(null); };
  const lines = currentCode.split('\n');

  const customStyle = {
    ...selectedStyle,
    'pre[class*="language-"]': { ...(selectedStyle['pre[class*="language-"]'] || {}), background: 'transparent', margin: 0, padding: '16px 0', fontSize: '13px', lineHeight: '1.6' },
    'code[class*="language-"]': { ...(selectedStyle['code[class*="language-"]'] || {}), background: 'transparent', fontSize: '13px', lineHeight: '1.6' },
  };

  const renderLangBadge = (clickable = false) => (
    <div ref={clickable ? langPickerRef : undefined} className="relative">
      <button
        data-testid="code-lang-selector"
        onClick={() => clickable && runnable && setShowLangPicker(!showLangPicker)}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-sm font-medium transition-colors ${clickable && runnable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        style={{ color: colors.text }}
      >
        <span className="text-xs font-mono font-bold opacity-70" style={{ minWidth: '18px' }}>{langMeta.icon}</span>
        <span>{langMeta.label}</span>
        {clickable && runnable && <ChevronDown size={11} style={{ color: colors.textMuted }} />}
      </button>
      {showLangPicker && (
        <div className="absolute top-full left-0 mt-1 z-50 border rounded-lg shadow-xl overflow-hidden min-w-[160px]"
          style={{ backgroundColor: colors.bgCode, borderColor: colors.border }}>
          {RUNNABLE_LANGUAGES.map(lang => {
            const m = getLangMeta(lang);
            const isActive = lang === selectedLang || (lang === 'python' && selectedLang === 'python3');
            return (
              <button key={lang} data-testid={`lang-option-${lang}`}
                onClick={() => { setSelectedLang(lang); setPreferredLang(lang); setShowLangPicker(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors"
                style={{ backgroundColor: isActive ? colors.green + '15' : 'transparent', color: isActive ? colors.green : colors.text }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = colors.border + '40'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                <span className="text-[10px] font-mono font-bold opacity-60 w-4 text-center">{m.icon}</span>
                <span className="font-medium">{m.label}</span>
                {isActive && <Check size={12} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStdinToggle = () => runnable ? (
    <button data-testid="code-stdin-toggle" onClick={() => setShowStdin(!showStdin)}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
      style={{ color: showStdin ? '#f59e0b' : colors.textMuted }}
      title="Standard Input (stdin)">
      <Terminal size={12} /> stdin
    </button>
  ) : null;

  const renderStdinInput = () => showStdin && runnable ? (
    <div className="border-t px-4 py-2" style={{ borderColor: colors.border, backgroundColor: colors.bg + '80' }}>
      <div className="flex items-center gap-2 mb-1">
        <Terminal size={11} style={{ color: '#f59e0b' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#f59e0b' }}>stdin</span>
      </div>
      <textarea data-testid="code-stdin-input" value={stdinValue} onChange={e => setStdinValue(e.target.value)}
        placeholder="Enter input here (one value per line)..."
        className="w-full bg-transparent text-xs font-mono outline-none resize-none rounded p-2 border"
        style={{ color: colors.text, borderColor: colors.border, minHeight: '40px', maxHeight: '80px' }}
        rows={2} />
    </div>
  ) : null;

  const renderContent = () => (
    <div className={`rounded-lg border ${isExpanded ? '' : 'my-4'}`} style={{ backgroundColor: colors.bgCode, borderColor: colors.border }}>
      <div className="flex items-center justify-between px-4 py-2 border-b rounded-t-lg" style={{ backgroundColor: colors.bgCodeHeader, borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          {renderLangBadge(true)}
          {isEditing && <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded font-medium">EDITING</span>}
        </div>
        <div className="flex items-center gap-1">
          {runnable && (
            <>
              {renderStdinToggle()}
              <button data-testid="code-run-button" onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50" style={{ color: colors.green }}>
                {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill={colors.green} />}
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </>
          )}
          <button onClick={handleEdit} className="p-1.5 transition-colors" style={{ color: isEditing ? '#f59e0b' : colors.textMuted }} title="Edit code"><Edit3 size={14} /></button>
          {isEditing && <button onClick={handleReset} className="p-1.5 transition-colors" style={{ color: colors.textMuted }} title="Reset"><RotateCcw size={14} /></button>}
          <button
            data-testid="code-ai-button"
            onClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('algokube:ask-ai', {
                  detail: { code: currentCode, language: selectedLang },
                }));
              } catch {}
            }}
            className="p-1.5 transition-colors"
            style={{ color: '#a855f7' }}
            title="Ask AI about this code"
          >
            <Sparkles size={14} />
          </button>
          <button
            data-testid="code-linenum-toggle"
            onClick={() => setShowLineNumbers(v => !v)}
            className="p-1.5 transition-colors"
            style={{ color: showLineNumbers ? colors.text : colors.textMuted }}
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            <Hash size={14} />
          </button>
          <button
            data-testid="code-collapse-toggle"
            onClick={() => setIsCollapsed(v => !v)}
            className="p-1.5 transition-colors"
            style={{ color: colors.textMuted }}
            title={isCollapsed ? 'Expand code' : 'Collapse code'}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <div className="relative">
            <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="p-1.5 transition-colors" style={{ color: colors.textMuted }} title="Theme"><Palette size={14} /></button>
            <SyntaxThemeSelector isOpen={showThemeSelector} onClose={() => setShowThemeSelector(false)} syntaxTheme={syntaxTheme} onThemeChange={(theme: string) => { if (onSyntaxThemeChange) onSyntaxThemeChange(theme); }} />
          </div>
          <button onClick={handleCopy} className="p-1.5 transition-colors" style={{ color: colors.textMuted }}>
            {copied ? <Check size={14} style={{ color: colors.green }} /> : <Copy size={14} />}
          </button>
          <button data-testid="code-expand-button" onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 transition-colors" style={{ color: colors.textMuted }} title="Fullscreen">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {renderStdinInput()}

      {!isCollapsed && (
      <div className="relative" style={isExpanded ? { flex: 1, overflow: 'auto' } : {}}>
        {isEditing ? (
          <div className="flex">
            {showLineNumbers && (
              <div className="flex flex-col items-end pr-4 pl-4 pt-4 pb-4 select-none" style={{ minWidth: '40px' }}>
                {editedCode.split('\n').map((_, i) => (<span key={i} className="text-[13px] leading-[1.6] font-mono" style={{ color: colors.textMuted }}>{i + 1}</span>))}
              </div>
            )}
            <textarea ref={textareaRef} value={editedCode} onChange={(e) => setEditedCode(e.target.value)}
              className={`flex-1 bg-transparent text-[13px] leading-[1.6] font-mono outline-none resize-none p-4 ${showLineNumbers ? 'pl-0' : ''}`}
              style={{ color: colors.text, minHeight: `${Math.max(lines.length * 21, 60)}px`, tabSize: 4 }}
              spellCheck={false}
              onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget.selectionStart; const end = e.currentTarget.selectionEnd; setEditedCode(editedCode.substring(0, s) + '    ' + editedCode.substring(end)); setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 4; }, 0); } }}
            />
          </div>
        ) : (
          <div className="flex">
            {showLineNumbers && (
              <div className="flex flex-col items-end pr-4 pl-4 pt-4 pb-4 select-none" style={{ minWidth: '40px' }}>
                {lines.map((_, i) => (<span key={i} className="text-[13px] leading-[1.6] font-mono" style={{ color: colors.textMuted }}>{i + 1}</span>))}
              </div>
            )}
            <div className="flex-1 overflow-x-auto">
              <SyntaxHighlighter language={langMeta.syntax} style={customStyle} showLineNumbers={false} customStyle={{ background: 'transparent', margin: 0, padding: `16px 16px 16px ${showLineNumbers ? '0' : '16px'}` }}>
                {currentCode}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
      )}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          data-testid="code-collapsed-show"
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: colors.textMuted, backgroundColor: colors.bgCode }}
        >
          <ChevronDown size={12} /> Show {lines.length} lines of {langMeta.label}
        </button>
      )}

      {output !== null && (
        <div className="border-t px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${hasError ? 'text-red-400' : ''}`} style={hasError ? {} : { color: colors.green }}>{hasError ? 'Error' : 'Output'}</span>
          </div>
          <pre className={`text-sm font-mono whitespace-pre-wrap ${hasError ? 'text-red-300' : ''}`} style={hasError ? {} : { color: colors.text }}>{output}</pre>
        </div>
      )}
    </div>
  );

  if (isExpanded) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 z-[75]" onClick={() => setIsExpanded(false)} />
        <div className="fixed inset-4 z-[80] flex flex-col rounded-xl overflow-hidden border" style={{ borderColor: colors.border, backgroundColor: colors.bgCode }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: colors.border, backgroundColor: colors.bgCodeHeader }}>
            <div className="flex items-center gap-2">
              {renderLangBadge(true)}
              <span className="text-xs" style={{ color: colors.textMuted }}>Expanded View</span>
            </div>
            <button onClick={() => setIsExpanded(false)} className="p-1.5 transition-colors rounded" style={{ color: colors.textMuted }}><X size={16} /></button>
          </div>
          {renderStdinInput()}
          <div className="flex-1 overflow-auto">
            {isEditing ? (
              <div className="flex h-full">
                <div className="flex flex-col items-end pr-4 pl-4 pt-4 pb-4 select-none" style={{ minWidth: '50px' }}>
                  {editedCode.split('\n').map((_, i) => (<span key={i} className="text-[13px] leading-[1.6] font-mono" style={{ color: colors.textMuted }}>{i + 1}</span>))}
                </div>
                <textarea ref={textareaRef} value={editedCode} onChange={(e) => setEditedCode(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] leading-[1.7] font-mono outline-none resize-none p-4 pl-0 h-full"
                  style={{ color: colors.text, tabSize: 4 }} spellCheck={false}
                  onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget.selectionStart; setEditedCode(editedCode.substring(0, s) + '    ' + editedCode.substring(e.currentTarget.selectionEnd)); setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 4; }, 0); } }}
                />
              </div>
            ) : (
              <div className="flex h-full">
                <div className="flex flex-col items-end pr-4 pl-4 pt-4 pb-4 select-none" style={{ minWidth: '50px' }}>
                  {lines.map((_, i) => (<span key={i} className="text-[13px] leading-[1.6] font-mono" style={{ color: colors.textMuted }}>{i + 1}</span>))}
                </div>
                <div className="flex-1 overflow-x-auto">
                  <SyntaxHighlighter language={langMeta.syntax} style={customStyle} showLineNumbers={false} customStyle={{ background: 'transparent', margin: 0, padding: '16px 16px 16px 0', fontSize: '14px' }}>
                    {currentCode}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: colors.border, backgroundColor: colors.bgCodeHeader }}>
            <div className="flex items-center gap-2">
              {runnable && (
                <>
                  {renderStdinToggle()}
                  <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium" style={{ color: colors.green }}>
                    {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill={colors.green} />}
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                </>
              )}
              <button onClick={handleEdit} className="p-1.5 transition-colors" style={{ color: isEditing ? '#f59e0b' : colors.textMuted }}><Edit3 size={14} /></button>
              {isEditing && <button onClick={handleReset} className="p-1.5" style={{ color: colors.textMuted }}><RotateCcw size={14} /></button>}
              <button onClick={handleCopy} className="p-1.5" style={{ color: colors.textMuted }}>{copied ? <Check size={14} style={{ color: colors.green }} /> : <Copy size={14} />}</button>
            </div>
            <span className="text-xs" style={{ color: colors.textMuted }}>{lines.length} lines</span>
          </div>
          {output !== null && (
            <div className="border-t px-4 py-3 max-h-[150px] overflow-auto" style={{ borderColor: colors.border, backgroundColor: colors.bg }}>
              <span className={`text-xs font-semibold uppercase tracking-wide ${hasError ? 'text-red-400' : ''}`} style={hasError ? {} : { color: colors.green }}>{hasError ? 'Error' : 'Output'}</span>
              <pre className={`text-sm font-mono whitespace-pre-wrap mt-1 ${hasError ? 'text-red-300' : ''}`} style={hasError ? {} : { color: colors.text }}>{output}</pre>
            </div>
          )}
        </div>
      </>
    );
  }

  return renderContent();
};

export default CodeBlock;
