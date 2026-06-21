'use client';
import React, { useEffect, useMemo, useState } from 'react';

import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

interface HeatmapDay {
  date: string;
  count: number;
}

interface HeatmapStats {
  total_year: number;
  current_streak: number;
  longest_streak: number;
  most_active_day: string | null;
  most_active_count: number;
}

interface HeatmapData {
  days: HeatmapDay[];
  stats: HeatmapStats;
}

interface TooltipData {
  date: string;
  count: number;
  x: number;
  y: number;
}

interface MonthLabel {
  month: string;
  weekIndex: number;
}

interface ActivityHeatmapProps {
  colors: Record<string, string>;
  isDark: boolean;
}

const ActivityHeatmap = ({ colors, isDark }: ActivityHeatmapProps) => {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const fetch = async () => {
      try {
        const res = await api.get<HeatmapData>('/progress/heatmap', {
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setData(res.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    };
    fetch();
    return () => ac.abort();
  }, []);

  const { weeks, monthLabels } = useMemo<{ weeks: (HeatmapDay | null)[][]; monthLabels: MonthLabel[] }>(() => {
    if (!data?.days?.length) return { weeks: [], monthLabels: [] };

    const days = data.days;
    const firstDate = new Date(days[0].date + 'T00:00:00');
    const startDow = firstDate.getDay();

    const padded: (HeatmapDay | null)[] = Array(startDow).fill(null).concat(days);

    const wks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      wks.push(padded.slice(i, i + 7));
    }
    const last = wks[wks.length - 1];
    while (last.length < 7) last.push(null);

    const labels: MonthLabel[] = [];
    let lastMonth = -1;
    wks.forEach((week, wi) => {
      for (const d of week) {
        if (!d) continue;
        const m = parseInt(d.date.slice(5, 7), 10) - 1;
        if (m !== lastMonth) {
          labels.push({ month: MONTHS[m], weekIndex: wi });
          lastMonth = m;
        }
        break;
      }
    });

    return { weeks: wks, monthLabels: labels };
  }, [data]);

  if (!data?.days) return null;

  const { stats } = data;
  const maxCount = Math.max(...(data.days.map(d => d.count)), 1);

  const getColor = (count: number): string => {
    if (count === 0) return isDark ? '#161b22' : '#ebedf0';
    const ratio = count / maxCount;
    if (isDark) {
      if (ratio <= 0.25) return '#0e4429';
      if (ratio <= 0.5) return '#006d32';
      if (ratio <= 0.75) return '#26a641';
      return '#39d353';
    }
    if (ratio <= 0.25) return '#9be9a8';
    if (ratio <= 0.5) return '#40c463';
    if (ratio <= 0.75) return '#30a14e';
    return '#216e39';
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      data-testid="activity-heatmap"
      className="border rounded-xl p-5 mb-8"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar size={15} style={{ color: colors.green }} />
          <span className="text-sm font-bold" style={{ color: colors.text }}>
            {stats.total_year} lessons in the last year
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: colors.textMuted }}>
          Less
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
            <div
              key={i}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: getColor(Math.ceil(r * maxCount)) }}
            />
          ))}
          More
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ display: 'inline-block', minWidth: 'fit-content' }}>
          <div style={{ display: 'flex', paddingLeft: '28px', marginBottom: '4px' }}>
            {weeks.map((week, wi) => {
              const label = monthLabels.find(ml => ml.weekIndex === wi);
              return (
                <div key={wi} style={{ width: '13px', flexShrink: 0, fontSize: '10px', color: colors.textMuted }}>
                  {label ? label.month : ''}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '24px', flexShrink: 0, marginRight: '2px' }}>
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    height: '11px', marginBottom: '2px', fontSize: '9px',
                    color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '2px',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '2px' }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      data-testid={day ? `heatmap-cell-${day.date}` : undefined}
                      style={{
                        width: '11px', height: '11px', borderRadius: '2px',
                        backgroundColor: day ? getColor(day.count) : 'transparent',
                        outline: tooltip?.date === day?.date ? `1px solid ${colors.text}` : 'none',
                        cursor: day ? 'default' : 'auto',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (!day) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-[11px] font-medium pointer-events-none shadow-lg"
          style={{
            left: tooltip.x - 40,
            top: tooltip.y - 36,
            backgroundColor: isDark ? '#1c1c1c' : '#24292f',
            color: '#fff',
            border: `1px solid ${isDark ? '#333' : '#444'}`,
          }}
        >
          {tooltip.count === 0
            ? `No activity on ${formatDate(tooltip.date)}`
            : `${tooltip.count} lesson${tooltip.count > 1 ? 's' : ''} on ${formatDate(tooltip.date)}`}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-1.5" data-testid="heatmap-current-streak">
          <Flame size={14} style={{ color: stats.current_streak > 0 ? '#f97316' : colors.textMuted }} />
          <span className="text-sm font-bold" style={{ color: colors.text }}>{stats.current_streak}</span>
          <span className="text-xs" style={{ color: colors.textMuted }}>day streak</span>
        </div>
        <div className="flex items-center gap-1.5" data-testid="heatmap-longest-streak">
          <Trophy size={14} style={{ color: stats.longest_streak > 0 ? '#eab308' : colors.textMuted }} />
          <span className="text-sm font-bold" style={{ color: colors.text }}>{stats.longest_streak}</span>
          <span className="text-xs" style={{ color: colors.textMuted }}>longest streak</span>
        </div>
        {stats.most_active_day && stats.most_active_count > 0 && (
          <div className="flex items-center gap-1.5" data-testid="heatmap-most-active">
            <TrendingUp size={14} style={{ color: colors.green }} />
            <span className="text-sm font-bold" style={{ color: colors.text }}>{stats.most_active_count}</span>
            <span className="text-xs" style={{ color: colors.textMuted }}>
              lessons on {formatDate(stats.most_active_day)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
