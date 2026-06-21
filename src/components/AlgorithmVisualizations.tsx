'use client';

import React from 'react';

interface TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

interface TreeVisualizationProps {
  data?: TreeNode | null;
  highlightedNodes?: number[];
  currentNode?: number | null;
}

export const TreeVisualization = ({ data, highlightedNodes = [], currentNode = null }: TreeVisualizationProps) => {
  const defaultTree: TreeNode = {
    val: 4,
    left: { val: 2, left: { val: 1 }, right: { val: 3 } },
    right: { val: 6, left: { val: 5 }, right: { val: 7 } }
  };

  const tree = data || defaultTree;

  const renderNode = (node: TreeNode | null | undefined, x: number, y: number, level: number, parentX: number | null = null, parentY: number | null = null): React.ReactNode => {
    if (!node) return null;

    const horizontalSpacing = 120 / (level + 1);
    const verticalSpacing = 60;
    const isHighlighted = highlightedNodes.includes(node.val);
    const isCurrent = currentNode === node.val;

    return (
      <g key={`${node.val}-${x}-${y}`}>
        {parentX !== null && (
          <line
            x1={parentX}
            y1={(parentY as number) + 20}
            x2={x}
            y2={y - 20}
            stroke={isHighlighted ? '#22c55e' : '#3f3f46'}
            strokeWidth="2"
          />
        )}

        <circle
          cx={x}
          cy={y}
          r="22"
          fill={isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : '#1f1f23'}
          stroke={isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : '#3f3f46'}
          strokeWidth="2"
        />

        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill={isCurrent || isHighlighted ? '#000' : '#fff'}
          fontSize="14"
          fontWeight="bold"
        >
          {node.val}
        </text>

        {node.left && renderNode(node.left, x - horizontalSpacing, y + verticalSpacing, level + 1, x, y)}
        {node.right && renderNode(node.right, x + horizontalSpacing, y + verticalSpacing, level + 1, x, y)}
      </g>
    );
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg width="400" height="280" viewBox="0 0 400 280">
        <g transform="translate(200, 40)">
          {renderNode(tree, 0, 0, 0)}
        </g>
      </svg>
    </div>
  );
};

interface LinkedListVisualizationProps {
  data?: number[];
  highlightedIndices?: number[];
  currentIndex?: number | null;
  pointers?: Record<string, number>;
}

export const LinkedListVisualization = ({ data = [], highlightedIndices = [], currentIndex = null, pointers = {} }: LinkedListVisualizationProps) => {
  const defaultData = [1, 2, 3, 4, 5];
  const listData = data.length > 0 ? data : defaultData;

  return (
    <div className="flex items-center justify-center w-full h-full overflow-x-auto">
      <div className="flex items-center gap-0">
        {listData.map((value, index) => {
          const isHighlighted = highlightedIndices.includes(index);
          const isCurrent = currentIndex === index;
          const pointerLabels = Object.entries(pointers)
            .filter(([, idx]) => idx === index)
            .map(([label]) => label);

          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                {pointerLabels.length > 0 && (
                  <div className="flex gap-1 mb-1">
                    {pointerLabels.map(label => (
                      <span key={label} className="text-xs text-[#22c55e] font-bold">{label}</span>
                    ))}
                  </div>
                )}
                {pointerLabels.length > 0 && (
                  <svg className="w-3 h-3 text-[#22c55e] mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 16l-6-6h12z"/>
                  </svg>
                )}

                <div className="flex">
                  <div
                    className={`w-12 h-12 flex items-center justify-center text-lg font-bold border-2 rounded-l transition-all ${
                      isCurrent
                        ? 'bg-[#22c55e] border-[#22c55e] text-black'
                        : isHighlighted
                        ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                        : 'bg-[#1f1f23] border-[#3f3f46] text-white'
                    }`}
                  >
                    {value}
                  </div>
                  <div
                    className={`w-6 h-12 flex items-center justify-center border-2 border-l-0 rounded-r ${
                      isCurrent
                        ? 'bg-[#16a34a] border-[#22c55e]'
                        : isHighlighted
                        ? 'bg-[#2563eb] border-[#3b82f6]'
                        : 'bg-[#27272a] border-[#3f3f46]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${index < listData.length - 1 ? 'bg-white' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>

              {index < listData.length - 1 && (
                <svg className="w-8 h-4 text-gray-500" viewBox="0 0 32 16">
                  <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="2" />
                  <polygon points="24,4 32,8 24,12" fill="currentColor" />
                </svg>
              )}

              {index === listData.length - 1 && (
                <span className="ml-2 text-red-500 font-mono text-sm">NULL</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface StackVisualizationProps {
  data?: number[];
  highlightedIndex?: number | null;
  topPointer?: boolean;
}

export const StackVisualization = ({ data = [], highlightedIndex = null, topPointer = true }: StackVisualizationProps) => {
  const defaultData = [10, 20, 30, 40, 50];
  const stackData = data.length > 0 ? data : defaultData;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-end gap-4">
        <div className="flex flex-col-reverse border-l-2 border-r-2 border-b-2 border-[#3f3f46] rounded-b-lg overflow-hidden">
          {stackData.map((value, index) => {
            const isTop = index === stackData.length - 1;
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={index}
                className={`w-20 h-12 flex items-center justify-center text-lg font-bold border-t-2 transition-all ${
                  isHighlighted
                    ? 'bg-[#22c55e] border-[#22c55e] text-black'
                    : isTop
                    ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                    : 'bg-[#1f1f23] border-[#3f3f46] text-white'
                }`}
              >
                {value}
              </div>
            );
          })}
        </div>

        {topPointer && stackData.length > 0 && (
          <div className="flex items-center gap-1 self-start">
            <svg className="w-4 h-4 text-[#22c55e]" viewBox="0 0 16 16">
              <polygon points="0,8 8,4 8,12" fill="currentColor" />
            </svg>
            <span className="text-[#22c55e] font-bold text-sm">top</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-gray-500 text-sm">Stack</div>
    </div>
  );
};

interface QueueVisualizationProps {
  data?: number[];
  highlightedIndex?: number | null;
  frontPointer?: boolean;
  rearPointer?: boolean;
}

export const QueueVisualization = ({ data = [], highlightedIndex = null, frontPointer = true, rearPointer = true }: QueueVisualizationProps) => {
  const defaultData = [10, 20, 30, 40, 50];
  const queueData = data.length > 0 ? data : defaultData;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-center mb-2" style={{ width: `${queueData.length * 64}px` }}>
        {frontPointer && (
          <div className="flex flex-col items-center">
            <span className="text-[#22c55e] font-bold text-xs">front</span>
            <svg className="w-3 h-3 text-[#22c55e]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 16l-6-6h12z"/>
            </svg>
          </div>
        )}
        <div className="flex-1" />
        {rearPointer && queueData.length > 1 && (
          <div className="flex flex-col items-center">
            <span className="text-[#f59e0b] font-bold text-xs">rear</span>
            <svg className="w-3 h-3 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 16l-6-6h12z"/>
            </svg>
          </div>
        )}
      </div>

      <div className="flex border-2 border-[#3f3f46] rounded-lg overflow-hidden">
        {queueData.map((value, index) => {
          const isFront = index === 0;
          const isRear = index === queueData.length - 1;
          const isHighlighted = highlightedIndex === index;

          return (
            <div
              key={index}
              className={`w-14 h-14 flex items-center justify-center text-lg font-bold border-r last:border-r-0 transition-all ${
                isHighlighted
                  ? 'bg-[#22c55e] border-[#22c55e] text-black'
                  : isFront
                  ? 'bg-[#3b82f6] border-[#3f3f46] text-white'
                  : isRear
                  ? 'bg-[#f59e0b] border-[#3f3f46] text-black'
                  : 'bg-[#1f1f23] border-[#3f3f46] text-white'
              }`}
            >
              {value}
            </div>
          );
        })}
      </div>

      <div className="flex items-center mt-2 text-gray-500 text-xs">
        <span>Dequeue ←</span>
        <span className="mx-4">Queue</span>
        <span>→ Enqueue</span>
      </div>
    </div>
  );
};

interface MatrixVisualizationProps {
  data?: number[][];
  highlightedCells?: [number, number][];
  currentCell?: [number, number] | null;
  visitedCells?: [number, number][];
}

export const MatrixVisualization = ({ data = [], highlightedCells = [], currentCell = null, visitedCells = [] }: MatrixVisualizationProps) => {
  const defaultData = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  const matrix = data.length > 0 ? data : defaultData;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="inline-block">
        {matrix.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => {
              const isHighlighted = highlightedCells.some(([r, c]) => r === i && c === j);
              const isCurrent = currentCell && currentCell[0] === i && currentCell[1] === j;
              const isVisited = visitedCells.some(([r, c]) => r === i && c === j);

              return (
                <div
                  key={j}
                  className={`w-12 h-12 flex items-center justify-center text-lg font-bold border transition-all ${
                    isCurrent
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : isHighlighted
                      ? 'bg-[#f59e0b] border-[#f59e0b] text-black'
                      : isVisited
                      ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                      : 'bg-[#1f1f23] border-[#3f3f46] text-white'
                  }`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span>Rows: {matrix.length}</span>
        <span>Cols: {matrix[0]?.length || 0}</span>
      </div>
    </div>
  );
};

interface GraphNode {
  id: number;
  x: number;
  y: number;
}

interface GraphVisualizationProps {
  nodes?: GraphNode[];
  edges?: [number, number][];
  highlightedNodes?: number[];
  highlightedEdges?: [number, number][];
  currentNode?: number | null;
}

export const GraphVisualization = ({ nodes = [], edges = [], highlightedNodes = [], highlightedEdges = [], currentNode = null }: GraphVisualizationProps) => {
  const defaultNodes: GraphNode[] = [
    { id: 0, x: 100, y: 50 },
    { id: 1, x: 50, y: 120 },
    { id: 2, x: 150, y: 120 },
    { id: 3, x: 25, y: 200 },
    { id: 4, x: 75, y: 200 },
    { id: 5, x: 175, y: 200 }
  ];

  const defaultEdges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 4]
  ];

  const graphNodes = nodes.length > 0 ? nodes : defaultNodes;
  const graphEdges = edges.length > 0 ? edges : defaultEdges;

  const isEdgeHighlighted = (from: number, to: number): boolean => {
    return highlightedEdges.some(([f, t]) => (f === from && t === to) || (f === to && t === from));
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg width="300" height="280" viewBox="0 0 300 280">
        {graphEdges.map(([from, to], index) => {
          const fromNode = graphNodes.find(n => n.id === from);
          const toNode = graphNodes.find(n => n.id === to);
          if (!fromNode || !toNode) return null;

          const highlighted = isEdgeHighlighted(from, to);

          return (
            <line
              key={index}
              x1={fromNode.x + 50}
              y1={fromNode.y}
              x2={toNode.x + 50}
              y2={toNode.y}
              stroke={highlighted ? '#22c55e' : '#3f3f46'}
              strokeWidth={highlighted ? 3 : 2}
            />
          );
        })}

        {graphNodes.map((node) => {
          const isHighlighted = highlightedNodes.includes(node.id);
          const isCurrent = currentNode === node.id;

          return (
            <g key={node.id}>
              <circle
                cx={node.x + 50}
                cy={node.y}
                r="22"
                fill={isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : '#1f1f23'}
                stroke={isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : '#3f3f46'}
                strokeWidth="2"
              />
              <text
                x={node.x + 50}
                y={node.y + 5}
                textAnchor="middle"
                fill={isCurrent || isHighlighted ? '#000' : '#fff'}
                fontSize="14"
                fontWeight="bold"
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface IslandGridVisualizationProps {
  grid?: (number | string)[][];
  highlightedCells?: [number, number][];
  visitedCells?: [number, number][];
  currentCell?: [number, number] | null;
}

export const IslandGridVisualization = ({ grid = [], highlightedCells = [], visitedCells = [], currentCell = null }: IslandGridVisualizationProps) => {
  const defaultGrid: (number | string)[][] = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1]
  ];

  const data = grid.length > 0 ? grid : defaultGrid;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="inline-block">
        {data.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => {
              const isHighlighted = highlightedCells.some(([r, c]) => r === i && c === j);
              const isCurrent = currentCell && currentCell[0] === i && currentCell[1] === j;
              const isVisited = visitedCells.some(([r, c]) => r === i && c === j);
              const isLand = cell === 1 || cell === '1';

              return (
                <div
                  key={j}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold border transition-all ${
                    isCurrent
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : isHighlighted
                      ? 'bg-[#f59e0b] border-[#f59e0b] text-black'
                      : isVisited && isLand
                      ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                      : isLand
                      ? 'bg-[#065f46] border-[#059669] text-white'
                      : 'bg-[#1e3a5f] border-[#1e40af] text-gray-400'
                  }`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#065f46] border border-[#059669]" />
          <span className="text-gray-400">Land (1)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#1e3a5f] border border-[#1e40af]" />
          <span className="text-gray-400">Water (0)</span>
        </div>
      </div>
    </div>
  );
};

