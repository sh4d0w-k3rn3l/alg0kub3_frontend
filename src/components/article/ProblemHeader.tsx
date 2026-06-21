'use client';
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { ExternalLink, Tag, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface DiffColor {
  fg: string;
  bg: string;
  border: string;
}

const DIFF_COLOR: Record<string, DiffColor> = {
  easy:   { fg: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  medium: { fg: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  hard:   { fg: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
};

interface ProblemHeaderProps {
  title?: string;
  difficulty?: string;
  leetcode_url?: string;
  topics?: string[];
  companies?: string[];
  isDark?: boolean;
}

const ProblemHeader = ({ title, difficulty = 'easy', leetcode_url, topics = [], companies = [], isDark = true }: ProblemHeaderProps) => {
  const [openTopics, setOpenTopics] = useState<boolean>(false);
  const [openCompanies, setOpenCompanies] = useState<boolean>(false);
  const d: DiffColor = DIFF_COLOR[difficulty] || DIFF_COLOR.easy;

  const chip = (icon: ReactNode, label: string, count: number, open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, items: string[], accent: string) => (
    <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <button
        onClick={() => setOpen(v => !v)}
        data-testid={`problem-${label.toLowerCase()}-toggle`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          color: isDark ? '#cbd5e1' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {icon}
        <span>{label}</span>
        {count > 0 && (
          <span style={{ fontSize: 11, padding: '1px 6px', background: accent, color: '#fff', borderRadius: 999 }}>{count}</span>
        )}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && items.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {items.map((x) => (
            <span
              key={x}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${accent}40`,
                color: isDark ? '#e5e5e5' : '#1f2937',
              }}
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        padding: '20px 22px',
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 16, marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: isDark ? '#ecfdf5' : '#0f172a' }}>
          {title}
        </h2>
        {leetcode_url && (
          <a
            href={leetcode_url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="problem-leetcode-link"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#22c55e',
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
              textDecoration: 'none',
            }}
          >
            View on LeetCode <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 10 }}>
        <span
          data-testid={`problem-difficulty-${difficulty}`}
          style={{
            padding: '6px 14px', borderRadius: 999,
            background: d.bg, color: d.fg, border: `1px solid ${d.border}`,
            fontSize: 12, fontWeight: 700, textTransform: 'lowercase',
          }}
        >
          {difficulty}
        </span>
        {topics.length > 0 && chip(<Tag size={12} />, 'Topics', topics.length, openTopics, setOpenTopics, topics, '#3b82f6')}
        {companies.length > 0 && chip(<Building2 size={12} />, 'Companies', companies.length, openCompanies, setOpenCompanies, companies, '#a855f7')}
      </div>
    </div>
  );
};

export default ProblemHeader;
