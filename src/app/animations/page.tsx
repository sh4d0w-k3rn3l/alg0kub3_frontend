'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/DSAHeader';
import { api } from '@/lib/api';

const sortingBars = [
  { h: 40, delay: 0 },
  { h: 70, delay: 0.1 },
  { h: 30, delay: 0.2 },
  { h: 85, delay: 0.3 },
  { h: 55, delay: 0.4 },
  { h: 95, delay: 0.5 },
  { h: 45, delay: 0.6 },
  { h: 65, delay: 0.7 },
];

const nnLayers = [
  [0.3, 0.7],
  [0.15, 0.45, 0.75],
  [0.25, 0.55, 0.85],
  [0.4, 0.6],
];

const systemNodes = [
  { x: 60, y: 16, w: 28, h: 12, label: 'Client' },
  { x: 60, y: 42, w: 22, h: 10, label: 'API' },
  { x: 30, y: 72, w: 24, h: 10, label: 'Cache' },
  { x: 90, y: 72, w: 24, h: 10, label: 'DB' },
];

const threadBars = [
  { y: 22, segments: [15, 40, 25, 30] },
  { y: 46, segments: [30, 10, 45, 25] },
  { y: 70, segments: [20, 35, 15, 40] },
];

const animationCategories = [
  {
    id: 'dsa-concepts',
    title: 'DSA Concept Animations',
    description: 'Core data structures and algorithms: arrays, trees, graphs, heaps, sorting, and searching.',
    color: '#14b8a6',
    count: 107,
    href: '/animations/dsa-concepts',
  },
  {
    id: 'dsa',
    title: 'DSA Problem Animations',
    description: 'Step-by-step animated walkthroughs of popular coding interview problems.',
    color: '#10b981',
    count: 646,
    href: '/animations/dsa',
  },
  {
    id: 'system-design',
    title: 'System Design Animations',
    description: 'Distributed systems, networking, databases, caching, scaling, and real-world architectures.',
    color: '#3b82f6',
    count: 279,
    href: '/animations/system-design',
  },
  {
    id: 'concurrency',
    title: 'Concurrency Animations',
    description: 'Threads, locks, synchronization primitives, and classic concurrency problems.',
    color: '#8b5cf6',
    count: 37,
    href: '/animations/concurrency',
  },
  {
    id: 'ai-ml',
    title: 'AI / ML Animations',
    description: 'LLMs, transformers, RAG, agents, and core machine learning concepts.',
    color: '#ec4899',
    count: 95,
    href: '/animations/ai-ml',
  },
  {
    id: 'sql',
    title: 'SQL Animations',
    description: 'Joins, window functions, and how queries actually execute.',
    color: '#f59e0b',
    count: 31,
    href: '/animations/sql',
  },
];

function SortingPreview({ color }: { color: string }) {
  return (
    <div className="flex items-end justify-center gap-[5px] h-full px-6 py-3">
      {sortingBars.map((bar, i) => (
        <div
          key={i}
          className="rounded-t-sm flex-1"
          style={{
            height: `${bar.h}%`,
            backgroundColor: color,
            opacity: 0.75,
            animation: `sorting-bounce 1.8s ease-in-out ${bar.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}


function ProblemPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 140 95" className="w-full h-full px-4 py-2" preserveAspectRatio="xMidYMid meet">
      {[28, 48, 68, 88, 108].map((x, i) => (
        <rect
          key={i}
          x={x - 6}
          y={95 - [50, 70, 35, 85, 55][i]}
          width="12"
          height={[50, 70, 35, 85, 55][i]}
          rx="2"
          fill={color}
          fillOpacity="0.55"
          style={{ animation: `problem-bar-pulse 2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <text x="28" y="93" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fillOpacity="0.8">28</text>
      <text x="48" y="93" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fillOpacity="0.8">48</text>
      <text x="68" y="93" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fillOpacity="0.8">68</text>
      <text x="88" y="93" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fillOpacity="0.8">88</text>
      <text x="108" y="93" textAnchor="middle" fill={color} fontSize="7" fontWeight="700" fillOpacity="0.8">108</text>
      <g style={{ animation: 'pointer-left 3s ease-in-out infinite' }}>
        <rect x="22" y="14" width="12" height="10" rx="3" fill={color} fillOpacity="0.9" />
        <text x="28" y="21.5" textAnchor="middle" fill="#0a0a0b" fontSize="6" fontWeight="700">L</text>
        <line x1="28" y1="24" x2="28" y2={95 - 50} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2 2" />
      </g>
      <g style={{ animation: 'pointer-right 3s ease-in-out infinite' }}>
        <rect x="102" y="14" width="12" height="10" rx="3" fill={color} fillOpacity="0.9" />
        <text x="108" y="21.5" textAnchor="middle" fill="#0a0a0b" fontSize="6" fontWeight="700">R</text>
        <line x1="108" y1="24" x2="108" y2={95 - 55} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2 2" />
      </g>
    </svg>
  );
}

function SystemDesignPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full px-3 py-2" preserveAspectRatio="xMidYMid meet">
      <line x1="60" y1="28" x2="60" y2="37" stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2 2" />
      <line x1="60" y1="52" x2="30" y2="67" stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2 2" />
      <line x1="60" y1="52" x2="90" y2="67" stroke={color} strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2 2" />
      {systemNodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - n.w / 2}
            y={n.y - n.h / 2}
            width={n.w}
            height={n.h}
            rx="3"
            fill={color}
            fillOpacity="0.2"
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.5"
            style={{
              animation: `sys-pulse 2.5s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
          <text
            x={n.x}
            y={n.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="5.5"
            fontWeight="600"
            fillOpacity="0.9"
          >
            {n.label}
          </text>
        </g>
      ))}
      <circle cx="60" cy="42" r="3" fill={color} fillOpacity="0.9"
        style={{ animation: 'sys-dot 2s ease-in-out infinite' }} />
    </svg>
  );
}

function ConcurrencyPreview({ color }: { color: string }) {
  return (
    <div className="flex flex-col justify-center gap-4 h-full px-5 py-3">
      {threadBars.map((thread, ti) => (
        <div key={ti} className="relative h-2 rounded-full" style={{ backgroundColor: `${color}18` }}>
          {thread.segments.map((seg, si) => (
            <div
              key={si}
              className="absolute top-0 h-full rounded-full"
              style={{
                width: `${seg}%`,
                left: `${thread.segments.slice(0, si).reduce((a, b) => a + b, 0)}%`,
                backgroundColor: color,
                opacity: 0.6 + si * 0.08,
                animation: `thread-slide 2.4s ease-in-out ${(ti * 0.3) + (si * 0.15)}s infinite`,
              }}
            />
          ))}
          <div
            className="absolute top-[-3px] w-[10px] h-[10px] rounded-full border-2"
            style={{
              backgroundColor: color,
              borderColor: '#0a0a0b',
              animation: `thread-dot-move-${ti} 3s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function NeuralNetPreview({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 95" className="w-full h-full px-3 py-2" preserveAspectRatio="xMidYMid meet">
      {nnLayers.slice(0, -1).map((layer, li) =>
        layer.map((y1, ni) =>
          nnLayers[li + 1].map((y2, nj) => {
            const x1 = 20 + li * 28;
            const x2 = 20 + (li + 1) * 28;
            return (
              <line
                key={`${li}-${ni}-${nj}`}
                x1={x1} y1={y1 * 80 + 8}
                x2={x2} y2={y2 * 80 + 8}
                stroke={color}
                strokeWidth="0.8"
                strokeOpacity="0.2"
                style={{
                  animation: `nn-pulse 2.5s ease-in-out ${(li * 0.3 + ni * 0.2 + nj * 0.1)}s infinite`,
                }}
              />
            );
          })
        )
      )}
      {nnLayers.map((layer, li) =>
        layer.map((y, ni) => (
          <circle
            key={`${li}-${ni}`}
            cx={20 + li * 28}
            cy={y * 80 + 8}
            r="5"
            fill={color}
            fillOpacity="0.85"
            style={{
              animation: `nn-node 2s ease-in-out ${(li * 0.25 + ni * 0.15)}s infinite`,
            }}
          />
        ))
      )}
    </svg>
  );
}

function SqlPreview({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-6 h-full px-4 py-3">
      <div className="flex flex-col gap-[5px]">
        {[0.7, 0.55, 0.85, 0.4].map((w, i) => (
          <div
            key={i}
            className="h-[7px] rounded-sm"
            style={{
              width: `${w * 60}px`,
              backgroundColor: color,
              opacity: 0.65,
              animation: `sql-row 2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-[2px] h-12 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.5,
            animation: 'sql-line 2.5s ease-in-out infinite',
          }}
        />
        <span className="text-[8px] font-bold" style={{ color, opacity: 0.8 }}>JOIN</span>
      </div>
      <div className="flex flex-col gap-[5px]">
        {[0.6, 0.8, 0.45, 0.65].map((w, i) => (
          <div
            key={i}
            className="h-[7px] rounded-sm"
            style={{
              width: `${w * 60}px`,
              backgroundColor: color,
              opacity: 0.65,
              animation: `sql-row 2s ease-in-out ${i * 0.2 + 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const previewComponents: Record<string, React.FC<{ color: string }>> = {
  dsa: SortingPreview,
  'dsa-concepts': ProblemPreview,
  'system-design': SystemDesignPreview,
  concurrency: ConcurrencyPreview,
  'ai-ml': NeuralNetPreview,
  sql: SqlPreview,
};

export default function AnimationsPage() {
  const mounted = useRef(false);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ total: number; dsa_total: number; component_counts: Record<string, number> }>('/animations/meta', { signal: ac.signal })
      .then((res) => {
        if (!ac.signal.aborted) {
          setCounts({
            'dsa-concepts': res.data.component_counts?.['dsa-concepts'] ?? 107,
            dsa: res.data.dsa_total ?? res.data.total,
            'system-design': res.data.component_counts?.['system-design'] ?? 279,
            concurrency: res.data.component_counts?.['concurrency'] ?? 37,
            'ai-ml': res.data.component_counts?.['ai-ml'] ?? 95,
            sql: res.data.component_counts?.['sql'] ?? 31,
          });
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    if (document.getElementById('anim-styles')) return;
    const style = document.createElement('style');
    style.id = 'anim-styles';
    style.textContent = `
      @keyframes sorting-bounce {
        0% { height: var(--h, 50%); opacity: 0.75; }
        50% { opacity: 1; }
        100% { height: calc(var(--h, 50%) * 0.4); opacity: 0.65; }
      }
      @keyframes problem-bar-pulse {
        0%, 100% { fill-opacity: 0.55; }
        50% { fill-opacity: 0.8; }
      }
      @keyframes pointer-left {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(40px); }
      }
      @keyframes pointer-right {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-40px); }
      }
      @keyframes sys-pulse {
        0%, 100% { fill-opacity: 0.2; stroke-opacity: 0.5; }
        50% { fill-opacity: 0.35; stroke-opacity: 0.8; }
      }
      @keyframes sys-dot {
        0%, 100% { r: 3; opacity: 0.9; }
        50% { r: 4.5; opacity: 0.5; }
      }
      @keyframes thread-slide {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.9; }
      }
      @keyframes thread-dot-move-0 {
        0%, 100% { left: 10%; }
        50% { left: 80%; }
      }
      @keyframes thread-dot-move-1 {
        0%, 100% { left: 60%; }
        50% { left: 15%; }
      }
      @keyframes thread-dot-move-2 {
        0%, 100% { left: 30%; }
        50% { left: 75%; }
      }
      @keyframes nn-pulse {
        0%, 100% { stroke-opacity: 0.15; }
        50% { stroke-opacity: 0.5; }
      }
      @keyframes nn-node {
        0%, 100% { fill-opacity: 0.85; r: 5; }
        50% { fill-opacity: 1; r: 6; }
      }
      @keyframes sql-row {
        0%, 100% { opacity: 0.65; transform: scaleX(1); }
        50% { opacity: 0.9; transform: scaleX(1.05); }
      }
      @keyframes sql-line {
        0%, 100% { opacity: 0.5; height: 48px; }
        50% { opacity: 0.8; height: 56px; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interactive Animations
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Learn by watching concepts come to life. Pick a category to explore
            interactive, animated walkthroughs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animationCategories.map((cat) => {
            const Preview = previewComponents[cat.id];
            const count = counts?.[cat.id] ?? cat.count;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group block"
              >
                <div
                  className={`flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 border-gray-800 bg-black hover:shadow-xl hover:border-gray-700`}
                  style={{ '--accent': cat.color } as React.CSSProperties}
                >
                  <div
                    className="relative h-32 w-full overflow-hidden border-b border-gray-800"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}14, ${cat.color}05)`,
                    }}
                  >
                    {Preview && <Preview color={cat.color} />}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-100 transition-colors group-hover:[color:var(--accent)]">
                        {cat.title}
                      </h3>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${cat.color}1a`,
                          color: cat.color,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-gray-400">
                      {cat.description}
                    </p>
                    <div
                      className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ color: cat.color }}
                    >
                      Explore
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
