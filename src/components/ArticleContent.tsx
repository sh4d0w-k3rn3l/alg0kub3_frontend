'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import type { FC, ReactNode } from 'react';
import Image from 'next/image';
import CodeBlock from '@/components/CodeBlock';
import QuizComponent from '@/components/QuizComponent';
import SEO from '@/components/SEO';
import { Clock, ChevronRight, ChevronDown, Info, AlertTriangle, Lightbulb, AlertCircle, Youtube, Play, Lock, Zap, CheckCircle, Sparkles, X, Loader2, FileText } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { LanguagePrefProvider, useLanguagePref } from '@/context/LanguagePrefContext';
import { useRouter } from 'next/navigation';
const MermaidDiagram = lazy(() => import('@/components/article/MermaidDiagram'));
const ArrayWalkthrough = lazy(() => import('@/components/article/ArrayWalkthrough'));
const ArrayStoryboard = lazy(() => import('@/components/article/ArrayStoryboard'));
const ProblemHeader = lazy(() => import('@/components/article/ProblemHeader'));
const Playground = lazy(() => import('@/components/article/Playground'));
import LessonDiscussions from '@/components/LessonDiscussions';
import LessonFeedback from '@/components/LessonFeedback';
import BookmarkButton from '@/components/BookmarkButton';
import { api, ApiError } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { sanitizeHtml } from '@/lib/sanitize';

interface CalloutStyle {
  bg: string;
  border: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const CALLOUT_STYLES: Record<string, CalloutStyle> = {
  note: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6' },
  info: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6' },
  warning: { bg: '#f59e0b15', border: '#f59e0b40', icon: AlertTriangle, color: '#f59e0b' },
  tip: { bg: '#22c55e15', border: '#22c55e40', icon: Lightbulb, color: '#22c55e' },
  error: { bg: '#ef444415', border: '#ef444440', icon: AlertCircle, color: '#ef4444' },
  complexity: { bg: '#a855f715', border: '#a855f760', icon: Zap, color: '#a855f7' },
  insight: { bg: '#eab30815', border: '#eab30860', icon: Lightbulb, color: '#eab308' },
  success: { bg: '#22c55e15', border: '#22c55e40', icon: CheckCircle, color: '#22c55e' },
};

const extractYouTubeId = (url: string): string => {
  if (!url) return '';
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return '';
};

const INLINE_CODE_CLASSES = 'bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-400';

const styleInlineCode = (html: string): string => {
  return html.replace(/<code(?!\s+class=)([^>]*)>/g, `<code class="${INLINE_CODE_CLASSES}"$1>`);
};

const renderMarkdown = (text: string): string => {
  if (!text) return '';
  if (text.startsWith('<p>') || text.includes('<span style=') || (text.includes('<strong>') && text.includes('</strong>')) || text.includes('<code>') || text.includes('<em>')) {
    const html = text.replace(/^<p>(.*)<\/p>$/s, '$1');
    return styleInlineCode(html);
  }
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, `<code class="${INLINE_CODE_CLASSES}">$1</code>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');
};

interface SectionBrief {
  course_id?: string;
  [key: string]: unknown;
}

interface TestCaseItem {
  name: string;
  input: string;
  expected: string;
}

interface WalkthroughStep {
  array?: (string | number)[];
  pointers?: Array<{ name: string; index: number; position?: 'above' | 'below' }>;
  highlights?: number[];
  finalized?: number[];
  swapping?: number[];
  label?: string;
  kind?: string;
  stackMode?: boolean;
  linked?: boolean;
  matrix?: (string | number)[][];
  description?: string;
  code?: string;
  chart?: Record<string, unknown>;
  tree?: Record<string, unknown>;
  trie_nodes?: Record<string, unknown>;
  graph_nodes?: unknown[];
  graph_edges?: unknown[];
  graph?: Record<string, unknown>;
  intervals?: unknown[];
  frames?: WalkthroughStep[];
  scale?: number;
  show_indices?: boolean;
  edge_labels?: Array<{ from: number; to: number; label: string }>;
  node_labels?: string[];
  path_overlay?: unknown[];
  path?: number[];
  visited?: number[];
  current?: number;
}

interface ContentBlock {
  type: string;
  text?: string;
  level?: number;
  code?: string;
  language?: string;
  runnable?: boolean;
  title?: string;
  tabs?: Array<{ label: string; language?: string; code?: string; text?: string }>;
  items?: Array<{ title?: string; text?: string; content?: string }>;
  variant?: string;
  url?: string;
  alt?: string;
  caption?: string;
  videoId?: string;
  startTime?: number;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  difficulty?: string;
  leetcode_url?: string;
  topics?: string[];
  companies?: string[];
  bare?: boolean;
  linked?: boolean;
  kind?: string;
  steps?: WalkthroughStep[];
  starter_code?: Record<string, string>;
  languages?: string[];
  test_cases?: TestCaseItem[];
  timer?: boolean;
  ordered?: boolean;
  headers?: string[];
  rows?: string[][];
  headerColor?: string;
  headerTextColor?: string;
  children?: ContentBlock[];
  href?: string;
  [key: string]: unknown;
}

interface LessonData {
  slug?: string;
  id?: string | number;
  title?: string;
  last_updated?: string;
  read_time?: string;
  content_blocks?: ContentBlock[];
  difficulty?: string;
  access_type?: string;
  course_title?: string;
  course_name?: string;
}

interface FontSizeData {
  content?: string;
  heading?: string;
  subheading?: string;
}

interface ArticleContentInnerProps {
  lesson: LessonData | null;
  fontSize: FontSizeData | null;
  lineHeight: number;
  fontFamily: string;
  syntaxTheme: string;
  onSyntaxThemeChange?: (theme: string) => void;
  sectionId?: string;
  sectionTitle?: string;
  courseSlug?: string;
}

const formatUpdatedDate = (iso?: string): string => {
  if (!iso) return 'December 6, 2025';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const ArticleContentInner: FC<ArticleContentInnerProps> = ({ lesson, fontSize, lineHeight, syntaxTheme, onSyntaxThemeChange, sectionId, sectionTitle, courseSlug }) => {
  const { colors, isDark } = useTheme();
  const { user, login, isSubscribed, getAuthHeaders } = useAuth();
  const { preferredLang, setPreferredLang } = useLanguagePref();
  const router = useRouter();
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string | number, number>>({});
  const [access, setAccess] = useState<{ has_access: boolean; is_free: boolean; is_subscribed: boolean; access_type: string; price?: number }>({ has_access: true, is_free: true, is_subscribed: false, access_type: 'free' });
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState('');
  const [explainError, setExplainError] = useState('');
  const progressKey = `${courseSlug}:${lesson?.id ?? ''}:${user ? 'u' : 'g'}`;
  const [prevProgressKey, setPrevProgressKey] = useState(progressKey);
  if (prevProgressKey !== progressKey) {
    setPrevProgressKey(progressKey);
    setLessonCompleted(false);
    setExplainOpen(false);
    setExplainResult('');
    setExplainError('');
  }

  useEffect(() => {
    if (!lesson?.slug) return;
    const ac = new AbortController();
    api.get<{ has_access: boolean; is_free: boolean; is_subscribed: boolean; access_type: string; price?: number }>(`/lessons/${lesson.slug}/access`, { params: { course: courseSlug || '' }, signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setAccess(r.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setAccess({ has_access: true, is_free: true, is_subscribed: false, access_type: 'free' });
      });
    return () => ac.abort();
  }, [lesson?.slug, courseSlug]);

  useEffect(() => {
    if (!user || !lesson?.id || !courseSlug) {
      return;
    }
    const ac = new AbortController();
    api.get<{ completed_lessons?: string[] }>(`/progress/course/${courseSlug}`, { signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setLessonCompleted(r.data.completed_lessons?.includes(String(lesson.id)) || false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLessonCompleted(false);
      });
    return () => ac.abort();
  }, [user, lesson?.id, courseSlug]);

  const handleToggleProgress = async () => {
    if (!user || !lesson?.id) return;
    try {
      const sectionRes = await api.get<{ sections?: SectionBrief[] } | SectionBrief[]>(`/sections?course_slug=${courseSlug}`);
      const secs = Array.isArray(sectionRes.data) ? sectionRes.data : (sectionRes.data.sections ?? []);
      const courseId = secs[0]?.course_id || '';
      const res = await api.post<{ completed: boolean }>(`/progress/complete`, {
        lesson_id: lesson.id,
        course_id: courseId,
      });
      setLessonCompleted(res.data.completed);
    } catch (err) { handleApiError(err); }
  };

  const handleExplain = async () => {
    if (!lesson?.slug) return;
    setExplainOpen(true);
    if (explainResult && !explainError) return;
    setExplainLoading(true);
    setExplainError('');
    const selected = window.getSelection()?.toString().trim() || '';
    try {
      const headers = await getAuthHeaders();
      const res = await api.post<{ explanation: string }>('/tutor/explain', {
        lesson_slug: lesson.slug,
        course_slug: courseSlug || '',
        text: selected,
      }, { headers });
      setExplainResult(res.data.explanation || '');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        setExplainError('AI explanations require a Pro subscription.');
      } else if (!user) {
        setExplainError('You need to sign in to use AI explanations.');
      } else {
        setExplainError('Something went wrong. Please try again.');
      }
    } finally { setExplainLoading(false); }
  };

  if (!lesson) return null;

  const { title, last_updated, read_time, content_blocks } = lesson;
  const fs: FontSizeData = fontSize || { content: '15.5px', heading: '32px', subheading: '20px' };
  const lh: number = lineHeight || 1.8;

  const renderBlock = (block: ContentBlock, idx: string | number): ReactNode => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={idx} className="mb-5" style={{ fontSize: fs.content, color: colors.text, lineHeight: lh }}>
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(block.text || '')) }} />
          </p>
        );

      case 'heading':
      case 'subheading': {
        const level = block.level || 2;
        const headingId = (block.text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const Tag = level === 2 ? 'h2' as const : level === 3 ? 'h3' as const : 'h4' as const;
        const size = level === 2 ? 'text-2xl' : level === 3 ? 'text-xl' : 'text-lg';
        const TIER_STYLES: Record<string, { dot: string; label: string; bg: string; border: string; text: string }> = {
          starter:  { dot: '#22c55e', label: 'L1 · Starter', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.45)',  text: isDark ? '#86efac' : '#15803d' },
          improved: { dot: '#eab308', label: 'L2 · Better',  bg: 'rgba(234,179,8,0.14)',  border: 'rgba(234,179,8,0.45)',  text: isDark ? '#fde68a' : '#a16207' },
          optimal:  { dot: '#a855f7', label: 'L3 · Optimal', bg: 'rgba(168,85,247,0.14)', border: 'rgba(168,85,247,0.45)', text: isDark ? '#e9d5ff' : '#7e22ce' },
        };
        const tier = block.tier ? TIER_STYLES[block.tier as keyof typeof TIER_STYLES] : undefined;
        return (
          <Tag key={idx} id={headingId} className={`font-bold mt-8 mb-4 scroll-mt-20 ${size}`} style={{ color: colors.text, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span>{block.text}</span>
            {tier && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: '0.62em', fontWeight: 700,
                  padding: '4px 10px', borderRadius: 999,
                  background: tier.bg, border: `1px solid ${tier.border}`,
                  color: tier.text, letterSpacing: '0.04em',
                  fontFamily: 'ui-monospace,SFMono-Regular,monospace',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: tier.dot, display: 'inline-block' }} />
                {tier.label}
              </span>
            )}
          </Tag>
        );
      }

      case 'code':
        return (
          <CodeBlock
            key={idx}
            code={block.code || ''}
            language={block.language || 'python'}
            runnable={block.runnable || false}
            title={block.title}
            syntaxTheme={syntaxTheme}
            onSyntaxThemeChange={onSyntaxThemeChange}
          />
        );

      case 'codegroup': {
        const tabs = block.tabs || [];
        const prefIdx = preferredLang
          ? tabs.findIndex(t => (t.language || '').toLowerCase() === preferredLang)
          : -1;
        const currentTab = prefIdx >= 0 ? prefIdx : (activeTab[idx] || 0);
        const handleTabClick = (i: number) => {
          setActiveTab({ ...activeTab, [idx]: i });
          const lang = (tabs[i]?.language || '').toLowerCase();
          if (lang) setPreferredLang(lang);
        };
        return (
          <div key={idx} className="mb-6 border rounded-lg overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
            <div className="flex border-b" style={{ borderColor: colors.border, backgroundColor: isDark ? '#161b22' : '#f6f8fa' }}>
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => handleTabClick(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${i === currentTab ? 'border-green-500 text-green-500' : 'border-transparent'}`}
                  style={{ color: i === currentTab ? colors.green : colors.textMuted }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {tabs[currentTab] && (
              <CodeBlock
                key={`cg-${idx}-${currentTab}`}
                code={tabs[currentTab].code || ''}
                language={tabs[currentTab].language || 'python'}
                runnable={false}
                syntaxTheme={syntaxTheme}
              />
            )}
          </div>
        );
      }

      case 'mermaid':
        return (
          <Suspense key={idx} fallback={<div className="my-6 h-40 rounded-lg border animate-pulse" style={{ borderColor: colors.border, backgroundColor: colors.bgSecondary }} />}>
            <MermaidDiagram
              code={block.code}
              title={block.title}
              theme={isDark ? 'dark' : 'light'}
              diagramTheme={block.theme as string}
              colors={colors}
            />
          </Suspense>
        );

      case 'callout': {
        const style = CALLOUT_STYLES[block.variant || 'note'] || CALLOUT_STYLES.note;
        const Icon = style.icon;
        return (
          <div key={idx} className="mb-5 rounded-lg border px-4 py-3" style={{ backgroundColor: style.bg, borderColor: style.border }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: style.color }}><Icon size={16} /></span>
              <span className="text-sm font-semibold" style={{ color: style.color }}>{block.title || (block.variant || 'note').charAt(0).toUpperCase() + (block.variant || 'note').slice(1)}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(block.text || '')) }} />
            </p>
          </div>
        );
      }

      case 'accordion': {
        const items = block.items || [];
        return (
          <div key={idx} className="mb-5 space-y-2">
            {items.map((item, i) => {
              const isOpen = accordionOpen[`${idx}-${i}`];
              return (
                <div key={i} className="border rounded-lg overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                  <button
                    onClick={() => setAccordionOpen({ ...accordionOpen, [`${idx}-${i}`]: !isOpen })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left"
                  >
                    {isOpen ? <ChevronDown size={16} style={{ color: colors.green }} /> : <ChevronRight size={16} style={{ color: colors.textMuted }} />}
                    <span className="font-medium" style={{ color: colors.text }}>{item.title}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 border-t pt-3" style={{ borderColor: colors.border, color: colors.text }}>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(item.content ?? item.text ?? '')) }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case 'tabs': {
        const tabs = block.tabs || [];
        const currentTab = activeTab[`tabs-${idx}`] || 0;
        return (
          <div key={idx} className="mb-5 border rounded-lg overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
            <div className="flex border-b" style={{ borderColor: colors.border }}>
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab({ ...activeTab, [`tabs-${idx}`]: i })}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${i === currentTab ? 'border-green-500' : 'border-transparent'}`}
                  style={{ color: i === currentTab ? colors.green : colors.textMuted }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {tabs[currentTab] && (
              <div className="px-4 py-3" style={{ color: colors.text }}>
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(tabs[currentTab].text || '')) }} />
              </div>
            )}
          </div>
        );
      }

      case 'steps': {
        const items = block.items || [];
        return (
          <div key={idx} className="mb-5">
            {items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: colors.green }}>
                    {i + 1}
                  </div>
                  {i < items.length - 1 && <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: colors.border }} />}
                </div>
                <div className="pb-6 flex-1">
                  <div className="font-semibold mb-1" style={{ color: colors.text }}>{item.title}</div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(item.text || '')) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'card':
        return (
          <div key={idx} className="mb-5 border rounded-lg p-4 hover:border-gray-400 transition-colors" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
            <div className="font-bold mb-1" style={{ color: colors.text }}>{block.title}</div>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(block.text || '')) }} />
            </p>
            {block.href && (
              <a href={block.href} className="text-sm mt-2 inline-block hover:underline" style={{ color: colors.green }}>
                Learn more →
              </a>
            )}
          </div>
        );

      case 'list': {
        const Tag = block.ordered ? 'ol' as const : 'ul' as const;
        return (
          <Tag key={idx} className={`${block.ordered ? 'list-decimal' : 'list-disc'} pl-6 mb-5 space-y-2`}>
            {(block.items || []).map((item, i) => (
              <li key={i} style={{ fontSize: fs.content, color: colors.text, lineHeight: lh }}>
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(typeof item === 'string' ? item : item.text || '')) }} />
              </li>
            ))}
          </Tag>
        );
      }

      case 'table': {
        const headers = block.headers || [];
        const rows = block.rows || [];
        const hdrBg = block.headerColor || '#22c55e';
        const hdrText = block.headerTextColor || '#000000';
        return (
          <div key={idx} className="mb-5 overflow-x-auto border rounded-lg" style={{ borderColor: colors.border }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: hdrBg }}>
                  {headers.map((h, i) => (
                    <th key={i} className="border-b px-4 py-2 text-left font-semibold" style={{ borderColor: colors.border, color: hdrText }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b px-4 py-2" style={{ borderColor: colors.border, color: colors.text }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell) }}>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'blockquote':
        return (
          <blockquote key={idx} className="mb-5 border-l-4 pl-4 py-2 italic" style={{ borderColor: colors.green, color: colors.textSecondary }}>
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(block.text || '')) }} />
          </blockquote>
        );

      case 'image':
        return (
          <div key={idx} className="mb-5">
            {block.url ? (
              <Image src={block.url} alt={block.alt || ''} width={1200} height={675} unoptimized className="max-w-full rounded-lg border" style={{ borderColor: colors.border, backgroundColor: isDark ? '#f8f9fa' : 'transparent', padding: isDark ? '12px' : '0', borderRadius: '8px' }} />
            ) : (
              <div className="h-32 rounded-lg border flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.bgCard, color: colors.textMuted }}>
                No image
              </div>
            )}
            {block.caption && <p className="text-sm text-center mt-2" style={{ color: colors.textMuted }}>{block.caption}</p>}
          </div>
        );

      case 'youtube': {
        const videoId = block.videoId || (block.url ? extractYouTubeId(block.url) : '');
        return (
          <div key={idx} className="mb-5">
            {block.title && (
              <div className="flex items-center gap-2 mb-2">
                <Youtube size={16} className="text-red-500" />
                <span className="font-medium" style={{ color: colors.text }}>{block.title}</span>
              </div>
            )}
            {videoId ? (
              <div className="rounded-lg overflow-hidden border aspect-video" style={{ borderColor: colors.border }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}${block.startTime ? `?start=${block.startTime}` : ''}`}
                  title={block.title || 'YouTube video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-48 rounded-lg border flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <Youtube size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No YouTube video</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'vimeo': {
        const videoId = block.videoId || (block.url?.match(/vimeo\.com\/(\d+)/)?.[1] || '');
        return (
          <div key={idx} className="mb-5">
            {block.title && (
              <div className="flex items-center gap-2 mb-2">
                <Play size={16} className="text-cyan-500" />
                <span className="font-medium" style={{ color: colors.text }}>{block.title}</span>
              </div>
            )}
            {videoId ? (
              <div className="rounded-lg overflow-hidden border aspect-video" style={{ borderColor: colors.border }}>
                <iframe
                  src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
                  title={block.title || 'Vimeo video'}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-48 rounded-lg border flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <Play size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No Vimeo video</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'loom': {
        const videoId = block.videoId || (block.url?.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)?.[1] || '');
        return (
          <div key={idx} className="mb-5">
            {block.title && (
              <div className="flex items-center gap-2 mb-2">
                <Play size={16} className="text-purple-500" />
                <span className="font-medium" style={{ color: colors.text }}>{block.title}</span>
              </div>
            )}
            {videoId ? (
              <div className="rounded-lg overflow-hidden border aspect-video" style={{ borderColor: colors.border }}>
                <iframe
                  src={`https://www.loom.com/embed/${videoId}`}
                  title={block.title || 'Loom recording'}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-48 rounded-lg border flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <Play size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No Loom recording</p>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'video':
        return (
          <div key={idx} className="mb-5">
            {block.title && (
              <div className="flex items-center gap-2 mb-2">
                <Play size={16} className="text-purple-500" />
                <span className="font-medium" style={{ color: colors.text }}>{block.title}</span>
              </div>
            )}
            {block.url ? (
              <div className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                <video
                  src={block.url}
                  poster={block.poster}
                  controls={block.controls !== false}
                  autoPlay={block.autoplay}
                  loop={block.loop}
                  muted={block.muted}
                  className="w-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="h-48 rounded-lg border flex items-center justify-center" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
                <div className="text-center" style={{ color: colors.textMuted }}>
                  <Play size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No video</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'divider':
        return <hr key={idx} className="my-8" style={{ borderColor: colors.border }} />;

      case 'problem_header':
        return (
          <Suspense key={idx} fallback={<div className="mb-5 h-24 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />}>
            <ProblemHeader
              title={block.title}
              difficulty={block.difficulty}
              leetcode_url={block.leetcode_url}
              topics={block.topics || []}
              companies={block.companies || []}
              isDark={isDark}
            />
          </Suspense>
        );

      case 'array_walkthrough':
        return (
          <Suspense key={idx} fallback={<div className="mb-5 h-40 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />}>
            <ArrayWalkthrough
              title={block.title}
              steps={block.steps || []}
              isDark={isDark}
              bare={block.bare}
              linked={block.linked}
              stackMode={block.kind === 'stack'}
            />
          </Suspense>
        );

      case 'walkthrough_storyboard':
        return (
          <Suspense key={idx} fallback={<div className="mb-5 h-40 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />}>
            <ArrayStoryboard
              title={block.title}
              steps={block.steps || []}
              isDark={isDark}
            />
          </Suspense>
        );

      case 'playground':
        return (
          <Suspense key={idx} fallback={<div className="mb-5 h-64 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />}>
            <Playground
              title={block.title}
              lesson_slug={lesson?.slug}
              starter_code={block.starter_code || {}}
              languages={block.languages}
              test_cases={block.test_cases}
              timer={block.timer !== false}
              isDark={isDark}
            />
          </Suspense>
        );

      case 'problem_card': {
        const children = block.children || [];
        return (
          <div
            key={idx}
            data-testid="problem-card"
            className="mb-6 rounded-2xl border px-5 sm:px-7 py-5 sm:py-6"
            style={{
              borderColor: colors.border,
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            }}
          >
            {children.map((child, i) => renderBlock(child, `${idx}-${i}`))}
          </div>
        );
      }

      default:
        if (block.text) {
          return (
            <p key={idx} className="mb-5" style={{ fontSize: fs.content, color: colors.text, lineHeight: lh }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(block.text)) }} />
            </p>
          );
        }
        return null;
    }
  };

  const seoDescription = (() => {
    const firstPara = (content_blocks || []).find(b => b?.type === 'paragraph' && b.text);
    const raw = firstPara?.text || '';
    const stripped = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (stripped) {
      return stripped.length > 180 ? stripped.slice(0, 177) + '…' : stripped;
    }
    return `${title} — ${sectionTitle || 'Interactive lesson'} with code examples and explanations.`;
  })();
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/og/lesson/${lesson.slug}.svg`;

  return (
    <div className="max-w-[840px] mx-auto">
      <SEO
        title={title || ''}
        description={seoDescription}
        path={`/learn/${courseSlug}/${lesson.slug}`}
        type="article"
        image={ogImageUrl}
        lesson={{
          read_time,
          last_updated,
          difficulty: lesson.difficulty,
          is_free: access.is_free,
          access_type: lesson.access_type,
          courseName: lesson.course_title || lesson.course_name,
          courseSlug,
          sectionTitle,
          teaches: title ? [title] : [],
        }}
      />
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1 gap-2">
          <h1 className="font-bold leading-tight" style={{ fontSize: fs.heading, color: colors.text }}>{title}</h1>
          <span className="text-sm whitespace-nowrap sm:mt-2" style={{ color: colors.textMuted }}>
            Last Updated: {formatUpdatedDate(last_updated)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm mt-2" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{read_time || '5 min read'}</span>
          </div>
          {lesson?.slug && <BookmarkButton lessonSlug={lesson.slug} />}
          {access.is_free && (
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: colors.green + '20', color: colors.green }}>Free</span>
          )}
          <button
            data-testid="explain-with-ai"
            onClick={handleExplain}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{
              color: explainLoading ? colors.textMuted : colors.green,
              border: `1px solid ${explainLoading ? colors.border : colors.green + '40'}`,
              backgroundColor: explainLoading ? 'transparent' : colors.green + '12',
            }}
            title="Explain this lesson (or your selected passage) in plain language"
          >
            {explainLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {explainLoading ? 'Explaining…' : 'Explain with AI'}
          </button>
          {user && (
            <button
              data-testid="mark-complete-btn"
              onClick={handleToggleProgress}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ml-auto"
              style={{
                backgroundColor: lessonCompleted ? colors.green + '20' : 'transparent',
                color: lessonCompleted ? colors.green : colors.textMuted,
                border: `1px solid ${lessonCompleted ? colors.green + '40' : colors.border}`,
              }}
            >
              <CheckCircle size={12} />
              {lessonCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>

      {explainOpen && (
        <div className="mb-6 rounded-xl border p-4" style={{ borderColor: colors.green + '40', backgroundColor: colors.green + '08' }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: colors.green }} />
              <span className="text-sm font-semibold" style={{ color: colors.text }}>Explain with AI</span>
            </div>
            <button
              data-testid="explain-close"
              onClick={() => setExplainOpen(false)}
              className="p-1 rounded transition-colors"
              style={{ color: colors.textMuted }}
              aria-label="Close AI explanation"
            >
              <X size={14} />
            </button>
          </div>
          {explainLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 size={14} className="animate-spin" style={{ color: colors.green }} />
              <span className="text-xs" style={{ color: colors.textMuted }}>Writing a plain-language explanation…</span>
            </div>
          ) : explainError ? (
            <div>
              <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{explainError}</p>
              {!user && (
                <button
                  onClick={login}
                  className="text-xs font-medium px-3 py-1.5 rounded"
                  style={{ backgroundColor: colors.green, color: '#fff' }}
                >
                  Sign in to use AI explanations
                </button>
              )}
              {user && explainError.includes('Pro') && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="text-xs font-medium px-3 py-1.5 rounded"
                  style={{ backgroundColor: colors.green, color: '#fff' }}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm leading-relaxed" style={{ color: colors.text }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(explainResult)) }} />
            </div>
          )}
        </div>
      )}

      {access.has_access ? (
        <>
          <div className="mb-8">
            {(content_blocks || []).length === 0 ? (
              <div className="border rounded-xl p-8 text-center" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <FileText size={40} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
                  Content coming soon
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  This lesson is being written and will be available shortly.
                </p>
              </div>
            ) : (
              (content_blocks || []).map((block, idx) => renderBlock(block, idx))
            )}
          </div>
          {sectionId && sectionTitle && (content_blocks || []).length > 0 && (
            <QuizComponent sectionId={sectionId} sectionTitle={sectionTitle} />
          )}
        </>
      ) : (
        <>
          <div className="mb-4">
            {(content_blocks || []).slice(0, 2).map((block, idx) => renderBlock(block, idx))}
          </div>
          <div data-testid="paywall-overlay" className="relative">
            <div className="absolute inset-x-0 -top-24 h-24 z-10" style={{ background: `linear-gradient(to bottom, transparent, ${colors.bg})` }} />
            <div className="border rounded-xl p-8 text-center" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Lock size={40} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                This lesson requires a Pro subscription
              </h3>
              <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                This is a premium lesson. Free lessons are marked in the sidebar.
              </p>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                Upgrade to Pro for unlimited access to all 1000+ lessons across 6 courses.
              </p>
              {user ? (
                <button
                  data-testid="paywall-upgrade-btn"
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: colors.green, color: '#fff' }}
                >
                  <Zap size={16} /> Upgrade to Pro — ${access.price || '9.99'}/mo
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    data-testid="paywall-signin-btn"
                    onClick={login}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: colors.green, color: '#fff' }}
                  >
                    Sign in to continue
                  </button>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    Already subscribed? <button onClick={login} className="underline" style={{ color: colors.green }}>Sign in</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {access.has_access && !isSubscribed && (
        <div className="mt-12 mb-8 border rounded-lg p-4 sm:p-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          <div className="flex items-start gap-3">
            <Zap size={20} style={{ color: colors.green }} className="mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold mb-1" style={{ color: colors.text }}>Unlock all courses</h3>
              <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>Get unlimited access to all lessons, quizzes, and AI features.</p>
              <button
                data-testid="bottom-upgrade-btn"
                onClick={() => router.push('/pricing')}
                className="text-white font-medium px-5 py-2 rounded-md text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors.green }}
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {access.has_access && lesson?.slug && (
        <LessonFeedback lessonSlug={lesson.slug} />
      )}

      {access.has_access && lesson?.slug && (
        <LessonDiscussions lessonSlug={lesson.slug} courseSlug={courseSlug || ''} />
      )}
    </div>
  );
};

interface ArticleContentProps {
  lesson: LessonData | null;
  fontSize: FontSizeData | null;
  lineHeight: number;
  fontFamily: string;
  syntaxTheme: string;
  onSyntaxThemeChange?: (theme: string) => void;
  sectionId?: string;
  sectionTitle?: string;
  courseSlug?: string;
}

const ArticleContent: FC<ArticleContentProps> = (props) => {
  return (
    <LanguagePrefProvider>
      <ArticleContentInner {...props} />
    </LanguagePrefProvider>
  );
};

export default ArticleContent;
