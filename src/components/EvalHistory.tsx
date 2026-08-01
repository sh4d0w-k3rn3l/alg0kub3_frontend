'use client';

import React, { useState } from 'react';
import { History, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';

interface SchemaSnapshot {
  storages?: { key: string; name: string; tag: string; tables?: { name: string; columns?: { name: string }[]; indexes?: { name: string }[] }[]; collections?: { name: string }[]; patterns?: unknown[]; topics?: { name: string }[]; indices?: { name: string }[] }[];
}

interface FeedbackCategory {
  name: string;
  severity: 'good' | 'warning' | 'critical';
}

interface Feedback {
  categories?: FeedbackCategory[];
  overall_summary?: string;
}

interface HistoryEntry {
  attempt: number;
  score: number;
  timestamp: string;
  schema_snapshot?: SchemaSnapshot;
  feedback?: Feedback;
}

interface DiffEntry {
  type: 'added' | 'removed';
  category: string;
  detail: string;
}

interface CategoryDiff {
  category: string;
  from: string;
  to: string;
  improved: boolean;
}

interface EvalHistoryProps {
  history?: HistoryEntry[];
}

const SCORE_COLOR = (s: number) => s >= 7 ? '#22c55e' : s >= 5 ? '#f59e0b' : '#ef4444';
const SEV_LABEL: Record<string, string> = { good: 'Good', warning: 'Warning', critical: 'Critical' };
const SEV_COLOR: Record<string, string> = { good: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

function computeDiff(prev?: SchemaSnapshot, curr?: SchemaSnapshot): DiffEntry[] {
  if (!prev || !curr) return [];
  const changes: DiffEntry[] = [];
  const prevStorages = prev.storages || [];
  const currStorages = curr.storages || [];

  const prevKeys = new Set(prevStorages.map(s => s.key));
  const currKeys = new Set(currStorages.map(s => s.key));

  currStorages.filter(s => !prevKeys.has(s.key)).forEach(s => {
    changes.push({ type: 'added', category: 'Storage', detail: `Added ${s.name} (${s.tag})` });
  });

  prevStorages.filter(s => !currKeys.has(s.key)).forEach(s => {
    changes.push({ type: 'removed', category: 'Storage', detail: `Removed ${s.name} (${s.tag})` });
  });

  currStorages.filter(s => prevKeys.has(s.key)).forEach(curr_s => {
    const prev_s = prevStorages.find(p => p.key === curr_s.key);
    if (!prev_s) return;

    if (curr_s.key === 'postgresql') {
      const prevTables = (prev_s.tables || []).map(t => t.name);
      const currTables = (curr_s.tables || []).map(t => t.name);
      currTables.filter(t => !prevTables.includes(t)).forEach(t => {
        changes.push({ type: 'added', category: curr_s.name, detail: `Added table "${t}"` });
      });
      prevTables.filter(t => !currTables.includes(t)).forEach(t => {
        changes.push({ type: 'removed', category: curr_s.name, detail: `Removed table "${t}"` });
      });
      (curr_s.tables || []).forEach(ct => {
        const pt = (prev_s.tables || []).find(t => t.name === ct.name);
        if (!pt) return;
        const prevCols = (pt.columns || []).map(c => c.name).filter(Boolean);
        const currCols = (ct.columns || []).map(c => c.name).filter(Boolean);
        currCols.filter(c => !prevCols.includes(c)).forEach(c => {
          changes.push({ type: 'added', category: `${curr_s.name} → ${ct.name}`, detail: `Added column "${c}"` });
        });
        prevCols.filter(c => !currCols.includes(c)).forEach(c => {
          changes.push({ type: 'removed', category: `${curr_s.name} → ${ct.name}`, detail: `Removed column "${c}"` });
        });
        const prevIdx = (pt.indexes || []).map(i => i.name).filter(Boolean);
        const currIdx = (ct.indexes || []).map(i => i.name).filter(Boolean);
        currIdx.filter(i => !prevIdx.includes(i)).forEach(i => {
          changes.push({ type: 'added', category: `${curr_s.name} → ${ct.name}`, detail: `Added index "${i}"` });
        });
      });
    }

    if (['mongodb', 'cassandra'].includes(curr_s.key)) {
      const prevColls = (prev_s.collections || []).map(c => c.name);
      const currColls = (curr_s.collections || []).map(c => c.name);
      currColls.filter(c => !prevColls.includes(c)).forEach(c => {
        changes.push({ type: 'added', category: curr_s.name, detail: `Added collection "${c}"` });
      });
    }

    if (['redis', 'memcache'].includes(curr_s.key)) {
      const prevP = (prev_s.patterns || []).length;
      const currP = (curr_s.patterns || []).length;
      if (currP > prevP) changes.push({ type: 'added', category: curr_s.name, detail: `Added ${currP - prevP} key pattern(s)` });
    }

    if (curr_s.key === 'kafka') {
      const prevT = (prev_s.topics || []).map(t => t.name);
      const currT = (curr_s.topics || []).map(t => t.name);
      currT.filter(t => !prevT.includes(t)).forEach(t => {
        changes.push({ type: 'added', category: curr_s.name, detail: `Added topic "${t}"` });
      });
    }

    if (curr_s.key === 'elasticsearch') {
      const prevI = (prev_s.indices || []).map(i => i.name);
      const currI = (curr_s.indices || []).map(i => i.name);
      currI.filter(i => !prevI.includes(i)).forEach(i => {
        changes.push({ type: 'added', category: curr_s.name, detail: `Added index "${i}"` });
      });
    }

    if (curr_s.key === 'dynamodb') {
      const prevT = (prev_s.tables || []).map(t => t.name);
      const currT = (curr_s.tables || []).map(t => t.name);
      currT.filter(t => !prevT.includes(t)).forEach(t => {
        changes.push({ type: 'added', category: curr_s.name, detail: `Added table "${t}"` });
      });
    }
  });

  return changes;
}

function computeCategoryDiff(prevFeedback?: Feedback, currFeedback?: Feedback): CategoryDiff[] {
  if (!prevFeedback?.categories || !currFeedback?.categories) return [];
  const diffs: CategoryDiff[] = [];
  const prevCats = prevFeedback.categories || [];
  const currCats = currFeedback.categories || [];

  currCats.forEach(cc => {
    const pc = prevCats.find(p => p.name === cc.name);
    if (!pc) return;
    if (pc.severity !== cc.severity) {
      const improved = (pc.severity === 'critical' && cc.severity !== 'critical') ||
                       (pc.severity === 'warning' && cc.severity === 'good');
      diffs.push({
        category: cc.name,
        from: pc.severity,
        to: cc.severity,
        improved,
      });
    }
  });

  return diffs;
}

const EvalHistory: React.FC<EvalHistoryProps> = ({ history }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!history || history.length < 1) return null;

  const scoreTrend = history.length >= 2
    ? history[history.length - 1].score - history[history.length - 2].score
    : 0;

  return (
    <div data-testid="eval-history" className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <History size={14} className="text-[#8b949e]" />
        <span className="text-sm font-semibold text-white">Evaluation History</span>
        <span className="text-[10px] text-[#484f58]">({history.length} attempt{history.length > 1 ? 's' : ''})</span>
      </div>

      <div className="flex items-end gap-1 mb-4 px-1" data-testid="eval-score-trend">
        {history.map((h, i) => {
          const height = Math.max(8, (h.score / 10) * 48);
          const color = SCORE_COLOR(h.score);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-[9px] font-bold" style={{ color }}>{h.score}</span>
              <div className="w-full rounded-sm transition-all cursor-pointer hover:opacity-80"
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ height: `${height}px`, backgroundColor: color, minWidth: '12px', maxWidth: '32px', margin: '0 auto' }}
                title={`Attempt ${h.attempt} — Score: ${h.score}/10`} />
              <span className="text-[8px] text-[#484f58]">#{h.attempt}</span>
            </div>
          );
        })}
        {history.length >= 2 && (
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {scoreTrend > 0 ? <ArrowUp size={12} className="text-[#22c55e]" /> :
             scoreTrend < 0 ? <ArrowDown size={12} className="text-[#ef4444]" /> :
             <Minus size={12} className="text-[#8b949e]" />}
            <span className="text-[10px] font-bold" style={{ color: scoreTrend > 0 ? '#22c55e' : scoreTrend < 0 ? '#ef4444' : '#8b949e' }}>
              {scoreTrend > 0 ? '+' : ''}{scoreTrend}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {history.map((h, i) => {
          const isExpanded = expanded === i;
          const prevH = i > 0 ? history[i - 1] : null;
          const schemaDiff = prevH ? computeDiff(prevH.schema_snapshot, h.schema_snapshot) : [];
          const catDiff = prevH ? computeCategoryDiff(prevH.feedback, h.feedback) : [];
          const scoreChange = prevH ? h.score - prevH.score : 0;
          const resolvedCount = catDiff.filter(d => d.improved).length;

          return (
            <div key={i} data-testid={`eval-history-${i}`} className="rounded-lg border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <button onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#1c2128] transition-colors">
                {isExpanded ? <ChevronDown size={10} className="text-[#484f58]" /> : <ChevronRight size={10} className="text-[#484f58]" />}
                <span className="text-xs font-medium text-[#c9d1d9]">Attempt #{h.attempt}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: SCORE_COLOR(h.score), backgroundColor: `${SCORE_COLOR(h.score)}15` }}>
                  {h.score}/10
                </span>
                {scoreChange !== 0 && (
                  <span className="text-[9px] font-bold" style={{ color: scoreChange > 0 ? '#22c55e' : '#ef4444' }}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange}
                  </span>
                )}
                {resolvedCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] font-medium">
                    {resolvedCount} improved
                  </span>
                )}
                <span className="text-[9px] text-[#484f58] ml-auto">
                  {h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[#2d333b] px-3 py-2.5 space-y-3">
                  {schemaDiff.length > 0 && (
                    <div>
                      <h6 className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Schema Changes</h6>
                      <div className="space-y-1">
                        {schemaDiff.map((d, di) => (
                          <div key={di} className="flex items-center gap-2 text-[11px]">
                            <span className={`px-1 rounded text-[9px] font-bold ${d.type === 'added' ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
                              {d.type === 'added' ? '+' : '-'}
                            </span>
                            <span className="text-[#8b949e]">{d.category}:</span>
                            <span className="text-[#c9d1d9]">{d.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {catDiff.length > 0 && (
                    <div>
                      <h6 className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">Category Changes</h6>
                      <div className="space-y-1">
                        {catDiff.map((d, di) => (
                          <div key={di} className="flex items-center gap-2 text-[11px]">
                            {d.improved ? <TrendingUp size={10} className="text-[#22c55e]" /> : <ArrowDown size={10} className="text-[#ef4444]" />}
                            <span className="text-[#c9d1d9] font-medium">{d.category}:</span>
                            <span className="px-1 rounded text-[9px] font-bold" style={{ color: SEV_COLOR[d.from], backgroundColor: `${SEV_COLOR[d.from]}15` }}>{SEV_LABEL[d.from]}</span>
                            <span className="text-[#484f58]">&rarr;</span>
                            <span className="px-1 rounded text-[9px] font-bold" style={{ color: SEV_COLOR[d.to], backgroundColor: `${SEV_COLOR[d.to]}15` }}>{SEV_LABEL[d.to]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {h.feedback?.overall_summary && (
                    <p className="text-[11px] text-[#8b949e] leading-relaxed">{h.feedback.overall_summary}</p>
                  )}

                  {i === 0 && schemaDiff.length === 0 && (
                    <p className="text-[10px] text-[#484f58] italic">First evaluation — no previous attempt to compare against.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvalHistory;
