'use client';
import { useMemo } from 'react';

interface StateColor {
  bg: string;
  border: string;
  text: string;
}

interface EdgeLabel {
  text: string;
  tone: string;
}

interface PathOverlay {
  nodes: (string | number)[];
  tone: string;
  animate: boolean;
  label?: string;
}

interface PointerDef {
  name: string;
  index?: number;
  id?: string | number;
  idx?: number;
  position?: 'above' | 'below';
  value?: number;
}

interface BinaryTreeFrame {
  tree?: (number | null | undefined)[];
  highlights?: number[];
  finalized?: number[];
  swapping?: number[];
  visited?: number[];
  pointers?: PointerDef[];
  show_indices?: boolean;
  edge_labels?: Record<string, unknown>;
  node_labels?: Record<string, unknown>;
  path_overlay?: unknown;
}

interface TrieNode {
  id: string | number;
  parent: string | number | null;
  label?: string;
  terminal?: boolean;
}

interface TrieFrame {
  trie_nodes?: TrieNode[];
  highlights?: (string | number)[];
  visited?: (string | number)[];
  finalized?: (string | number)[];
  pointers?: PointerDef[];
}

interface GraphNode {
  id: string | number;
  label?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  from: string | number;
  to: string | number;
  directed?: boolean;
  weight?: number;
  label?: unknown;
  tone?: string;
  path?: boolean;
}

interface GraphFrame {
  graph_nodes?: GraphNode[];
  graph_edges?: GraphEdge[];
  highlights?: (string | number)[];
  visited?: (string | number)[];
  path?: (string | number)[];
  finalized?: (string | number)[];
  current?: string | number | null;
  pointers?: PointerDef[];
  path_overlay?: unknown;
}

interface IntervalFrame {
  intervals?: [number, number, string?][];
  scale?: [number, number];
  highlights?: number[];
  finalized?: number[];
  swapping?: number[];
  pointers?: PointerDef[];
}

interface Position {
  x: number;
  y: number;
}

/**
 * TreeGraphRenderers — visual renderers for non-array data structures.
 *
 *   - BinaryTreeRenderer: level-order array → positioned binary-tree nodes.
 *     Used for binary trees, BSTs, heaps (with array-index annotations).
 *   - TrieRenderer: explicit nodes + parent edges with character labels and
 *     terminal markers.
 *   - GraphRenderer: explicit nodes + edges with optional directed arrows,
 *     edge weights, visited/path coloring.
 *   - IntervalTimeline: horizontal number-line with coloured interval bars.
 *
 * All renderers consume a single `frame` object and an `isDark` boolean.
 * They are dispatched by `ArrayWalkthrough.FrameRow` on `frame.kind`:
 *   - 'tree'      → BinaryTreeRenderer
 *   - 'trie'      → TrieRenderer
 *   - 'graph'     → GraphRenderer
 *   - 'interval'  → IntervalTimeline
 */

const MONO = 'ui-monospace,SFMono-Regular,monospace';

// Shared node-state palette (reused across all renderers).
const STATES: Record<string, StateColor> = {
  default:   { bg: '#0d1117',                  border: '#30363d', text: '#e5e5e5' },
  highlight: { bg: 'rgba(234,179,8,0.16)',     border: '#eab308', text: '#fde68a' },
  swapping:  { bg: 'rgba(248,113,113,0.18)',   border: '#f87171', text: '#fecaca' },
  finalized: { bg: 'rgba(34,197,94,0.18)',     border: '#16a34a', text: '#dcfce7' },
  visited:   { bg: 'rgba(59,130,246,0.16)',    border: '#3b82f6', text: '#bfdbfe' },
  path:      { bg: 'rgba(168,85,247,0.18)',    border: '#a855f7', text: '#e9d5ff' },
  current:   { bg: 'rgba(34,197,94,0.18)',     border: '#22c55e', text: '#bbf7d0' },
  null:      { bg: 'transparent',              border: '#374151', text: '#6b7280' },
  terminal:  { bg: 'rgba(34,197,94,0.22)',     border: '#22c55e', text: '#dcfce7' },
};

const POINTER_PALETTE = ['#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899', '#22c55e'];

// Per-tone colour palette for tier-coloured edge tags (used by both
// BinaryTreeRenderer and GraphRenderer). Keys mirror the node STATES palette
// so authors can re-use the same vocabulary across nodes and edges.
const EDGE_TONES: Record<string, StateColor> = {
  default:   { bg: '#0d1117',                  border: '#374151', text: '#d1d5db' },
  highlight: { bg: 'rgba(234,179,8,0.18)',     border: '#eab308', text: '#fde68a' },
  swapping:  { bg: 'rgba(248,113,113,0.18)',   border: '#f87171', text: '#fecaca' },
  finalized: { bg: 'rgba(34,197,94,0.18)',     border: '#16a34a', text: '#dcfce7' },
  visited:   { bg: 'rgba(59,130,246,0.18)',    border: '#3b82f6', text: '#bfdbfe' },
  accent:    { bg: 'rgba(168,85,247,0.18)',    border: '#a855f7', text: '#e9d5ff' },
};

// Normalise a label that can be a plain string or { text, tone }.
const normaliseEdgeLabel = (val: unknown): EdgeLabel | null => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'object' && val !== null) {
    const obj = val as { text?: string; tone?: string };
    return { text: String(obj.text ?? ''), tone: obj.tone && EDGE_TONES[obj.tone] ? obj.tone : 'default' };
  }
  return { text: String(val), tone: 'default' };
};

// Normalise frame.path_overlay → array of { nodes:[], tone, animate }.
const normalisePathOverlays = (raw: unknown): PathOverlay[] => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((o: Record<string, unknown>) => ({
      nodes: Array.isArray(o.nodes) ? (o.nodes as (string | number)[]) : [],
      tone: o.tone && EDGE_TONES[o.tone as string] ? (o.tone as string) : 'highlight',
      animate: o.animate !== false, // default ON
      label: o.label as string | undefined,
    }))
    .filter((o: { nodes: (string | number)[] }) => o.nodes.length >= 2);
};

interface PathOverlayLayerProps {
  overlays: PathOverlay[];
  positionOf: (id: string | number) => Position | undefined;
  offsetX?: number;
}

// Renders one or more thick semi-transparent ribbons following a sequence of
// node positions. Used by BinaryTreeRenderer (positions indexed by array idx)
// and GraphRenderer (positions indexed by node id) — pass the corresponding
// positionOf accessor.
const PathOverlayLayer = ({ overlays, positionOf, offsetX = 0 }: PathOverlayLayerProps) => {
  if (!overlays.length) return null;
  return (
    <g>
      {overlays.map((ov: PathOverlay, oi: number) => {
        const pts = ov.nodes
          .map((n: string | number) => positionOf(n))
          .filter((p): p is Position => p !== undefined)
          .map((p: Position) => `${p.x + offsetX},${p.y}`)
          .join(' ');
        if (!pts) return null;
        const tone = EDGE_TONES[ov.tone] || EDGE_TONES.highlight;
        return (
          <g key={`po-${oi}`}>
            <polyline
              points={pts}
              fill="none"
              stroke={tone.border}
              strokeOpacity={0.30}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={pts}
              fill="none"
              stroke={tone.border}
              strokeOpacity={0.85}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={ov.animate ? '6 6' : undefined}
            >
              {ov.animate && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-12"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              )}
            </polyline>
          </g>
        );
      })}
    </g>
  );
};

// Builds {pointerName: color} map from a frame's pointer list.
function buildPointerColorMap(pointers: PointerDef[] = []): Record<string, string> {
  const map: Record<string, string> = {};
  let i = 0;
  for (const p of pointers) {
    if (p.name && !map[p.name]) {
      map[p.name] = POINTER_PALETTE[i % POINTER_PALETTE.length];
      i++;
    }
  }
  return map;
}

// ─── BinaryTreeRenderer ──────────────────────────────────────────────────
// Renders a level-order array `[1, 2, 3, null, 4]` as a positioned tree.
// Indexing matches Python list indexing (0-based). For n nodes, depth = log2(n+1).
//
// Frame schema:
//   {
//     kind: 'tree',
//     tree: [vals...]                       // level-order, null for missing
//     highlights: [idx],                     // yellow nodes
//     finalized: [idx],                      // green nodes
//     swapping: [idx],                       // red (used for heap sift)
//     visited: [idx],                        // blue (DFS/BFS marked)
//     pointers: [{name, idx, position}]      // pointer chip near a node
//     show_indices: bool                     // print array indices below each node
//     edge_labels: { idx: 'L' | { text, tone } }  // label on edge from parent → idx;
//                                                  // tone ∈ default | highlight | visited |
//                                                  //        swapping | finalized | accent
//     node_labels: { idx: 'visit'|... }      // small text under the node, coloured to match its state
//   }
const BinaryTreeRenderer = ({ frame }: { frame: BinaryTreeFrame }) => {
  const tree = frame.tree || [];
  const n = tree.length;

  interface TreeNodeLayout {
    x: number;
    y: number;
    level: number;
    idxInLevel: number;
  }

  // Compute positions via level-order layout.
  // Each level fits within the same horizontal band, evenly spaced.
  const layout = useMemo(() => {
    const levels = Math.max(1, Math.ceil(Math.log2(n + 1)));
    const NODE_W = 44;
    const LEVEL_H = 70;
    const pad = 14;
    const lastLevelCount = Math.pow(2, levels - 1);
    // Width = lastLevelCount * (NODE_W + gap)
    const gap = 16;
    const width = lastLevelCount * (NODE_W + gap);
    const positions: TreeNodeLayout[] = [];
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const idxInLevel = i - (Math.pow(2, level) - 1);
      const slotsInLevel = Math.pow(2, level);
      const slotWidth = width / slotsInLevel;
      const x = idxInLevel * slotWidth + slotWidth / 2;
      const y = level * LEVEL_H + NODE_W / 2 + pad;
      positions.push({ x, y, level, idxInLevel });
    }
    const height = levels * LEVEL_H + pad * 2;
    return { positions, width: width + pad * 2, height, NODE_W };
  }, [n]);

  if (n === 0) {
    return (
      <div style={{ padding: 24, color: '#6b7280', fontFamily: MONO, fontStyle: 'italic' }}>
        (empty tree)
      </div>
    );
  }

  const stateOf = (i: number): string => {
    if ((frame.swapping || []).includes(i)) return 'swapping';
    if ((frame.finalized || []).includes(i)) return 'finalized';
    if ((frame.highlights || []).includes(i)) return 'highlight';
    if ((frame.visited || []).includes(i)) return 'visited';
    return 'default';
  };

  const pointerColorMap = buildPointerColorMap(frame.pointers || []);
  const pointersByIdx: Record<number, PointerDef[]> = {};
  for (const p of (frame.pointers || [])) {
    const idx = p.idx ?? 0;
    (pointersByIdx[idx] = pointersByIdx[idx] || []).push(p);
  }

  const { positions, width, height, NODE_W } = layout;
  const offsetX = 14; // matches `pad`
  const pathOverlays = normalisePathOverlays(frame.path_overlay);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* edges first so nodes render on top */}
        {positions.map((pos, i) => {
          if (i === 0) return null;
          const parentIdx = Math.floor((i - 1) / 2);
          if (tree[parentIdx] === null || tree[parentIdx] === undefined) return null;
          if (tree[i] === null || tree[i] === undefined) return null;
          const p = positions[parentIdx];
          const stroke = '#374151';
          return (
            <g key={`e-${i}`}>
              <line
                x1={p.x + offsetX} y1={p.y}
                x2={pos.x + offsetX} y2={pos.y}
                stroke={stroke} strokeWidth={1.5}
              />
              {(() => {
                const edgeLbl = frame.edge_labels && normaliseEdgeLabel((frame.edge_labels as Record<string, unknown>)[i]);
                if (!edgeLbl) return null;
                const tone = EDGE_TONES[edgeLbl.tone] || EDGE_TONES.default;
                const mx = (p.x + pos.x) / 2 + offsetX;
                const my = (p.y + pos.y) / 2;
                const w = Math.max(20, edgeLbl.text.length * 7 + 8);
                return (
                  <g>
                    <rect
                      x={mx - w / 2} y={my - 8} width={w} height={14} rx={3}
                      fill={tone.bg} stroke={tone.border} strokeWidth={1}
                    />
                    <text
                      x={mx} y={my + 3}
                      textAnchor="middle"
                      fill={tone.text} fontFamily={MONO} fontSize={10} fontWeight={700}
                    >
                      {edgeLbl.text}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}

        {/* path overlays — rendered on top of edges, beneath nodes */}
        <PathOverlayLayer
          overlays={pathOverlays}
          positionOf={(i: string | number) => positions[i as number]}
          offsetX={offsetX}
        />

        {/* nodes */}
        {tree.map((v: number | null | undefined, i: number) => {
          const isNull = v === null || v === undefined;
          const cs = isNull ? STATES.null : STATES[stateOf(i)] || STATES.default;
          const pos = positions[i];
          const ptrs = pointersByIdx[i] || [];
          return (
            <g key={`n-${i}`}>
              <circle
                cx={pos.x + offsetX} cy={pos.y}
                r={NODE_W / 2}
                fill={cs.bg}
                stroke={cs.border}
                strokeWidth={2}
                strokeDasharray={isNull ? '4 3' : undefined}
              />
              <text
                x={pos.x + offsetX} y={pos.y + 5}
                textAnchor="middle"
                fill={cs.text}
                fontFamily={MONO} fontWeight={700} fontSize={14}
              >
                {isNull ? '∅' : String(v)}
              </text>
              {frame.show_indices && !isNull && (
                <text
                  x={pos.x + offsetX} y={pos.y + NODE_W / 2 + 12}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontFamily={MONO} fontSize={9}
                >
                  [{i}]
                </text>
              )}
              {frame.node_labels && frame.node_labels[i] !== undefined && !isNull && (
                <text
                  x={pos.x + offsetX} y={pos.y + NODE_W / 2 + (frame.show_indices ? 24 : 12)}
                  textAnchor="middle"
                  fill={cs.border}
                  fontFamily={MONO} fontSize={10} fontWeight={600}
                >
                  {String((frame.node_labels as Record<string, unknown>)?.[String(i)] ?? '')}
                </text>
              )}
              {ptrs.map((p: PointerDef, j: number) => {
                const color = pointerColorMap[p.name] || POINTER_PALETTE[0];
                const above = (p.position || 'above') === 'above';
                const yChip = above ? pos.y - NODE_W / 2 - 14 - j * 18 : pos.y + NODE_W / 2 + 14 + j * 18;
                return (
                  <g key={`p-${i}-${j}`}>
                    <rect
                      x={pos.x + offsetX - 22} y={yChip - 8}
                      width={44} height={16} rx={4}
                      fill={`${color}22`} stroke={`${color}66`} strokeWidth={1}
                    />
                    <text
                      x={pos.x + offsetX} y={yChip + 3}
                      textAnchor="middle"
                      fill={color} fontFamily={MONO} fontWeight={700} fontSize={10}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── TrieRenderer ────────────────────────────────────────────────────────
// Frame schema:
//   {
//     kind: 'trie',
//     trie_nodes: [{id, parent, label, terminal?}]   // root has parent=null
//     highlights: [id], visited: [id], finalized: [id]
//     pointers: [{name, id, position?}]
//   }
const TrieRenderer = ({ frame }: { frame: TrieFrame }) => {
  const nodes = useMemo(() => frame.trie_nodes || [], [frame.trie_nodes]);

  interface TrieNodeLayout {
    x: number;
    y: number;
    level: number;
  }

  interface TrieLayoutNode extends TrieNode {
    children: TrieLayoutNode[];
    _leaves: number;
  }

  // Build BFS layout: each child placed below its parent, siblings spread.
  const layout = useMemo(() => {
    const byId: Record<string | number, TrieLayoutNode> = {};
    nodes.forEach((n: TrieNode) => { byId[n.id] = { ...n, children: [], _leaves: 0 }; });
    let root: TrieLayoutNode | null = null;
    nodes.forEach((n: TrieNode) => {
      if (n.parent !== null && n.parent !== undefined && byId[n.parent]) {
        byId[n.parent].children.push(byId[n.id]);
      } else if (byId[n.id]) {
        root = byId[n.id];
      }
    });
    if (!root) return { positions: {} as Record<string | number, TrieNodeLayout>, byId: {} as Record<string | number, TrieLayoutNode>, width: 200, height: 60, NODE_W: 36 };

    const NODE_W = 36;
    const LEVEL_H = 64;

    // First pass: compute subtree leaf counts to allocate horizontal slots.
    const leafCount = (node: TrieLayoutNode): number => {
      if (node.children.length === 0) { node._leaves = 1; return 1; }
      let c = 0;
      for (const ch of node.children) c += leafCount(ch);
      node._leaves = c;
      return c;
    };
    leafCount(root);

    const SLOT_W = 50;
    const totalLeaves = (root as TrieLayoutNode)._leaves;
    const width = Math.max(200, totalLeaves * SLOT_W);

    const positions: Record<string | number, TrieNodeLayout> = {};
    const place = (node: TrieLayoutNode, left: number, right: number, level: number): void => {
      const cx = (left + right) / 2;
      positions[node.id] = { x: cx, y: level * LEVEL_H + NODE_W / 2 + 12, level };
      let cursor = left;
      for (const ch of node.children) {
        const slot = (ch._leaves / totalLeaves) * (right - left);
        place(ch, cursor, cursor + slot, level + 1);
        cursor += slot;
      }
    };
    place(root, 0, width, 0);

    let maxLevel = 0;
    Object.values(positions).forEach((p: TrieNodeLayout) => { if (p.level > maxLevel) maxLevel = p.level; });
    const height = (maxLevel + 1) * LEVEL_H + 40;
    return { positions, width, height, NODE_W, byId };
  }, [nodes]);

  if (nodes.length === 0) {
    return <div style={{ padding: 24, color: '#6b7280', fontFamily: MONO, fontStyle: 'italic' }}>(empty trie)</div>;
  }

  const stateOf = (id: string | number): string => {
    if ((frame.finalized || []).includes(id)) return 'finalized';
    if ((frame.highlights || []).includes(id)) return 'highlight';
    if ((frame.visited || []).includes(id)) return 'visited';
    return 'default';
  };

  const pointerColorMap = buildPointerColorMap(frame.pointers || []);
  const pointersById: Record<string | number, PointerDef[]> = {};
  for (const p of (frame.pointers || [])) {
    if (p.id !== undefined) {
      (pointersById[p.id] = pointersById[p.id] || []).push(p);
    }
  }

  const { positions, width, height, NODE_W = 36, byId = {} } = layout;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* edges */}
        {nodes.map((n: TrieNode) => {
          if (n.parent === null || n.parent === undefined || !positions[n.parent]) return null;
          const a = positions[n.parent]!, b = positions[n.id]!;
          return (
            <g key={`te-${n.id}`}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#374151" strokeWidth={1.5}
              />
              {n.label !== undefined && (
                <text
                  x={(a.x + b.x) / 2 + 8}
                  y={(a.y + b.y) / 2 - 2}
                  fill="#a3a3a3" fontFamily={MONO} fontSize={11} fontWeight={700}
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n: TrieNode) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const isTerminal = !!n.terminal;
          const baseState = stateOf(n.id);
          const cs = isTerminal && baseState === 'default'
            ? STATES.terminal
            : STATES[baseState] || STATES.default;
          const ptrs = pointersById[n.id] || [];
          const labelText = byId && byId[n.id] && byId[n.id].parent === null ? '·' : '';
          return (
            <g key={`tn-${n.id}`}>
              {isTerminal && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={NODE_W / 2 + 4}
                  fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 3"
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={NODE_W / 2}
                fill={cs.bg} stroke={cs.border} strokeWidth={2}
              />
              <text
                x={pos.x} y={pos.y + 4}
                textAnchor="middle"
                fill={cs.text} fontFamily={MONO} fontSize={11} fontWeight={700}
              >
                {labelText}
              </text>
              {ptrs.map((p: PointerDef, j: number) => {
                const color = pointerColorMap[p.name] || POINTER_PALETTE[0];
                const yChip = pos.y - NODE_W / 2 - 14 - j * 18;
                return (
                  <g key={`tp-${n.id}-${j}`}>
                    <rect
                      x={pos.x - 22} y={yChip - 8}
                      width={44} height={16} rx={4}
                      fill={`${color}22`} stroke={`${color}66`}
                    />
                    <text
                      x={pos.x} y={yChip + 3}
                      textAnchor="middle"
                      fill={color} fontFamily={MONO} fontWeight={700} fontSize={10}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── GraphRenderer ───────────────────────────────────────────────────────
// Frame schema:
//   {
//     kind: 'graph',
//     graph_nodes: [{id, label?, x?, y?}]   // x,y in 0..1 range; if absent, auto-circular layout
//     graph_edges: [{from, to, directed?, weight?, label?}]
//     highlights: [id], visited: [id], path: [id], current: id|null
//     pointers: [{name, id, position?}]
//   }
const GraphRenderer = ({ frame }: { frame: GraphFrame }) => {
  const nodes = useMemo(() => frame.graph_nodes || [], [frame.graph_nodes]);
  const edges = frame.graph_edges || [];

  const layout = useMemo(() => {
    const W = 460, H = 280;
    const positions: Record<string | number, Position> = {};
    // Auto-layout: circle if no coords given.
    const haveCoords = nodes.every((n: GraphNode) => typeof n.x === 'number' && typeof n.y === 'number');
    if (haveCoords) {
      const pad = 36;
      nodes.forEach((n: GraphNode) => {
        positions[n.id] = {
          x: pad + (n.x ?? 0) * (W - 2 * pad),
          y: pad + (n.y ?? 0) * (H - 2 * pad),
        };
      });
    } else {
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 36;
      const N = nodes.length;
      nodes.forEach((n: GraphNode, i: number) => {
        const ang = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, N);
        positions[n.id] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
      });
    }
    return { positions, width: W, height: H };
  }, [nodes]);

  if (nodes.length === 0) {
    return <div style={{ padding: 24, color: '#6b7280', fontFamily: MONO, fontStyle: 'italic' }}>(empty graph)</div>;
  }

  const stateOf = (id: string | number): string => {
    if (frame.current === id) return 'current';
    if ((frame.path || []).includes(id)) return 'path';
    if ((frame.finalized || []).includes(id)) return 'finalized';
    if ((frame.highlights || []).includes(id)) return 'highlight';
    if ((frame.visited || []).includes(id)) return 'visited';
    return 'default';
  };

  const pointerColorMap = buildPointerColorMap(frame.pointers || []);
  const pointersById: Record<string | number, PointerDef[]> = {};
  for (const p of (frame.pointers || [])) {
    if (p.id !== undefined) {
      (pointersById[p.id] = pointersById[p.id] || []).push(p);
    }
  }

  const { positions, width, height } = layout;
  const NODE_R = 22;

  // Identify edges that should appear as part of the active path/visited tree.
  const isPathEdge = (e: GraphEdge): boolean => {
    const path = frame.path || [];
    if (path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === e.from && path[i + 1] === e.to) ||
          (!e.directed && path[i] === e.to && path[i + 1] === e.from)) return true;
    }
    return false;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <marker id="gr-arrow-default" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
          </marker>
          <marker id="gr-arrow-path" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
          </marker>
        </defs>

        {/* edges */}
        {edges.map((e: GraphEdge, i: number) => {
          const a = positions[e.from], b = positions[e.to];
          if (!a || !b) return null;
          const onPath = isPathEdge(e);
          const toneSpec = e.tone ? EDGE_TONES[e.tone] : undefined;
          const stroke = toneSpec ? toneSpec.border : (onPath ? '#a855f7' : '#4b5563');
          const sw = toneSpec ? 2.5 : (onPath ? 2.5 : 1.5);
          // shorten so arrowhead doesn't overlap node
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const ux = dx / len, uy = dy / len;
          const x1 = a.x + ux * NODE_R, y1 = a.y + uy * NODE_R;
          const x2 = b.x - ux * NODE_R, y2 = b.y - uy * NODE_R;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          return (
            <g key={`ge-${i}`}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={stroke} strokeWidth={sw}
                markerEnd={e.directed ? (onPath ? 'url(#gr-arrow-path)' : 'url(#gr-arrow-default)') : undefined}
              />
              {(e.weight !== undefined || e.label !== undefined) && (() => {
                const raw = e.label !== undefined ? e.label : e.weight;
                const lbl = normaliseEdgeLabel(typeof raw === 'object' ? raw : { text: String(raw), tone: e.tone });
                if (!lbl) return null;
                const tone = EDGE_TONES[lbl.tone] || EDGE_TONES.default;
                const w = Math.max(24, lbl.text.length * 7 + 8);
                return (
                  <g>
                    <rect
                      x={mx - w / 2} y={my - 8} width={w} height={14} rx={3}
                      fill={tone.bg} stroke={tone.border} strokeWidth={1}
                    />
                    <text
                      x={mx} y={my + 3}
                      textAnchor="middle"
                      fill={tone.text} fontFamily={MONO} fontSize={10} fontWeight={700}
                    >
                      {lbl.text}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}

        {/* path overlays */}
        <PathOverlayLayer
          overlays={normalisePathOverlays(frame.path_overlay)}
          positionOf={(id: string | number) => positions[id]}
        />

        {/* nodes */}
        {nodes.map((n: GraphNode) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const cs = STATES[stateOf(n.id)] || STATES.default;
          const ptrs = pointersById[n.id] || [];
          return (
            <g key={`gn-${n.id}`}>
              <circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={cs.bg} stroke={cs.border} strokeWidth={2}
              />
              <text
                x={pos.x} y={pos.y + 4}
                textAnchor="middle"
                fill={cs.text} fontFamily={MONO} fontSize={12} fontWeight={700}
              >
                {n.label !== undefined ? n.label : String(n.id)}
              </text>
              {ptrs.map((p: PointerDef, j: number) => {
                const color = pointerColorMap[p.name] || POINTER_PALETTE[0];
                const yChip = pos.y - NODE_R - 14 - j * 18;
                return (
                  <g key={`gp-${n.id}-${j}`}>
                    <rect
                      x={pos.x - 22} y={yChip - 8}
                      width={44} height={16} rx={4}
                      fill={`${color}22`} stroke={`${color}66`}
                    />
                    <text
                      x={pos.x} y={yChip + 3}
                      textAnchor="middle"
                      fill={color} fontFamily={MONO} fontWeight={700} fontSize={10}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── IntervalTimeline ────────────────────────────────────────────────────
// Frame schema:
//   {
//     kind: 'interval',
//     intervals: [[start, end, label?], …]
//     scale: [min, max]                 // optional; auto from data
//     highlights: [idx]                  // bar indices
//     finalized: [idx]                   // merged/done bars
//     swapping: [idx]                    // overlapping-pair indicators
//     pointers: [{name, value, position?}]   // value on the number line
//   }
const IntervalTimeline = ({ frame }: { frame: IntervalFrame }) => {
  const intervals = useMemo(() => frame.intervals || [], [frame.intervals]);

  const layout = useMemo(() => {
    let lo: number, hi: number;
    if (frame.scale) {
      lo = frame.scale[0]; hi = frame.scale[1];
    } else if (intervals.length > 0) {
      lo = Math.min(...intervals.map((iv: [number, number, string?]) => iv[0]));
      hi = Math.max(...intervals.map((iv: [number, number, string?]) => iv[1]));
      const pad = Math.max(1, (hi - lo) * 0.08);
      lo -= pad; hi += pad;
    } else {
      lo = 0; hi = 1;
    }
    const range = Math.max(1, hi - lo);
    const W = 520, BAR_H = 22, ROW_H = BAR_H + 10, padX = 30, padY = 28;
    const H = padY * 2 + Math.max(1, intervals.length) * ROW_H + 20;
    const xOf = (v: number): number => padX + ((v - lo) / range) * (W - 2 * padX);
    return { W, H, BAR_H, ROW_H, padX, padY, lo, hi, range, xOf };
  }, [intervals, frame.scale]);

  if (intervals.length === 0) {
    return <div style={{ padding: 24, color: '#6b7280', fontFamily: MONO, fontStyle: 'italic' }}>(no intervals)</div>;
  }

  const stateOf = (i: number): string => {
    if ((frame.swapping || []).includes(i)) return 'swapping';
    if ((frame.finalized || []).includes(i)) return 'finalized';
    if ((frame.highlights || []).includes(i)) return 'highlight';
    return 'default';
  };

  const pointerColorMap = buildPointerColorMap(frame.pointers || []);
  const { W, H, BAR_H, ROW_H, padX, padY, lo, hi, xOf } = layout;

  // Tick marks: 6 evenly spaced ticks
  const ticks = [];
  for (let t = 0; t < 6; t++) {
    const v = lo + ((hi - lo) * t) / 5;
    ticks.push({ x: xOf(v), v: Math.round(v * 100) / 100 });
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* axis */}
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY}
              stroke="#374151" strokeWidth={1.5} />
        {ticks.map((t, i) => (
          <g key={`tk-${i}`}>
            <line x1={t.x} y1={H - padY} x2={t.x} y2={H - padY + 6} stroke="#374151" />
            <text x={t.x} y={H - padY + 18}
                  textAnchor="middle"
                  fill="#9ca3af" fontFamily={MONO} fontSize={10}>
              {t.v}
            </text>
          </g>
        ))}

        {/* bars */}
        {intervals.map((iv: [number, number, string?], i: number) => {
          const cs = STATES[stateOf(i)] || STATES.default;
          const x = xOf(iv[0]), x2 = xOf(iv[1]);
          const y = padY + i * ROW_H;
          const label = iv[2] !== undefined ? iv[2] : `[${iv[0]}, ${iv[1]}]`;
          return (
            <g key={`iv-${i}`}>
              <rect
                x={x} y={y} width={Math.max(2, x2 - x)} height={BAR_H}
                fill={cs.bg} stroke={cs.border} strokeWidth={2} rx={4}
              />
              <text
                x={x + 6} y={y + BAR_H / 2 + 4}
                fill={cs.text} fontFamily={MONO} fontSize={11} fontWeight={700}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* pointers (vertical lines on the axis) */}
        {(frame.pointers || []).map((p: PointerDef, i: number) => {
          const x = xOf(p.value ?? 0);
          const color = pointerColorMap[p.name] || POINTER_PALETTE[0];
          return (
            <g key={`ipv-${i}`}>
              <line x1={x} y1={padY - 8} x2={x} y2={H - padY}
                    stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
              <rect
                x={x - 22} y={padY - 22}
                width={44} height={16} rx={4}
                fill={`${color}22`} stroke={`${color}66`}
              />
              <text
                x={x} y={padY - 11}
                textAnchor="middle"
                fill={color} fontFamily={MONO} fontWeight={700} fontSize={10}
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export { BinaryTreeRenderer, TrieRenderer, GraphRenderer, IntervalTimeline };
