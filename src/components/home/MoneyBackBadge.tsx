'use client';
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const STYLE_ID = 'money-back-badge-styles';
const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes badge-shimmer {
      0%   { left: -80%; }
      100% { left: 180%; }
    }
    @keyframes badge-pulse-ring {
      0%   { transform: scale(1); opacity: 0.4; }
      50%  { transform: scale(1.15); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
};

/**
 * MoneyBackBadge — 7-day money-back guarantee trust badge.
 *
 * Props:
 *   variant  — 'inline' (hero row) | 'card' (pricing block)
 *   className — extra tailwind classes
 */
const MoneyBackBadge = ({ variant = 'inline', className = '' }) => {
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState<boolean>(false);

  React.useEffect(() => { injectStyles(); }, []);

  /* ── Colors ── */
  const accent     = isDark ? '#22c55e' : '#16a34a';
  const accentSoft = isDark ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.08)';
  const accentGlow = isDark ? 'rgba(34,197,94,0.25)' : 'rgba(22,163,74,0.15)';
  const textPri    = isDark ? '#e6edf3' : '#1f2937';
  const textSec    = isDark ? '#8b949e' : '#6b7280';
  const border     = isDark ? 'rgba(48,54,61,0.7)' : 'rgba(228,228,231,0.9)';
  const bg         = isDark
    ? 'linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,17,23,0.95))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(250,252,250,0.98))';

  if (variant === 'card') {
    return (
      <div
        data-testid="money-back-badge-card"
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px',
          borderRadius: 14,
          background: bg,
          border: `1px solid ${border}`,
          backdropFilter: 'blur(12px)',
          boxShadow: hovered
            ? `0 0 20px ${accentGlow}, 0 4px 16px rgba(0,0,0,${isDark ? 0.3 : 0.08})`
            : `0 2px 8px rgba(0,0,0,${isDark ? 0.2 : 0.04})`,
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          transform: hovered ? 'translateY(-1px)' : 'none',
          cursor: 'default',
        }}
      >
        {/* Shield icon with pulse */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${accent}`,
            animation: hovered ? 'badge-pulse-ring 1.5s ease-out infinite' : 'none',
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent}, ${isDark ? '#10b981' : '#22c55e'})`,
            boxShadow: `0 4px 12px ${accentGlow}`,
          }}>
            <ShieldCheck size={22} color="#fff" strokeWidth={2.4} />
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: textPri,
            lineHeight: 1.3, marginBottom: 2,
          }}>
            7-Day Money-Back Guarantee
          </div>
          <div style={{
            fontSize: 12, color: textSec, lineHeight: 1.4,
          }}>
            Try risk-free. Not satisfied? Get a full refund, no questions asked.
          </div>
        </div>

        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          borderRadius: 14, pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: 0, width: '40%', height: '100%',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,${isDark ? 0.04 : 0.08}), transparent)`,
            animation: hovered ? 'badge-shimmer 2s ease-in-out infinite' : 'none',
            transform: 'skewX(-12deg)',
          }} />
        </div>
      </div>
    );
  }

  /* ── variant === 'inline' (compact row for hero) ── */
  return (
    <div
      data-testid="money-back-badge-inline"
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        borderRadius: 10,
        background: accentSoft,
        border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : 'rgba(22,163,74,0.15)'}`,
        transition: 'all 0.3s ease',
        boxShadow: hovered ? `0 0 16px ${accentGlow}` : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${accent}, ${isDark ? '#10b981' : '#22c55e'})`,
        boxShadow: `0 2px 6px ${accentGlow}`,
      }}>
        <ShieldCheck size={15} color="#fff" strokeWidth={2.5} />
      </div>
      <div>
        <span style={{
          fontSize: 12, fontWeight: 700, color: accent,
          letterSpacing: '0.01em',
        }}>
          7-Day Money-Back Guarantee
        </span>
        <span style={{
          fontSize: 11, color: textSec,
          marginLeft: 6,
        }}>
          Risk-free trial
        </span>
      </div>

      {/* Shimmer */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        borderRadius: 10, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, width: '30%', height: '100%',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${isDark ? 0.04 : 0.06}), transparent)`,
          animation: hovered ? 'badge-shimmer 2s ease-in-out infinite' : 'none',
          transform: 'skewX(-12deg)',
        }} />
      </div>
    </div>
  );
};

export default MoneyBackBadge;
