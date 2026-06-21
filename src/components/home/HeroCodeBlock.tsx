'use client';
import { useState, useEffect } from 'react';

const dk = {
  bg: '#050505', surface: '#0a0a0a', border: '#1a1a1a', borderSubtle: '#111',
  text: '#f0f0f0', textSec: '#a0a0a0', textMut: '#555',
  primary: '#22c55e', glow: 'rgba(34,197,94,0.08)',
};

const CODE_LINES = [
  { text: 'from algokube import learn', color: '#a855f7' },
  { text: '', color: '' },
  { text: 'path = learn.create_path(', color: '#e4e4e7' },
  { text: '    goal="backend_engineer",', color: '#22c55e' },
  { text: '    level="intermediate"', color: '#22c55e' },
  { text: ')', color: '#e4e4e7' },
  { text: '', color: '' },
  { text: 'path.start()  # 268 lessons ready', color: '#71717a' },
];

const HeroCodeBlock = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), 320);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  const d = dk;

  return (
    <div
      className="rounded-xl border overflow-hidden font-mono text-[13px] leading-relaxed"
      style={{
        backgroundColor: d.surface,
        borderColor: d.border,
        boxShadow: `0 0 60px ${d.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: d.borderSubtle }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
        <span className="ml-3 text-[11px]" style={{ color: d.textMut }}>main.py</span>
      </div>
      <div className="p-5 min-h-[220px]">
        {CODE_LINES.map((line, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              opacity: i < visibleLines ? 1 : 0,
              transform: i < visibleLines ? 'translateX(0)' : 'translateX(8px)',
              color: line.color || d.textSec,
              height: line.text === '' ? '20px' : 'auto',
            }}
          >
            {line.text}
          </div>
        ))}
        <span
          className="inline-block w-[8px] h-[18px] mt-1"
          style={{
            backgroundColor: d.primary,
            animation: 'blink 1s step-end infinite',
          }}
        />
      </div>
    </div>
  );
};

export default HeroCodeBlock;
