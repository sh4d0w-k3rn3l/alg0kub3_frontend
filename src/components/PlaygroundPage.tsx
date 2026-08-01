'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import Editor from '@monaco-editor/react';
import {
  Play, Copy, Check, Loader2, RotateCcw, Terminal,
  Sun, Moon, Trash2, Clock, Code2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface LangMeta {
  label: string;
  syntax: string;
  icon: string;
  color: string;
}

const LANG_META: Record<string, LangMeta> = {
  python:     { label: 'Python',     syntax: 'python',     icon: '🐍', color: '#3572A5' },
  javascript: { label: 'JavaScript', syntax: 'javascript', icon: 'JS', color: '#f1e05a' },
  typescript: { label: 'TypeScript', syntax: 'typescript', icon: 'TS', color: '#3178c6' },
  java:       { label: 'Java',       syntax: 'java',       icon: '☕', color: '#b07219' },
  c:          { label: 'C',          syntax: 'c',          icon: 'C',  color: '#555555' },
  cpp:        { label: 'C++',        syntax: 'cpp',        icon: 'C+', color: '#f34b7d' },
  go:         { label: 'Go',         syntax: 'go',         icon: 'Go', color: '#00ADD8' },
  rust:       { label: 'Rust',       syntax: 'rust',       icon: '🦀', color: '#dea584' },
  ruby:       { label: 'Ruby',       syntax: 'ruby',       icon: '💎', color: '#701516' },
  php:        { label: 'PHP',        syntax: 'php',        icon: 'PH', color: '#4F5D95' },
  perl:       { label: 'Perl',       syntax: 'perl',       icon: 'Pl', color: '#0298c3' },
  bash:       { label: 'Bash',       syntax: 'bash',       icon: '$_', color: '#89e051' },
  sql:        { label: 'SQL',        syntax: 'sql',        icon: 'DB', color: '#e38c00' },
};

const TEMPLATES: Record<string, string> = {
  python: `# Python 3.11 — Try it out!
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num, end=" ")
print()`,
  javascript: `// JavaScript (Node.js 20)
const fibonacci = (n) => {
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i-1] + fib[i-2]);
  }
  return fib;
};

console.log(fibonacci(10).join(" "));`,
  typescript: `// TypeScript 5.0
interface Person {
  name: string;
  age: number;
}

const greet = (person: Person): string => {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
};

const alice: Person = { name: "Alice", age: 30 };
console.log(greet(alice));`,
  java: `public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Sum: " + sum);
        System.out.println("Average: " + (double) sum / nums.length);
    }
}`,
  c: `#include <stdio.h>

int main() {
    int n = 10;
    printf("Fibonacci sequence:\\n");
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        printf("%d ", a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    printf("\\n");
    return 0;
}`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {5, 2, 8, 1, 9, 3};
    std::sort(nums.begin(), nums.end());
    
    std::cout << "Sorted: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    messages := []string{"Hello", "from", "Go!"}
    for i, msg := range messages {
        fmt.Printf("%d: %s\\n", i, msg)
    }
}`,
  rust: `fn main() {
    let numbers: Vec<i32> = (1..=5).collect();
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Original: {:?}", numbers);
    println!("Doubled:  {:?}", doubled);
}`,
  ruby: `# Ruby 3.1
5.times do |i|
  stars = "*" * (i + 1)
  puts stars.center(9)
end
puts "Hello from Ruby!"`,
  php: `<?php
$fruits = ["apple", "banana", "cherry", "date"];
foreach ($fruits as $index => $fruit) {
    echo ($index + 1) . ". " . ucfirst($fruit) . "\\n";
}
echo "Total: " . count($fruits) . " fruits\\n";
?>`,
  perl: `use strict;
use warnings;

my @primes;
for my $n (2..30) {
    my $is_prime = 1;
    for my $d (2..int(sqrt($n))) {
        if ($n % $d == 0) { $is_prime = 0; last; }
    }
    push @primes, $n if $is_prime;
}
print "Primes up to 30: @primes\\n";`,
  bash: `#!/bin/bash
echo "System Info:"
echo "============"
echo "Date:     $(date)"
echo "Hostname: $(hostname)"
echo "User:     $(whoami)"
echo "Shell:    $SHELL"
echo "PWD:      $PWD"`,
  sql: `-- SQLite with sample tables: users, orders, products
-- Try your SQL queries here!

SELECT 
    u.name,
    COUNT(o.id) as total_orders,
    ROUND(SUM(o.amount), 2) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY total_spent DESC`,
};

const LANG_ORDER = ['python','javascript','typescript','java','c','cpp','go','rust','ruby','php','perl','bash','sql'];

interface MonacoEditorHandle {
  focus?: () => void;
}

const PlaygroundPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(TEMPLATES.python);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [running, setRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<MonacoEditorHandle | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  const [, setLangOpen] = useState(false);
  const meta = LANG_META[lang];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLang = useCallback((newLang: string) => {
    setLang(newLang);
    setCode(TEMPLATES[newLang] || '');
    setOutput(null);
    setExecTime(null);
    setStdin('');
    setShowStdin(false);
    setLangOpen(false);
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setIsError(false);
    const start = performance.now();
    try {
      const res = await api.post<{ stdout: string; stderr: string; exit_code: number }>(`/execute-code`, { code, language: lang, stdin });
      const { stdout, stderr, exit_code } = res.data;
      setExecTime(Math.round(performance.now() - start));
      if (stderr && exit_code !== 0) { setOutput(stderr); setIsError(true); }
      else if (stdout) { setOutput(stdout); setIsError(false); }
      else if (stderr) { setOutput(stderr); setIsError(true); }
      else { setOutput('Program executed successfully (no output).'); setIsError(false); }
    } catch (err: unknown) {
      setOutput(`Error: ${err instanceof ApiError ? err.detail : (err as Error)?.message || 'Error'}`);
      setIsError(true);
      setExecTime(Math.round(performance.now() - start));
    } finally { setRunning(false); }
  }, [code, lang, stdin]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(TEMPLATES[lang] || '');
    setOutput(null);
    setExecTime(null);
    setStdin('');
  };

  const bg = isDark ? '#0a0a0a' : '#fafafa';
  const surface = isDark ? '#111113' : '#ffffff';
  const headerBg = isDark ? '#0f0f11' : '#f5f5f5';
  const border = isDark ? '#1e1e22' : '#e2e2e5';
  const text = isDark ? '#e4e4e7' : '#18181b';
  const textSec = isDark ? '#a1a1aa' : '#71717a';
  const textMut = isDark ? '#52525b' : '#a1a1aa';
  const accent = '#22c55e';
  const editorBg = isDark ? '#0c0c0e' : '#ffffff';

  return (
    <div data-testid="playground-page" className="h-screen flex flex-col" style={{ backgroundColor: bg, color: text }}>
      <header className="flex items-center justify-between px-4 h-12 border-b flex-shrink-0" style={{ backgroundColor: headerBg, borderColor: border }}>
        <div className="flex items-center gap-3">
          <button data-testid="playground-home-btn" onClick={() => router.push('/')} className="flex items-center gap-2 font-extrabold text-sm tracking-tight" style={{ color: text }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: accent }}>
              <Terminal size={13} className="text-white" />
            </div>
            Algo<span style={{ color: accent }}>Kube</span>
          </button>
          <div className="w-px h-5" style={{ backgroundColor: border }} />
          <div className="flex items-center gap-1.5">
            <Code2 size={14} style={{ color: accent }} />
            <span className="text-sm font-semibold" style={{ color: text }}>Playground</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: textSec }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = border; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button data-testid="playground-run-btn" onClick={handleRun} disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            style={{ backgroundColor: accent, color: '#052e16' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!running) e.currentTarget.style.boxShadow = `0 0 16px ${accent}50`; }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = 'none'; }}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="#052e16" />}
            {running ? 'Running...' : 'Run'}
            {!running && <span className="text-[10px] opacity-60 ml-1 hidden sm:inline">Ctrl+Enter</span>}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-0.5 px-3 h-10 border-b overflow-x-auto flex-shrink-0 scrollbar-hide" style={{ backgroundColor: headerBg, borderColor: border }}>
        {LANG_ORDER.map(l => {
          const m = LANG_META[l];
          const active = l === lang;
          return (
            <button key={l} data-testid={`playground-lang-${l}`} onClick={() => switchLang(l)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                backgroundColor: active ? accent + '15' : 'transparent',
                color: active ? accent : textSec,
                borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { if (!active) e.currentTarget.style.backgroundColor = border + '60'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <span className="text-[10px] font-mono opacity-70">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 border-r" style={{ borderColor: border }}>
          <div className="flex items-center justify-between px-4 h-9 border-b flex-shrink-0" style={{ backgroundColor: surface, borderColor: border }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-xs font-semibold" style={{ color: textSec }}>
                {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button data-testid="playground-stdin-toggle" onClick={() => setShowStdin(!showStdin)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
                style={{ color: showStdin ? '#f59e0b' : textMut }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = text; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = showStdin ? '#f59e0b' : textMut; }}>
                <Terminal size={11} /> stdin
              </button>
              <button data-testid="playground-reset-btn" onClick={handleReset}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
                style={{ color: textMut }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = text; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = textMut; }}>
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>

          {showStdin && (
            <div className="px-4 py-2 border-b flex-shrink-0" style={{ borderColor: border, backgroundColor: isDark ? '#0e0e10' : '#f9f9fa' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Terminal size={10} style={{ color: '#f59e0b' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>Standard Input</span>
              </div>
              <textarea data-testid="playground-stdin" value={stdin} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStdin(e.target.value)}
                placeholder="Enter input here (one value per line)..."
                className="w-full bg-transparent text-xs font-mono outline-none resize-none rounded p-2 border"
                style={{ color: text, borderColor: border, minHeight: '36px', maxHeight: '72px' }}
                rows={2} />
            </div>
          )}

          <div className="flex-1 overflow-hidden" style={{ backgroundColor: editorBg }}>
            <Editor
              height="100%"
              language={meta.syntax}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme={isDark ? 'vs-dark' : 'vs'}
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                automaticLayout: true,
                tabSize: 4,
                readOnly: running,
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                scrollbar: { vertical: 'hidden', horizontal: 'auto' },
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 lg:max-w-[50%]" style={{ minHeight: '200px' }}>
          <div className="flex items-center justify-between px-4 h-9 border-b flex-shrink-0" style={{ backgroundColor: surface, borderColor: border }}>
            <div className="flex items-center gap-2">
              <Terminal size={13} style={{ color: output !== null ? (isError ? '#ef4444' : accent) : textMut }} />
              <span className="text-xs font-semibold" style={{ color: output !== null ? (isError ? '#ef4444' : accent) : textSec }}>
                {output === null ? 'Output' : (isError ? 'Error' : 'Output')}
              </span>
              {execTime !== null && (
                <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: textMut }}>
                  <Clock size={10} /> {execTime}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {output && (
                <>
                  <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors" style={{ color: textMut }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = text; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = textMut; }}>
                    {copied ? <Check size={11} style={{ color: accent }} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button data-testid="playground-clear-output" onClick={() => { setOutput(null); setExecTime(null); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors" style={{ color: textMut }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = text; }} onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = textMut; }}>
                    <Trash2 size={11} /> Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-[1.65]" style={{ backgroundColor: editorBg }}>
            {running && (
              <div className="flex items-center gap-2" style={{ color: textSec }}>
                <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                <span>Running {meta.label} code...</span>
              </div>
            )}
            {!running && output === null && (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: textMut }}>
                <Play size={32} style={{ opacity: 0.3 }} />
                <p className="text-sm text-center">
                  Click <strong style={{ color: accent }}>Run</strong> or press <kbd className="px-1.5 py-0.5 rounded text-xs border" style={{ borderColor: border, backgroundColor: surface }}>Ctrl+Enter</kbd> to execute
                </p>
                {lang === 'sql' && (
                  <p className="text-xs text-center mt-2 max-w-xs" style={{ color: textMut }}>
                    SQLite with sample tables: <strong>users</strong>, <strong>orders</strong>, <strong>products</strong>
                  </p>
                )}
              </div>
            )}
            {!running && output !== null && (
              <pre className={`whitespace-pre-wrap break-words ${isError ? 'text-red-400' : ''}`} style={isError ? {} : { color: text }}>
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between px-4 h-7 border-t flex-shrink-0 text-[10px]" style={{ backgroundColor: headerBg, borderColor: border, color: textMut }}>
        <div className="flex items-center gap-3">
          <span>{meta.label} {lang === 'sql' ? '(SQLite)' : ''}</span>
          <span>{code.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Free to use</span>
          <span>AlgoKube Playground</span>
        </div>
      </footer>
    </div>
  );
};

export default PlaygroundPage;
