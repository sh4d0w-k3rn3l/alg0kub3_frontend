'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, List, Film } from 'lucide-react';
import { BinaryTreeRenderer, TrieRenderer, GraphRenderer, IntervalTimeline } from './TreeGraphRenderers';

interface WalkthroughPointer {
  name: string;
  index: number;
  position?: 'above' | 'below';
}

interface WalkthroughFrame {
  array?: (string | number)[];
  pointers?: WalkthroughPointer[];
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
  frames?: WalkthroughFrame[];
  scale?: number;
  show_indices?: boolean;
  edge_labels?: EdgeLabelT[];
  node_labels?: string[];
  path_overlay?: unknown[];
  path?: number[];
  visited?: number[];
  current?: number;
}

interface EdgeLabelT {
  from: number;
  to: number;
  label: string;
}

/**
 * ArrayWalkthrough — step-by-step animated visualization for array algorithms.
 *
 * Two top-level modes, toggled by the top-right control:
 *   - "animation" (default): one frame at a time + playback controls + step dots.
 *   - "list": every step stacked vertically, description + array side-by-side.
 *
 * Array cells flex-wrap to new rows when they overflow the container.
 * Pointers are anchored inside each cell's stack so wrapping doesn't break the
 * label-to-cell association.
 *
 * Each step:
 *   {
 *     description: string,
 *     array:       [values],
 *     pointers:    [{ name, index, position: 'above' | 'below' }],
 *     highlights:  [index],
 *     finalized:   [index],
 *     swapping:    [i, j],
 *   }
 */
const COLORS = {
  default:   { bg: '#0d1117',  border: '#30363d', text: '#e5e5e5' },
  highlight: { bg: '#052e16',  border: '#22c55e', text: '#bbf7d0' },
  swapping:  { bg: '#431407',  border: '#f97316', text: '#fed7aa' },
  finalized: { bg: '#064e3b',  border: '#22c55e', text: '#ecfdf5' },
};

// Linked-list node colors. Distinct palette tuned to match the canonical
// node-and-arrow rendering: green = default node, yellow = active/cursor
// pointer node, red = target/remove, muted-green = finalized.
const LL_NODE_COLORS = {
  default:   { bg: 'rgba(34,197,94,0.10)',  border: '#22c55e', text: '#bbf7d0' },
  highlight: { bg: 'rgba(234,179,8,0.16)',  border: '#eab308', text: '#fde68a' },
  swapping:  { bg: 'rgba(248,113,113,0.14)', border: '#f87171', text: '#fecaca' },
  finalized: { bg: 'rgba(34,197,94,0.18)',  border: '#16a34a', text: '#dcfce7' },
};

// Semantic pointer-name → color overrides for linked-list rendering.
// Falls back to the rotating POINTER_PALETTE when the name isn't in this map.
const LL_POINTER_COLORS = {
  target:  '#f87171',
  remove:  '#f87171',
  drop:    '#f87171',
  prev:    '#eab308',
  pre:     '#eab308',
  cur:     '#eab308',
  curr:    '#eab308',
  node:    '#eab308',
  p:       '#eab308',
  q:       '#a855f7',
  slow:    '#3b82f6',
  fast:    '#f97316',
  head:    '#22c55e',
  tail:    '#22c55e',
  newHead: '#22c55e',
  nxt:     '#a855f7',
  next:    '#a855f7',
  dummy:   '#9ca3af',
  pred:    '#eab308',
};

const POINTER_PALETTE = ['#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899'];

// Stack-mode node colors. Top-of-stack pops between green/yellow when active.
const STACK_NODE_COLORS = {
  default:   { bg: 'rgba(34,197,94,0.10)',  border: '#22c55e', text: '#bbf7d0' },
  highlight: { bg: 'rgba(234,179,8,0.16)',  border: '#eab308', text: '#fde68a' },
  swapping:  { bg: 'rgba(248,113,113,0.14)', border: '#f87171', text: '#fecaca' },
  finalized: { bg: 'rgba(34,197,94,0.18)',  border: '#16a34a', text: '#dcfce7' },
};

const MONO = 'ui-monospace,SFMono-Regular,monospace';

// A single pointer chip + arrow. Vertically stacked; arrow always points at the cell.
const PointerChip = ({ name, color, direction }: { name: string; color: string; direction: string }) => {
  const isBelow = direction === 'below';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isBelow ? 'column-reverse' : 'column',
      alignItems: 'center',
      gap: 2,
      pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color, padding: '2px 8px',
        background: `${color}22`, border: `1px solid ${color}66`,
        borderRadius: 6, fontFamily: MONO, whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}>
        {name}
      </div>
      <div style={{ fontSize: 14, color, lineHeight: 1 }}>
        {isBelow ? '↑' : '↓'}
      </div>
    </div>
  );
};

// A single cell + its index label + optional above/below pointer stacks.
// The top/bottom slot heights are fixed across a row so cells align even when
// only some cells have pointers.
interface CellColor {
  bg: string;
  border: string;
  text: string;
}

const CellUnit = ({
  value, index, cellState, pointersAbove, pointersBelow,
  pointerColorMap, reserveAbove, reserveBelow,
}: {
  value: string | number; index: number; cellState: string;
  pointersAbove: WalkthroughPointer[]; pointersBelow: WalkthroughPointer[];
  pointerColorMap: Record<string, string>; reserveAbove: boolean; reserveBelow: boolean;
}) => {
  const c = (COLORS as Record<string, CellColor>)[cellState] || COLORS.default;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Above pointer slot */}
      <div style={{
        minHeight: reserveAbove ? 42 : 0,
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 2,
        justifyContent: 'flex-start',
      }}>
        {pointersAbove.map((p, i) => (
          <PointerChip
            key={`above-${p.name}-${i}`}
            name={p.name}
            color={pointerColorMap[p.name] || POINTER_PALETTE[0]}
            direction="above"
          />
        ))}
      </div>

      {/* Index label */}
      <div style={{ fontSize: 11, color: '#8b949e', fontFamily: MONO }}>
        {index}
      </div>

      {/* The cell */}
      <div style={{
        minWidth: 52, minHeight: 52, padding: '8px 10px',
        display: 'grid', placeItems: 'center',
        background: c.bg, border: `2px solid ${c.border}`, borderRadius: 8,
        fontFamily: MONO, fontWeight: 700, fontSize: 16,
        color: c.text, transition: 'all 300ms ease',
      }}>
        {value}
      </div>

      {/* Below pointer slot */}
      <div style={{
        minHeight: reserveBelow ? 42 : 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        justifyContent: 'flex-start',
      }}>
        {pointersBelow.map((p, i) => (
          <PointerChip
            key={`below-${p.name}-${i}`}
            name={p.name}
            color={pointerColorMap[p.name] || POINTER_PALETTE[0]}
            direction="below"
          />
        ))}
      </div>
    </div>
  );
};

// Description card (numbered green bubble on the left + message on the right).
const StepDescription = ({ index, description, isDark }: { index: number; description?: string; isDark: boolean }) => {
  if (!description) return null;
  const m = description.match(/^(Input|Output):\s*(.*)$/);
  if (m) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        fontFamily: MONO, fontSize: 14,
        color: isDark ? '#d1fae5' : '#065f46',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
          background: 'rgba(34,197,94,0.15)', color: '#22c55e',
          border: '1px solid rgba(34,197,94,0.35)', textTransform: 'uppercase',
          letterSpacing: 0.6, whiteSpace: 'nowrap',
        }}>
          {m[1]}
        </span>
        <span>{m[2]}</span>
      </div>
    );
  }
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(34,197,94,0.08)',
      border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10,
      color: isDark ? '#d1fae5' : '#065f46', fontSize: 14, marginBottom: 16,
      fontFamily: MONO, display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{
        color: '#22c55e', fontWeight: 700, minWidth: 22, textAlign: 'center',
        border: '1px solid rgba(34,197,94,0.4)', borderRadius: 6,
        padding: '0 6px', fontSize: 12, lineHeight: '22px', flexShrink: 0,
      }}>
        {index + 1}
      </span>
      <span style={{ lineHeight: 1.55 }}>{description}</span>
    </div>
  );
};

// Renders one frame as a 2D matrix grid with row/column index headers.
// matrix: 2D array of values. cell-state coords use [row, col] pairs.
const MatrixGrid = ({ frame, isDark }: { frame: WalkthroughFrame; isDark: boolean }) => {
  const matrix = frame.matrix || [];
  const m = matrix.length;
  const n = m > 0 ? matrix[0].length : 0;

  const eq = (a: number[], b: number[]) => Array.isArray(a) && a.length === 2 && a[0] === b[0] && a[1] === b[1];
  const has = (list: number[][], r: number, c: number) =>
    Array.isArray(list) && list.some((p: number[]) => eq(p, [r, c]));

  const cellState = (r: number, c: number): string => {
    if (has((frame.swapping || []) as unknown as number[][], r, c)) return 'swapping';
    if (has((frame.finalized || []) as unknown as number[][], r, c)) return 'finalized';
    if (has((frame.highlights || []) as unknown as number[][], r, c)) return 'highlight';
    return 'default';
  };

  const grid = (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `auto repeat(${n}, minmax(52px, max-content))`,
        gap: 8,
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {/* corner spacer */}
      <div />
      {/* column headers */}
      {Array.from({ length: n }, (_, c) => (
        <div
          key={`ch-${c}`}
          style={{
            fontSize: 11,
            color: isDark ? '#8b949e' : '#6b7280',
            fontFamily: MONO,
            paddingBottom: 2,
          }}
        >
          {c}
        </div>
      ))}

      {/* rows: row-index header + cells */}
      {matrix.map((row: (string | number)[], r: number) => (
        <React.Fragment key={`r-${r}`}>
          <div
            style={{
              fontSize: 11,
              color: isDark ? '#8b949e' : '#6b7280',
              fontFamily: MONO,
              paddingRight: 4,
            }}
          >
            {r}
          </div>
          {row.map((v: string | number, c: number) => {
            const cs = (COLORS as Record<string, CellColor>)[cellState(r, c)] || COLORS.default;
            return (
              <div
                key={`c-${r}-${c}`}
                style={{
                  minWidth: 52,
                  minHeight: 52,
                  padding: '8px 10px',
                  display: 'grid',
                  placeItems: 'center',
                  background: cs.bg,
                  border: `2px solid ${cs.border}`,
                  borderRadius: 8,
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 16,
                  color: cs.text,
                  transition: 'all 300ms ease',
                }}
              >
                {v}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
      {grid}
    </div>
  );
};

// LinkedListChain — renders a frame as a horizontal chain of rounded nodes
// joined by `→` arrows and terminated by a dashed `null` placeholder.
// Pointer chips above/below each node use the same chip-and-arrow stack as
// the array renderer, with semantic colors (target/remove → red, prev/cur → yellow).
const LL_NODE_W = 56;
const LL_NODE_H = 44;
const LL_GAP = 6;

const LLArrow = ({ color = '#22c55e' }) => (
  <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden="true"
       style={{ flexShrink: 0, color }}>
    <line x1="0" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" />
    <polyline points="18,2 24,7 18,12" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LLNullNode = () => (
  <div style={{
    minWidth: LL_NODE_W, minHeight: LL_NODE_H,
    display: 'grid', placeItems: 'center',
    border: '2px dashed #4b5563', borderRadius: 10,
    background: 'transparent',
    fontFamily: MONO, fontSize: 13, color: '#6b7280',
    padding: '4px 10px',
  }}>
    null
  </div>
);

// Pointer label shown above/below an LL node. Uses the chip+arrow stack so
// many same-side pointers stack cleanly without overlapping.
const LLPointerStack = ({ pointers, direction, colorFor }: { pointers: WalkthroughPointer[]; direction: string; colorFor: (name: string) => string }) => {
  const isBelow = direction === 'below';
  if (!pointers || pointers.length === 0) {
    return <div style={{ minHeight: 0 }} />;
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: isBelow ? 'column' : 'column-reverse',
      alignItems: 'center',
      gap: 1,
    }}>
      {pointers.map((p: WalkthroughPointer, i: number) => {
        const color = colorFor(p.name);
        return (
          <React.Fragment key={`${direction}-${p.name}-${i}`}>
            {/* arrow before chip when above (label sits on top); after chip when below */}
            {isBelow ? null : (
              <div style={{ fontSize: 14, color, lineHeight: 1, marginTop: 2 }}>↓</div>
            )}
            <div style={{
              fontSize: 11, fontWeight: 700, color, padding: '1px 8px',
              background: `${color}1f`, border: `1px solid ${color}66`,
              borderRadius: 6, fontFamily: MONO, whiteSpace: 'nowrap',
              lineHeight: 1.4,
            }}>
              {p.name}
            </div>
            {isBelow ? (
              <div style={{ fontSize: 14, color, lineHeight: 1, marginBottom: 2 }}>↑</div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const LLNode = ({ value, state, pointersAbove, pointersBelow, colorFor,
                  reserveAbove, reserveBelow }: {
  value: string | number; state: string; pointersAbove: WalkthroughPointer[]; pointersBelow: WalkthroughPointer[];
  colorFor: (name: string) => string; reserveAbove: boolean; reserveBelow: boolean;
}) => {
  const c = (LL_NODE_COLORS as Record<string, CellColor>)[state] || LL_NODE_COLORS.default;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <div style={{
        minHeight: reserveAbove ? 44 : 0,
        display: 'flex', flexDirection: 'column-reverse',
        alignItems: 'center', justifyContent: 'flex-start',
      }}>
        <LLPointerStack pointers={pointersAbove} direction="above" colorFor={colorFor} />
      </div>

      <div style={{
        minWidth: LL_NODE_W, minHeight: LL_NODE_H,
        padding: '6px 12px',
        display: 'grid', placeItems: 'center',
        background: c.bg, border: `2px solid ${c.border}`, borderRadius: 10,
        fontFamily: MONO, fontWeight: 700, fontSize: 16,
        color: c.text, transition: 'all 300ms ease',
        boxShadow: state === 'highlight'
          ? `0 0 0 4px ${c.border}33`
          : (state === 'swapping' ? `0 0 0 4px ${c.border}33` : 'none'),
      }}>
        {value}
      </div>

      <div style={{
        minHeight: reserveBelow ? 44 : 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
      }}>
        <LLPointerStack pointers={pointersBelow} direction="below" colorFor={colorFor} />
      </div>
    </div>
  );
};

const LinkedListChain = ({ frame, pointerColorMap }: { frame: WalkthroughFrame; pointerColorMap: Record<string, string> }) => {
  const items = frame.array || [];
  const pointers = frame.pointers || [];
  const reserveAbove = pointers.some((p: WalkthroughPointer) => (p.position || 'above') === 'above');
  const reserveBelow = pointers.some((p: WalkthroughPointer) => p.position === 'below');

  const colorFor = (name: string): string => {
    const semantic = (LL_POINTER_COLORS as Record<string, string>)[name];
    if (semantic) return semantic;
    return pointerColorMap[name] || POINTER_PALETTE[0];
  };

  const nodeState = (i: number): string => {
    if ((frame.swapping || []).includes(i)) return 'swapping';
    if ((frame.finalized || []).includes(i)) return 'finalized';
    if ((frame.highlights || []).includes(i)) return 'highlight';
    return 'default';
  };

  const above: Record<number, WalkthroughPointer[]> = {};
  const below: Record<number, WalkthroughPointer[]> = {};
  for (const p of pointers) {
    const bucket = p.position === 'below' ? below : above;
    (bucket[p.index] = bucket[p.index] || []).push(p);
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
        <LLNullNode />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap',
      alignItems: 'center', justifyContent: 'center',
      gap: `${LL_GAP}px ${LL_GAP}px`,
      padding: '6px 0',
      rowGap: 18,
    }}>
      {items.map((v: string | number, i: number) => (
        <React.Fragment key={i}>
          <LLNode
            value={v}
            state={nodeState(i)}
            pointersAbove={above[i] || []}
            pointersBelow={below[i] || []}
            colorFor={colorFor}
            reserveAbove={reserveAbove}
            reserveBelow={reserveBelow}
          />
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: reserveAbove ? 44 : 0,
            paddingBottom: reserveBelow ? 44 : 0,
          }}>
            <LLArrow />
          </div>
        </React.Fragment>
      ))}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: reserveAbove ? 44 : 0,
        paddingBottom: reserveBelow ? 44 : 0,
      }}>
        <LLNullNode />
      </div>
    </div>
  );
};

// StackColumn — renders a frame as a vertical stack of nodes (LIFO),
// with the top of the stack at the TOP and the base at the bottom.
// Activated when the walkthrough block carries `kind: 'stack'`.
//   frame.array  → values bottom-to-top (so array[len-1] is the top)
//   frame.pointers → indices into the array; chips render to the right
//                    of the cell, with `←` arrow pointing at the cell.
const STACK_NODE_W = 110;
const STACK_NODE_H = 40;

const StackPointerChip = ({ name, color }: { name: string; color: string }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 4,
    pointerEvents: 'none',
  }}>
    <div style={{ fontSize: 14, color, lineHeight: 1 }}>←</div>
    <div style={{
      fontSize: 11, fontWeight: 700, color, padding: '1px 8px',
      background: `${color}1f`, border: `1px solid ${color}66`,
      borderRadius: 6, fontFamily: MONO, whiteSpace: 'nowrap',
      lineHeight: 1.4,
    }}>
      {name}
    </div>
  </div>
);

const StackColumn = ({ frame, pointerColorMap }: { frame: WalkthroughFrame; pointerColorMap: Record<string, string> }) => {
  const items = frame.array || [];
  const pointers = frame.pointers || [];
  const topIndex = items.length - 1;

  const colorFor = (name: string): string => {
    const semantic = (LL_POINTER_COLORS as Record<string, string>)[name];
    if (semantic) return semantic;
    return pointerColorMap[name] || POINTER_PALETTE[0];
  };

  const nodeState = (i: number): string => {
    if ((frame.swapping || []).includes(i)) return 'swapping';
    if ((frame.finalized || []).includes(i)) return 'finalized';
    if ((frame.highlights || []).includes(i)) return 'highlight';
    return 'default';
  };

  const pointersByIdx: Record<number, WalkthroughPointer[]> = {};
  for (const p of pointers) {
    (pointersByIdx[p.index] = pointersByIdx[p.index] || []).push(p);
  }

  // Render top → bottom: reverse the array order visually.
  const visualOrder = items.map((v: string | number, i: number) => ({ v, i })).reverse();

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      padding: '6px 0',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch',
        gap: 4, position: 'relative',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: 1,
          fontFamily: MONO, textAlign: 'center', marginBottom: 2,
          opacity: items.length === 0 ? 0.4 : 1,
        }}>
          {items.length === 0 ? 'empty stack' : 'top'}
        </div>

        {visualOrder.map(({ v, i }: { v: string | number; i: number }) => {
          const c = (STACK_NODE_COLORS as Record<string, CellColor>)[nodeState(i)] || STACK_NODE_COLORS.default;
          const ptrs = pointersByIdx[i] || [];
          const isTop = i === topIndex;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                minWidth: STACK_NODE_W, minHeight: STACK_NODE_H,
                padding: '6px 14px',
                display: 'grid', placeItems: 'center',
                background: c.bg,
                border: `2px solid ${c.border}`,
                borderRadius: 8,
                fontFamily: MONO, fontWeight: 700, fontSize: 15,
                color: c.text, transition: 'all 300ms ease',
                boxShadow: nodeState(i) !== 'default'
                  ? `0 0 0 4px ${c.border}33` : 'none',
              }}>
                {v}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 2, minWidth: 80,
              }}>
                {isTop && ptrs.length === 0 && (
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#22c55e',
                    fontFamily: MONO, padding: '1px 8px',
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    borderRadius: 6,
                  }}>
                    ← top
                  </div>
                )}
                {ptrs.map((p, k) => (
                  <StackPointerChip key={k} name={p.name} color={colorFor(p.name)} />
                ))}
              </div>
            </div>
          );
        })}

        <div style={{
          height: 4, background: '#374151', borderRadius: 2,
          marginTop: 2,
        }} />
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: 1,
          fontFamily: MONO, textAlign: 'center',
        }}>
          base
        </div>
      </div>
    </div>
  );
};

// Renders one row of cells for a single frame (the existing single-array shape).
// A frame is { array, pointers, highlights, swapping, finalized, label? }.
// A frame is { array, pointers, highlights, swapping, finalized, label? }
// or { matrix, highlights, swapping, finalized, label? } for 2D mode.
const FrameRow = ({ frame, pointerColorMap, isDark }: { frame: WalkthroughFrame; pointerColorMap: Record<string, string>; isDark: boolean }) => {
  // Specialised data-structure renderers (tree, trie, graph, interval).
  if (frame.kind === 'tree' || frame.kind === 'heap') {
    if (!frame.label) return <BinaryTreeRenderer frame={frame as never} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4, textAlign: 'center',
        }}>
          {frame.label}
        </div>
        <BinaryTreeRenderer frame={frame as never} />
      </div>
    );
  }
  if (frame.kind === 'trie') {
    if (!frame.label) return <TrieRenderer frame={frame as never} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4, textAlign: 'center',
        }}>
          {frame.label}
        </div>
        <TrieRenderer frame={frame as never} />
      </div>
    );
  }
  if (frame.kind === 'graph') {
    if (!frame.label) return <GraphRenderer frame={frame as never} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4, textAlign: 'center',
        }}>
          {frame.label}
        </div>
        <GraphRenderer frame={frame as never} />
      </div>
    );
  }
  if (frame.kind === 'interval') {
    if (!frame.label) return <IntervalTimeline frame={frame as never} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4, textAlign: 'center',
        }}>
          {frame.label}
        </div>
        <IntervalTimeline frame={frame as never} />
      </div>
    );
  }

  // Stack column rendering (vertical, top at top)
  if (frame.stackMode) {
    if (!frame.label) {
      return <StackColumn frame={frame} pointerColorMap={pointerColorMap} />;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4, textAlign: 'center',
        }}>
          {frame.label}
        </div>
        <StackColumn frame={frame} pointerColorMap={pointerColorMap} />
      </div>
    );
  }

  // Linked-list chain rendering (nodes + arrows + null terminator)
  if (frame.linked) {
    if (!frame.label) {
      return <LinkedListChain frame={frame} pointerColorMap={pointerColorMap} />;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4,
        }}>
          {frame.label}
        </div>
        <LinkedListChain frame={frame} pointerColorMap={pointerColorMap} />
      </div>
    );
  }

  // 2D matrix mode
  if (frame.matrix) {
    if (!frame.label) return <MatrixGrid frame={frame} isDark={isDark} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: isDark ? '#9ca3af' : '#4b5563',
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: MONO, paddingLeft: 4,
        }}>
          {frame.label}
        </div>
        <MatrixGrid frame={frame} isDark={isDark} />
      </div>
    );
  }

  const cellState = (i: number): string => {
    if ((frame.swapping || []).includes(i)) return 'swapping';
    if ((frame.finalized || []).includes(i)) return 'finalized';
    if ((frame.highlights || []).includes(i)) return 'highlight';
    return 'default';
  };

  const pointers = frame.pointers || [];
  const reserveAbove = pointers.some((p: WalkthroughPointer) => (p.position || 'above') === 'above');
  const reserveBelow = pointers.some((p: WalkthroughPointer) => p.position === 'below');

  const abovePointersByIndex: Record<number, WalkthroughPointer[]> = {};
  const belowPointersByIndex: Record<number, WalkthroughPointer[]> = {};
  for (const p of pointers) {
    const bucket = p.position === 'below' ? belowPointersByIndex : abovePointersByIndex;
    (bucket[p.index] = bucket[p.index] || []).push(p);
  }

  const cellsRow = (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '14px 10px',
      alignItems: 'flex-start', justifyContent: 'center',
    }}>
      {(frame.array || []).map((v: string | number, i: number) => (
        <CellUnit
          key={i}
          value={v}
          index={i}
          cellState={cellState(i)}
          pointersAbove={abovePointersByIndex[i] || []}
          pointersBelow={belowPointersByIndex[i] || []}
          pointerColorMap={pointerColorMap}
          reserveAbove={reserveAbove}
          reserveBelow={reserveBelow}
        />
      ))}
      {(!frame.array || frame.array.length === 0) && (
        <div style={{
          minHeight: 52, padding: '14px 18px',
          color: isDark ? '#6b7280' : '#9ca3af',
          fontFamily: MONO, fontSize: 13, fontStyle: 'italic',
        }}>(empty)</div>
      )}
    </div>
  );

  if (!frame.label) return cellsRow;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: isDark ? '#9ca3af' : '#4b5563',
        textTransform: 'uppercase', letterSpacing: 0.6,
        fontFamily: MONO, paddingLeft: 4,
      }}>
        {frame.label}
      </div>
      {cellsRow}
    </div>
  );
};

// A step is rendered either as a single frame (legacy: step.array) or as a stack
// of frames (new: step.frames). The stacked layout is what powers Merge / Counting /
// Bucket / Radix where multiple arrays evolve simultaneously.
const StepFrame = ({ step, pointerColorMap, isDark, linked, stackMode }: {
  step: WalkthroughFrame; pointerColorMap: Record<string, string>; isDark: boolean; linked?: boolean; stackMode?: boolean;
}) => {
  const frames: WalkthroughFrame[] = step.frames && step.frames.length > 0
    ? step.frames
    : [{
        array: step.array,
        matrix: step.matrix,
        kind: step.kind,
        pointers: step.pointers,
        highlights: step.highlights,
        swapping: step.swapping,
        finalized: step.finalized,
        label: step.label,
      }];

  const decorated: WalkthroughFrame[] = frames.map((f: WalkthroughFrame) => {
    if (f.kind) return f;
    if (f.matrix) return f;
    if (stackMode && f.stackMode === undefined) return { ...f, stackMode: true };
    if (linked && f.linked === undefined) return { ...f, linked: true };
    return f;
  });

  if (decorated.length === 1) {
    return <FrameRow frame={decorated[0]} pointerColorMap={pointerColorMap} isDark={isDark} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {decorated.map((f: WalkthroughFrame, i: number) => (
        <FrameRow key={i} frame={f} pointerColorMap={pointerColorMap} isDark={isDark} />
      ))}
    </div>
  );
};

const ArrayWalkthrough = ({ title, steps = [], isDark = true, bare = false, linked = false, stackMode = false }: { title?: string; steps?: WalkthroughFrame[]; isDark?: boolean; bare?: boolean; linked?: boolean; stackMode?: boolean }) => {
  const [idx, setIdx] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState(1);
  const [viewMode, setViewMode] = useState('animation'); // 'animation' | 'list'
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevViewMode, setPrevViewMode] = useState(viewMode);
  if (viewMode !== prevViewMode) {
    setPrevViewMode(viewMode);
    if (viewMode === 'list') setPlaying(false);
  }

  const total = steps.length;
  const step: WalkthroughFrame = steps[idx] || {};

  // Assign a stable color per pointer name across steps (and across multi-frame steps).
  const pointerColorMap = useMemo(() => {
    const collectFromFrame = (f: WalkthroughFrame | undefined): string[] => (f && f.pointers) ? f.pointers.map((p: WalkthroughPointer) => p.name) : [];
    const names = Array.from(
      new Set(steps.flatMap((s: WalkthroughFrame) => [
        ...collectFromFrame(s),
        ...((s.frames || []).flatMap(collectFromFrame)),
      ]))
    );
    return Object.fromEntries(
      names.map((n: string, i: number) => [n, POINTER_PALETTE[i % POINTER_PALETTE.length]])
    ) as Record<string, string>;
  }, [steps]);

  // Auto-play (animation mode only).
  useEffect(() => {
    if (viewMode !== 'animation' || !playing || total < 2) return undefined;
    timer.current = setTimeout(() => {
      setIdx((v) => {
        if (v + 1 >= total) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, Math.max(200, 1200 / speed));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [viewMode, playing, idx, speed, total]);

  const hasPlayback = total > 1 && viewMode === 'animation';
  const hasToggle = total > 1;

  const panel: React.CSSProperties = bare
    ? { padding: 0, margin: '14px 0' }
    : {
        background: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(246,248,250,0.9)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 14, padding: 20, margin: '20px 0',
        position: 'relative',
      };

  const btn = {
    display: 'grid', placeItems: 'center',
    width: 36, height: 36, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    background: 'transparent', color: isDark ? '#e5e5e5' : '#1f2937',
    borderRadius: 8, cursor: 'pointer',
  };

  const toggleBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', fontSize: 12, fontWeight: 600,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'}`,
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    color: isDark ? '#e5e5e5' : '#1f2937',
    borderRadius: 8, cursor: 'pointer',
    fontFamily: MONO,
  };

  return (
    <div style={panel} data-testid="array-walkthrough">
      {title && (
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isDark ? '#9ca3af' : '#4b5563',
          marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12,
        }}>
          <span>{title}</span>
        </div>
      )}

      {/* Top-right view mode toggle */}
      {hasToggle && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end', marginBottom: 14,
        }}>
          {viewMode === 'animation' ? (
            <button
              style={toggleBtnStyle}
              onClick={() => setViewMode('list')}
              data-testid="walkthrough-view-list"
              aria-label="Switch to list view"
            >
              <List size={14} /> List
            </button>
          ) : (
            <button
              style={toggleBtnStyle}
              onClick={() => setViewMode('animation')}
              data-testid="walkthrough-view-animate"
              aria-label="Switch to animation view"
            >
              <Film size={14} /> Animate
            </button>
          )}
        </div>
      )}

      {viewMode === 'animation' ? (
        <>
          <StepDescription index={idx} description={step.description} isDark={isDark} />
          <StepFrame step={step} pointerColorMap={pointerColorMap} isDark={isDark} linked={linked} stackMode={stackMode} />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {steps.map((s, i) => (
            <div key={i} data-testid={`walkthrough-list-step-${i}`}>
              <StepDescription index={i} description={s.description} isDark={isDark} />
              <StepFrame step={s} pointerColorMap={pointerColorMap} isDark={isDark} linked={linked} stackMode={stackMode} />
            </div>
          ))}
        </div>
      )}

      {hasPlayback && (
        <div style={{
          marginTop: 20, display: 'flex', alignItems: 'center', gap: 12,
          flexWrap: 'wrap', justifyContent: 'space-between',
        }}>
          {/* step dots */}
          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 160 }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPlaying(false); setIdx(i); }}
                data-testid={`walkthrough-step-${i}`}
                style={{
                  flex: 1, maxWidth: 32, height: 6, padding: 0,
                  border: 'none', borderRadius: 3, cursor: 'pointer',
                  background: i === idx ? '#22c55e' : (i < idx ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.12)'),
                }}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* playback controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={btn} onClick={() => { setPlaying(false); setIdx(0); }} data-testid="walkthrough-reset" aria-label="Reset">
              <RotateCcw size={16} />
            </button>
            <button style={btn} onClick={() => { setPlaying(false); setIdx((v) => Math.max(0, v - 1)); }} data-testid="walkthrough-prev" aria-label="Previous">
              <SkipBack size={16} />
            </button>
            <button
              style={{ ...btn, background: '#22c55e', color: '#0a0a0a', border: 'none' }}
              onClick={() => setPlaying((p) => !p)}
              data-testid="walkthrough-play"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button style={btn} onClick={() => { setPlaying(false); setIdx((v) => Math.min(total - 1, v + 1)); }} data-testid="walkthrough-next" aria-label="Next">
              <SkipForward size={16} />
            </button>
          </div>

          {/* counter + speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#4b5563', fontFamily: MONO }}>
              {idx + 1}/{total}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  data-testid={`walkthrough-speed-${s}`}
                  style={{
                    padding: '4px 8px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                    border: `1px solid ${s === speed ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                    background: s === speed ? 'rgba(34,197,94,0.15)' : 'transparent',
                    color: s === speed ? '#22c55e' : (isDark ? '#9ca3af' : '#4b5563'),
                    cursor: 'pointer', fontFamily: MONO,
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrayWalkthrough;
