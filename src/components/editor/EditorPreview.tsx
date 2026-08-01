'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronDown, Info, AlertTriangle, Lightbulb, AlertCircle, Youtube, Play, GitBranch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import { sanitizeHtml } from '@/lib/sanitize';

// Initialize mermaid for preview
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as MermaidConfig);

interface CalloutStyle {
  bg: string;
  border: string;
  icon: LucideIcon;
  color: string;
}

const CALLOUT_STYLES: Record<string, CalloutStyle> = {
  note: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6' },
  info: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6' },
  warning: { bg: '#f59e0b15', border: '#f59e0b40', icon: AlertTriangle, color: '#f59e0b' },
  tip: { bg: '#22c55e15', border: '#22c55e40', icon: Lightbulb, color: '#22c55e' },
  error: { bg: '#ef444415', border: '#ef444440', icon: AlertCircle, color: '#ef4444' },
};

// Mermaid theme configurations
const MERMAID_THEME_CONFIGS: Record<string, Record<string, unknown>> = {
  brand: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#22c55e',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#16a34a',
      secondaryColor: '#3b82f6',
      secondaryTextColor: '#ffffff',
      secondaryBorderColor: '#2563eb',
      tertiaryColor: '#0d1117',
      tertiaryTextColor: '#c9d1d9',
      tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58',
      textColor: '#c9d1d9',
      mainBkg: '#161b22',
      nodeBorder: '#22c55e',
      clusterBkg: '#0d1117',
      clusterBorder: '#2d333b',
      titleColor: '#c9d1d9',
      edgeLabelBackground: '#161b22',
      nodeTextColor: '#ffffff',
    }
  },
  'brand-blue': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#2563eb',
      secondaryColor: '#22c55e',
      secondaryTextColor: '#ffffff',
      secondaryBorderColor: '#16a34a',
      tertiaryColor: '#0d1117',
      tertiaryTextColor: '#c9d1d9',
      tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58',
      textColor: '#c9d1d9',
      mainBkg: '#161b22',
      nodeBorder: '#3b82f6',
      clusterBkg: '#0d1117',
      clusterBorder: '#2d333b',
      titleColor: '#c9d1d9',
      edgeLabelBackground: '#161b22',
      nodeTextColor: '#ffffff',
    }
  },
  'brand-purple': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#a855f7',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#9333ea',
      secondaryColor: '#22c55e',
      secondaryTextColor: '#ffffff',
      secondaryBorderColor: '#16a34a',
      tertiaryColor: '#0d1117',
      tertiaryTextColor: '#c9d1d9',
      tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58',
      textColor: '#c9d1d9',
      mainBkg: '#161b22',
      nodeBorder: '#a855f7',
      clusterBkg: '#0d1117',
      clusterBorder: '#2d333b',
      titleColor: '#c9d1d9',
      edgeLabelBackground: '#161b22',
      nodeTextColor: '#ffffff',
    }
  },
  dark: { theme: 'dark' },
  neutral: { theme: 'neutral' },
  forest: { theme: 'forest' },
};

// Mermaid Preview Component
const MermaidPreview = ({ code, title, theme = 'brand' }: { code?: string; title?: string; theme?: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderMermaid = async () => {
      if (!code?.trim()) {
        setSvg('');
        return;
      }
      try {
        const themeConfig = MERMAID_THEME_CONFIGS[theme] || MERMAID_THEME_CONFIGS.brand;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          ...themeConfig
        } as MermaidConfig);
        
        const uniqueId = `mermaid-preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
        setSvg(renderedSvg);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid diagram');
        setSvg('');
      }
    };
    renderMermaid();
  }, [code, theme]);

  return (
    <div className="mb-4">
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={14} className="text-[#22c55e]" />
          <span className="text-[#c9d1d9] text-sm font-medium">{title}</span>
        </div>
      )}
      <div className="rounded-lg border border-[#2d333b] p-4 bg-[#0d1117] overflow-auto">
        {svg && <div className="flex items-center justify-center" dangerouslySetInnerHTML={{ __html: sanitizeHtml(svg) }} />}
        {error && <div className="text-red-400 text-xs text-center py-4">{error}</div>}
        {!svg && !error && (
          <div className="text-[#484f58] text-xs text-center py-4">
            <GitBranch size={20} className="mx-auto mb-2 opacity-50" />
            No diagram
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to extract YouTube video ID
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

// Parse start time string to seconds
const parseStartTime = (time: string): number => {
  if (!time) return 0;
  let seconds = 0;
  const hours = time.match(/(\d+)h/);
  const mins = time.match(/(\d+)m/);
  const secs = time.match(/(\d+)s/);
  if (hours) seconds += parseInt(hours[1]) * 3600;
  if (mins) seconds += parseInt(mins[1]) * 60;
  if (secs) seconds += parseInt(secs[1]);
  if (!hours && !mins && !secs && /^\d+$/.test(time)) seconds = parseInt(time);
  return seconds;
};

interface EditorBlock {
  id?: string;
  type: string;
  text?: string;
  title?: string;
  level?: number;
  code?: string;
  language?: string;
  lineNumbers?: boolean;
  url?: string;
  alt?: string;
  caption?: string;
  variant?: string;
  theme?: string;
  videoId?: string;
  startTime?: string;
  autoplay?: boolean;
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  headerColor?: string;
  headerTextColor?: string;
  headers?: string[];
  rows?: string[][];
  ordered?: boolean;
  items?: (EditorBlock | string)[];
  tabs?: { label: string; language?: string; code?: string; text?: string }[];
}

const PreviewBlock = ({ block }: { block: EditorBlock }) => {
  const [accordionOpen, setAccordionOpen] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<number>(0);

  if (block.type === 'paragraph') {
    return <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml((block.text || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code class="bg-[#2d333b] px-1 py-0.5 rounded text-[#e06c75] text-xs">$1</code>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#58a6ff] underline">$1</a>')) }} />;
  }

  if (block.type === 'heading' || block.type === 'subheading') {
    const Tag = block.level === 2 ? 'h2' : block.level === 3 ? 'h3' : 'h4';
    const size = block.level === 2 ? 'text-xl' : block.level === 3 ? 'text-lg' : 'text-base';
    return <Tag className={`text-white font-bold ${size} mt-6 mb-3`}>{block.text}</Tag>;
  }

  if (block.type === 'code') {
    return (
      <div className="mb-4 border border-[#2d333b] rounded-lg overflow-hidden">
        {block.title && <div className="bg-[#161b22] px-4 py-1.5 text-[#8b949e] text-xs border-b border-[#2d333b] font-mono">{block.title}</div>}
        <SyntaxHighlighter language={(block.language || 'python').toLowerCase()} style={vscDarkPlus} showLineNumbers={block.lineNumbers} customStyle={{ background: '#0d1117', margin: 0, padding: '16px', fontSize: '13px' }}>
          {block.code || ''}
        </SyntaxHighlighter>
      </div>
    );
  }

  if (block.type === 'codegroup') {
    const tabs = block.tabs || [];
    return (
      <div className="mb-4 border border-[#2d333b] rounded-lg overflow-hidden">
        <div className="flex bg-[#161b22] border-b border-[#2d333b]">
          {tabs.map((tab: { label: string; language?: string; code?: string }, i: number) => (
            <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-1.5 text-xs font-medium border-b-2 ${i === activeTab ? 'border-[#22c55e] text-white' : 'border-transparent text-[#8b949e]'}`}>{tab.label}</button>
          ))}
        </div>
        {tabs[activeTab] && (
          <SyntaxHighlighter language={(tabs[activeTab].language || 'python').toLowerCase()} style={vscDarkPlus} customStyle={{ background: '#0d1117', margin: 0, padding: '16px', fontSize: '13px' }}>
            {tabs[activeTab].code || ''}
          </SyntaxHighlighter>
        )}
      </div>
    );
  }

  if (block.type === 'mermaid') {
    return <MermaidPreview code={block.code} title={block.title} theme={block.theme} />;
  }

  if (block.type === 'callout') {
    const s = CALLOUT_STYLES[block.variant || 'note'] || CALLOUT_STYLES.note;
    const Icon = s.icon;
    return (
      <div className="mb-4 rounded-lg border px-4 py-3" style={{ backgroundColor: s.bg, borderColor: s.border }}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} style={{ color: s.color }} />
          <span className="text-sm font-medium" style={{ color: s.color }}>{block.title}</span>
        </div>
        <p className="text-[#c9d1d9] text-sm">{block.text}</p>
      </div>
    );
  }

  if (block.type === 'accordion') {
    return (
      <div className="mb-4 space-y-2">
        {(block.items || []).map((item: string | EditorBlock, i: number) => {
          const isOpen = accordionOpen[i];
          return (
            <div key={i} className="border border-[#2d333b] rounded-lg overflow-hidden">
              <button onClick={() => setAccordionOpen(p => ({ ...p, [i]: !p[i] }))} className="w-full flex items-center gap-2 px-4 py-2.5 text-left">
                {isOpen ? <ChevronDown size={14} className="text-[#22c55e]" /> : <ChevronRight size={14} className="text-[#484f58]" />}
                <span className="text-[#c9d1d9] text-sm font-medium">{(item as EditorBlock).title}</span>
              </button>
              {isOpen && <div className="px-4 pb-3 text-[#c9d1d9] text-sm border-t border-[#2d333b] pt-2">{(item as EditorBlock).text}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  if (block.type === 'tabs') {
    const tabs = block.tabs || [];
    return (
      <div className="mb-4 border border-[#2d333b] rounded-lg overflow-hidden">
        <div className="flex bg-[#161b22] border-b border-[#2d333b]">
          {tabs.map((tab: { label: string; text?: string }, i: number) => (
            <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-xs font-medium border-b-2 ${i === activeTab ? 'border-[#22c55e] text-white' : 'border-transparent text-[#8b949e]'}`}>{tab.label}</button>
          ))}
        </div>
        {tabs[activeTab] && <div className="px-4 py-3 text-[#c9d1d9] text-sm">{tabs[activeTab].text}</div>}
      </div>
    );
  }

  if (block.type === 'steps') {
    return (
      <div className="mb-4 space-y-0">
        {(block.items || []).map((item: string | EditorBlock, i: number) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#22c55e' }}>{i + 1}</div>
              {i < (block.items || []).length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#2d333b' }} />}
            </div>
            <div className="pb-6">
              <div className="text-white text-sm font-medium mb-1">{(item as EditorBlock).title}</div>
              <div className="text-[#c9d1d9] text-sm">{(item as EditorBlock).text}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'card') {
    return (
      <div className="mb-4 border border-[#2d333b] rounded-lg p-4 hover:border-[#484f58] transition-colors">
        <div className="text-white text-sm font-bold mb-1">{block.title}</div>
        <p className="text-[#c9d1d9] text-sm">{block.text}</p>
      </div>
    );
  }

  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul';
    return (
      <Tag className={`mb-4 ${block.ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1`}>
        {(block.items || []).map((item: string | EditorBlock, i: number) => <li key={i} className="text-[#c9d1d9] text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item as string) }} />)}
      </Tag>
    );
  }

  if (block.type === 'table') {
    const hdrBg = block.headerColor || '#22c55e';
    const hdrText = block.headerTextColor || '#000000';
    return (
      <div className="mb-4 overflow-x-auto border border-[#2d333b] rounded-lg">
        <table className="w-full text-sm">
          <thead><tr style={{ backgroundColor: hdrBg }}>{(block.headers || []).map((h: string, i: number) => <th key={i} className="border-b border-[#2d333b] px-4 py-2 text-left font-medium" style={{ color: hdrText }}>{h}</th>)}</tr></thead>
          <tbody>{(block.rows || []).map((row: string[], ri: number) => <tr key={ri}>{row.map((cell: string, ci: number) => <td key={ci} className="border-b border-[#2d333b] px-4 py-2 text-[#c9d1d9]">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (block.type === 'blockquote') {
    return <blockquote className="mb-4 border-l-4 border-[#484f58] pl-4 py-1 italic text-[#8b949e] text-sm">{block.text}</blockquote>;
  }

  if (block.type === 'image') {
    return (
      <div className="mb-4">
        {block.url ? <Image src={block.url} alt={block.alt || ''} width={1200} height={675} unoptimized className="max-w-full rounded-lg border border-[#2d333b]" /> : <div className="h-32 bg-[#161b22] border border-[#2d333b] rounded-lg flex items-center justify-center text-[#484f58] text-sm">No image</div>}
        {block.caption && <p className="text-[#484f58] text-xs text-center mt-2">{block.caption}</p>}
      </div>
    );
  }

  if (block.type === 'youtube') {
    const videoId = block.videoId || extractYouTubeId(block.url || '');
    const startTime = parseStartTime(block.startTime || '');
    return (
      <div className="mb-4">
        {block.title && <div className="flex items-center gap-2 mb-2"><Youtube size={16} className="text-[#ff0000]" /><span className="text-[#c9d1d9] text-sm font-medium">{block.title}</span></div>}
        {videoId ? (
          <div className="rounded-lg overflow-hidden border border-[#2d333b] aspect-video">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}${startTime ? `?start=${startTime}` : ''}${block.autoplay ? '&autoplay=1' : ''}`}
              title={block.title || 'YouTube video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-48 bg-[#161b22] border border-[#2d333b] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Youtube size={32} className="text-[#484f58] mx-auto mb-2" />
              <p className="text-[#484f58] text-sm">No YouTube video</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'vimeo') {
    const videoId = block.videoId || ((block.url || '').match(/vimeo\.com\/(\d+)/)?.[1] || '');
    return (
      <div className="mb-4">
        {block.title && <div className="flex items-center gap-2 mb-2"><Play size={16} className="text-[#1ab7ea]" /><span className="text-[#c9d1d9] text-sm font-medium">{block.title}</span></div>}
        {videoId ? (
          <div className="rounded-lg overflow-hidden border border-[#2d333b] aspect-video">
            <iframe 
              src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
              title={block.title || 'Vimeo video'}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-48 bg-[#161b22] border border-[#2d333b] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play size={32} className="text-[#484f58] mx-auto mb-2" />
              <p className="text-[#484f58] text-sm">No Vimeo video</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'loom') {
    const videoId = block.videoId || ((block.url || '').match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)?.[1] || '');
    return (
      <div className="mb-4">
        {block.title && <div className="flex items-center gap-2 mb-2"><Play size={16} className="text-[#625df5]" /><span className="text-[#c9d1d9] text-sm font-medium">{block.title}</span></div>}
        {videoId ? (
          <div className="rounded-lg overflow-hidden border border-[#2d333b] aspect-video">
            <iframe 
              src={`https://www.loom.com/embed/${videoId}`}
              title={block.title || 'Loom recording'}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-48 bg-[#161b22] border border-[#2d333b] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play size={32} className="text-[#484f58] mx-auto mb-2" />
              <p className="text-[#484f58] text-sm">No Loom recording</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div className="mb-4">
        {block.title && <div className="flex items-center gap-2 mb-2"><Play size={16} className="text-[#a855f7]" /><span className="text-[#c9d1d9] text-sm font-medium">{block.title}</span></div>}
        {block.url ? (
          <div className="rounded-lg overflow-hidden border border-[#2d333b]">
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
          <div className="h-48 bg-[#161b22] border border-[#2d333b] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play size={32} className="text-[#484f58] mx-auto mb-2" />
              <p className="text-[#484f58] text-sm">No video</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'divider') {
    return <hr className="border-[#2d333b] my-6" />;
  }

  return <p className="text-[#c9d1d9] text-sm mb-4">{block.text || ''}</p>;
};

const EditorPreview = ({ blocks, title, readTime }: { blocks: EditorBlock[]; title?: string; readTime?: string }) => {
  return (
    <div className="prose-invert">
      <h1 className="text-white text-2xl font-bold mb-2">{title || 'Untitled'}</h1>
      {readTime && <span className="text-[#484f58] text-xs mb-6 block">{readTime}</span>}
      {blocks.map((block: EditorBlock, idx: number) => <PreviewBlock key={block.id ?? idx} block={block} />)}
      {blocks.length === 0 && <p className="text-[#484f58] text-sm">No content yet. Start adding blocks in the editor.</p>}
    </div>
  );
};

export default EditorPreview;
