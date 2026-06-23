'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { ArrowLeft, Flame, Loader2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

const HeatCell = ({ value, maxVal }: { value: number; maxVal: number }) => {
  const intensity = maxVal > 0 ? Math.min(value / maxVal, 1) : 0;
  let bg, text;
  if (intensity >= 0.7) { bg = '#22c55e'; text = '#ffffff'; }
  else if (intensity >= 0.4) { bg = '#f59e0b'; text = '#ffffff'; }
  else if (intensity > 0) { bg = '#ef4444'; text = '#ffffff'; }
  else { bg = '#2d333b'; text = '#484f58'; }

  return (
    <div
      className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all hover:scale-110 cursor-default"
      style={{ backgroundColor: `${bg}${intensity > 0 ? Math.round(intensity * 80 + 20).toString(16) : '30'}`, color: text }}
      title={`${value} completions`}
    >
      {value}
    </div>
  );
};

const ContentHeatmap = () => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const navigate = useRouter();
  
  useEffect(() => {
    const ac = new AbortController();
    api.get<Record<string, unknown>>('/admin/heatmap', { signal: ac.signal })
      .then(res => { if (!ac.signal.aborted) setData(res.data); })
      .catch(handleApiError)
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const loadDetail = async (slug: string) => {
    if (expandedCourse === slug) {
      setExpandedCourse(null);
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setExpandedCourse(slug);
    try {
      const res = await api.get<Record<string, unknown>>(`/admin/heatmap/${slug}`);
      setDetail(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  const maxGlobal = Math.max(...((data?.courses ?? []) as Record<string, unknown>[]).map((c) => (c.avg_completions as number ?? 0)), 1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 data-testid="content-heatmap-title" className="text-2xl font-bold text-white">Content Performance Heatmap</h1>
            <p className="text-sm text-[#8b949e]">{(data?.total_courses as number) ?? 0} courses analyzed</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 px-1">
          <span className="text-xs text-[#8b949e]">Engagement:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ef4444]/40" /><span className="text-xs text-[#8b949e]">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#f59e0b]/60" /><span className="text-xs text-[#8b949e]">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#22c55e]/80" /><span className="text-xs text-[#8b949e]">High</span>
          </div>
        </div>

        {/* Course Grid */}
        <div className="space-y-3">
          {((data?.courses ?? []) as Record<string, unknown>[]).map((course) => {
            const isExpanded = expandedCourse === (course.course_slug as string);
            return (
              <div key={(course.course_id as string)} className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
                <button
                  onClick={() => loadDetail(course.course_slug as string)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#1c2128] transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown size={16} className="text-[#22c55e]" /> : <ChevronRight size={16} className="text-[#484f58]" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#c9d1d9] font-medium truncate">{(course.course_title as string)}</p>
                    <p className="text-xs text-[#484f58]">{(course.total_lessons as number)} lessons &middot; {((course.sections as Record<string, unknown>[])?.length ?? 0)} sections</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono text-[#c9d1d9]">{(course.total_completions as number)}</p>
                      <p className="text-xs text-[#484f58]">completions</p>
                    </div>
                    <HeatCell value={Math.round((course.avg_completions as number) ?? 0)} maxVal={maxGlobal} />
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#2d333b] px-5 py-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-8"><Loader2 size={20} className="text-[#22c55e] animate-spin" /></div>
                    ) : detail ? (
                      <>
                        {/* Drop-off alerts */}
                        {((detail?.drop_off_points as unknown[])?.length ?? 0) > 0 && (
                          <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle size={14} className="text-[#ef4444]" />
                              <span className="text-xs font-medium text-[#ef4444]">Drop-off Points Detected</span>
                            </div>
                            {(detail.drop_off_points as Record<string, unknown>[]).map((dp, i) => (
                              <p key={i} className="text-xs text-[#ef4444]/80 ml-5">
                                {(dp.drop_percent as number)}% drop: &ldquo;{(dp.from_lesson as string)}&rdquo; → &ldquo;{(dp.to_lesson as string)}&rdquo; ({(dp.section as string)})
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Section heatmaps */}
                        {(detail.sections as Record<string, unknown>[])?.map((sec) => (
                          <div key={(sec.section_id as string)} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-[#8b949e]">{(sec.section_title as string)}</p>
                              <span className="text-xs text-[#484f58]">Avg: {(sec.avg_completion_rate as number)}%</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(sec.lessons as Record<string, unknown>[])?.map((les) => (
                                <div key={(les.lesson_id as string)} className="group relative">
                                  <HeatCell value={(les.completions as number)} maxVal={(detail.max_completions as number) || 1} />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                    <div className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-[10px] text-[#c9d1d9] whitespace-nowrap shadow-lg">
                                      {(les.lesson_title as string)}<br />{(les.completions as number)} ({(les.completion_rate as number)}%)
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}

          {!((data?.courses ?? []) as Record<string, unknown>[]).length && (
            <div className="text-center py-16">
              <Flame size={24} className="text-[#484f58] mx-auto mb-3" />
              <p className="text-sm text-[#8b949e]">No heatmap data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentHeatmap;
