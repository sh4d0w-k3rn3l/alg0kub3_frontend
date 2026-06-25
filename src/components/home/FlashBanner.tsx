'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { X, ChevronUp, Zap, ArrowRight } from 'lucide-react';
const STORAGE_KEY = 'flash_banner_state';

const STYLE_ID = 'flash-banner-styles';
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes flash-pulse {
      0%,100% { opacity:1; box-shadow: 0 0 0 0 var(--flash-color-50); }
      50%     { opacity:.65; box-shadow: 0 0 0 5px transparent; }
    }
    @keyframes flash-slide-down {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes flash-slide-up {
      from { transform: translateY(0); opacity: 1; }
      to   { transform: translateY(-100%); opacity: 0; }
    }
    @keyframes flash-pill-in {
      from { transform: translateY(-20px) scale(0.9); opacity: 0; }
      to   { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes flash-shimmer {
      0%   { left: -30%; }
      100% { left: 130%; }
    }
  `;
  document.head.appendChild(s);
};

const useCountdown = (endDate: string | null | undefined) => {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0, expired: true });

  useEffect(() => {
    if (!endDate) { setRemaining({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }

    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return { d, h, m, s, expired: false };
    };

    setRemaining(calc());
    const iv = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(iv);
  }, [endDate]);

  return remaining;
};

const pad = (n: number) => String(n).padStart(2, '0');

const FlashBanner = () => {
  const navigate = useRouter();
  const { isDark } = useTheme();
  const [config, setConfig] = useState<any>(null);
  const [mode, setMode] = useState('full'); // 'full' | 'pill' | 'dismissed'
  const countdown = useCountdown(config?.end_date);

  useEffect(() => { injectStyles(); }, []);

  /* Restore session state */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dismissed) setMode('dismissed');
        else if (parsed.minimized) setMode('pill');
      }
    } catch {}
  }, []);

  /* Fetch config */
  useEffect(() => {
    const ac = new AbortController();
    api.get<any>('/homepage-settings/flash-banner', { signal: ac.signal })
      .then(res => { if (!ac.signal.aborted) setConfig(res.data); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const persist = useCallback((state: Record<string, boolean>) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, []);

  const minimize = () => { setMode('pill'); persist({ minimized: true }); };
  const dismiss = () => { setMode('dismissed'); persist({ dismissed: true }); };
  const expand = () => { setMode('full'); persist({}); };

  /* Don't render if disabled, no config, or timer expired */
  if (!config || !config.enabled || mode === 'dismissed') return null;
  if (countdown.expired && config.end_date) return null;

  const accent = config.accent_color || '#f59e0b';
  const hasCountdown = config.end_date && !countdown.expired;

  /* ── Minimized floating pill ── */
  if (mode === 'pill') {
    return (
      <div
        data-testid="flash-banner-pill"
        onClick={expand}
        className="fixed z-50 cursor-pointer"
        style={{
          top: 12, left: '50%', transform: 'translateX(-50%)',
          animation: 'flash-pill-in 0.3s ease-out',
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
              : `linear-gradient(135deg, ${accent}12, ${accent}06)`,
            border: `1px solid ${accent}30`,
            backdropFilter: 'blur(12px)',
            color: accent,
            boxShadow: isDark
              ? `0 4px 20px ${accent}15, 0 0 0 1px ${accent}10`
              : `0 4px 16px ${accent}10`,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', backgroundColor: accent,
            animation: 'flash-pulse 2s ease-in-out infinite',
            '--flash-color-50': `${accent}50`,
          } as React.CSSProperties & { '--flash-color-50': string }} />
          <Zap size={12} />
          <span>{config.title}</span>
          {hasCountdown && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
            </span>
          )}
          <ChevronUp size={12} style={{ transform: 'rotate(180deg)' }} />
        </div>
      </div>
    );
  }

  /* ── Full banner ── */
  return (
    <div
      data-testid="flash-banner"
      className="relative w-full overflow-hidden"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${accent}10 0%, rgba(13,17,23,0.98) 40%, rgba(13,17,23,0.98) 60%, ${accent}10 100%)`
          : `linear-gradient(135deg, ${accent}08 0%, rgba(255,255,255,0.98) 40%, rgba(255,255,255,0.98) 60%, ${accent}08 100%)`,
        borderBottom: `1px solid ${isDark ? accent + '18' : accent + '15'}`,
        animation: 'flash-slide-down 0.4s ease-out',
      }}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: 0, width: '20%', height: '100%',
          background: `linear-gradient(90deg, transparent, ${accent}08, transparent)`,
          animation: 'flash-shimmer 6s ease-in-out infinite',
          transform: 'skewX(-12deg)',
        }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        {/* Live dot + title */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span
            data-testid="flash-live-dot"
            className="shrink-0"
            style={{
              width: 7, height: 7, borderRadius: '50%', backgroundColor: accent,
              animation: 'flash-pulse 2s ease-in-out infinite',
              '--flash-color-50': `${accent}50`,
            } as React.CSSProperties & { '--flash-color-50': string }}
          />
          <Zap size={14} style={{ color: accent }} className="shrink-0 hidden sm:block" />
          <span
            className="text-xs sm:text-sm font-bold tracking-tight"
            style={{ color: isDark ? '#e6edf3' : '#1f2937' }}
          >
            {config.title}
          </span>
          {config.subtitle && (
            <span
              className="text-xs hidden sm:inline"
              style={{ color: isDark ? '#8b949e' : '#6b7280' }}
            >
              — {config.subtitle}
            </span>
          )}
        </div>

        {/* Countdown */}
        {hasCountdown && (
          <div
            data-testid="flash-countdown"
            className="flex items-center gap-1 sm:gap-1.5"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {[
              { val: countdown.d, lbl: 'd' },
              { val: countdown.h, lbl: 'h' },
              { val: countdown.m, lbl: 'm' },
              { val: countdown.s, lbl: 's' },
            ].map((u, i) => (
              <React.Fragment key={u.lbl}>
                {i > 0 && <span className="text-[10px] font-bold" style={{ color: isDark ? '#484f58' : '#d1d5db' }}>:</span>}
                <div
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    color: accent,
                    minWidth: 32, justifyContent: 'center',
                  }}
                >
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pad(u.val)}</span>
                  <span className="text-[9px] font-semibold" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>{u.lbl}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* CTA link */}
        {config.link_url && config.link_text && (
          <button
            data-testid="flash-cta-btn"
            onClick={() => navigate.push(config.link_url)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:gap-2"
            style={{
              backgroundColor: accent,
              color: '#fff',
              boxShadow: `0 2px 8px ${accent}30`,
            }}
          >
            {config.link_text}
            <ArrowRight size={12} />
          </button>
        )}

        {/* Minimize + Dismiss */}
        <div className="flex items-center gap-1 ml-1">
          <button
            data-testid="flash-minimize-btn"
            onClick={minimize}
            className="p-1 rounded-md transition-colors"
            style={{ color: isDark ? '#484f58' : '#d1d5db' }}
            onMouseEnter={e => e.currentTarget.style.color = isDark ? '#8b949e' : '#6b7280'}
            onMouseLeave={e => e.currentTarget.style.color = isDark ? '#484f58' : '#d1d5db'}
            aria-label="Minimize banner"
          >
            <ChevronUp size={14} />
          </button>
          <button
            data-testid="flash-dismiss-btn"
            onClick={dismiss}
            className="p-1 rounded-md transition-colors"
            style={{ color: isDark ? '#484f58' : '#d1d5db' }}
            onMouseEnter={e => e.currentTarget.style.color = isDark ? '#8b949e' : '#6b7280'}
            onMouseLeave={e => e.currentTarget.style.color = isDark ? '#484f58' : '#d1d5db'}
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashBanner;
