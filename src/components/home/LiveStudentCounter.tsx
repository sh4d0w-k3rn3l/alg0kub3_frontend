'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const STYLE_ID = 'live-counter-styles';
const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes live-pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
      50%      { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
    }
    @keyframes counter-tick {
      0%   { transform: translateY(0); opacity: 1; }
      40%  { transform: translateY(-4px); opacity: 0.6; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(s);
};

const LiveStudentCounter = () => {
  const { isDark } = useTheme();
  const [config, setConfig] = useState<{ enabled?: boolean; base_count?: number; min_count?: number; label?: string; drift_range?: number } | null>(null);
  const [count, setCount] = useState<number>(0);
  const [ticked, setTicked] = useState<boolean>(false);
  const target = useRef(0);
  const actual = useRef(0);
  const prevCount = useRef(0);

  useEffect(() => { injectStyles(); }, []);

  /* Fetch config from API */
  useEffect(() => {
    fetch(`${API}/api/homepage-settings/live-counter`)
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        const base = data.base_count || 127;
        target.current = base;
        actual.current = base;
        setCount(base);
      })
      .catch(() => {
        /* Fallback defaults */
        setConfig({ enabled: true, base_count: 127, min_count: 40, label: 'learning now', drift_range: 5 });
        target.current = 127;
        actual.current = 127;
        setCount(127);
      });
  }, []);

  /* Drift simulation */
  useEffect(() => {
    if (!config || !config.enabled) return;

    const minCount = config.min_count || 40;
    const driftRange = config.drift_range || 5;

    const drift = setInterval(() => {
      const delta = Math.floor(Math.random() * (driftRange + 4)) - 3;
      target.current = Math.max(minCount, target.current + delta);
    }, 4000 + Math.random() * 3000);

    const tick = setInterval(() => {
      if (actual.current < target.current) {
        actual.current += 1;
        setCount(actual.current);
      } else if (actual.current > target.current) {
        actual.current -= 1;
        setCount(actual.current);
      }
    }, 800);

    return () => { clearInterval(drift); clearInterval(tick); };
  }, [config]);

  /* Tick animation */
  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      setTicked(true);
      const t = setTimeout(() => setTicked(false), 400);
      return () => clearTimeout(t);
    }
  }, [count]);

  if (!config || !config.enabled) return null;

  const green = isDark ? '#22c55e' : '#16a34a';
  const textSec = isDark ? '#8b949e' : '#6b7280';
  const bg = isDark ? 'rgba(34,197,94,0.06)' : 'rgba(22,163,74,0.05)';
  const border = isDark ? 'rgba(34,197,94,0.18)' : 'rgba(22,163,74,0.15)';

  return (
    <span
      data-testid="live-student-counter"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ background: bg, border: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", cursor: 'default' }}
    >
      <span
        data-testid="live-pulse-dot"
        style={{
          width: 7, height: 7, borderRadius: '50%',
          backgroundColor: green,
          animation: 'live-pulse 2s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      <span style={{ color: green, display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
        <span
          data-testid="live-counter-number"
          style={{
            display: 'inline-block', fontVariantNumeric: 'tabular-nums',
            animation: ticked ? 'counter-tick 0.35s ease-out' : 'none',
            minWidth: '2ch', textAlign: 'right',
          }}
        >
          {count}
        </span>
        <span style={{ color: textSec }}>{config.label || 'learning now'}</span>
      </span>
    </span>
  );
};

export default LiveStudentCounter;
