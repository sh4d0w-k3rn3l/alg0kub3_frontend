'use client';

import React from 'react';
import D3BinaryTree from '@/components/d3/D3BinaryTree';
import D3LinkedList from '@/components/d3/D3LinkedList';
import D3Stack from '@/components/d3/D3Stack';
import D3Queue from '@/components/d3/D3Queue';
import D3Matrix from '@/components/d3/D3Matrix';
import D3Graph from '@/components/d3/D3Graph';
import D3IslandGrid from '@/components/d3/D3IslandGrid';

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

export const TreeVisualization = ({ data, highlightedNodes = [], currentNode = null }: TreeVisualizationProps) => (
  <div className="flex items-center justify-center w-full h-full overflow-auto">
    <D3BinaryTree data={data} highlightedNodes={highlightedNodes} currentNode={currentNode} />
  </div>
);

interface LinkedListVisualizationProps {
  data?: number[];
  highlightedIndices?: number[];
  currentIndex?: number | null;
  pointers?: Record<string, number>;
}

export const LinkedListVisualization = ({ data = [], highlightedIndices = [], currentIndex = null, pointers = {} }: LinkedListVisualizationProps) => (
  <div className="flex items-center justify-center w-full h-full overflow-x-auto">
    <D3LinkedList data={data} highlightedIndices={highlightedIndices} currentIndex={currentIndex} pointers={pointers} />
  </div>
);

interface StackVisualizationProps {
  data?: number[];
  highlightedIndex?: number | null;
  topPointer?: boolean;
}

export const StackVisualization = ({ data = [], highlightedIndex = null, topPointer = true }: StackVisualizationProps) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <D3Stack data={data} highlightedIndex={highlightedIndex} topPointer={topPointer} />
  </div>
);

interface QueueVisualizationProps {
  data?: number[];
  highlightedIndex?: number | null;
  frontPointer?: boolean;
  rearPointer?: boolean;
}

export const QueueVisualization = ({ data = [], highlightedIndex = null, frontPointer = true, rearPointer = true }: QueueVisualizationProps) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <D3Queue data={data} highlightedIndex={highlightedIndex} frontPointer={frontPointer} rearPointer={rearPointer} />
  </div>
);

interface MatrixVisualizationProps {
  data?: number[][];
  highlightedCells?: [number, number][];
  currentCell?: [number, number] | null;
  visitedCells?: [number, number][];
}

export const MatrixVisualization = ({ data = [], highlightedCells = [], currentCell = null, visitedCells = [] }: MatrixVisualizationProps) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <D3Matrix data={data} highlightedCells={highlightedCells} currentCell={currentCell} visitedCells={visitedCells} />
  </div>
);

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

export const GraphVisualization = ({ nodes = [], edges = [], highlightedNodes = [], highlightedEdges = [], currentNode = null }: GraphVisualizationProps) => (
  <div className="flex items-center justify-center w-full h-full overflow-auto">
    <D3Graph nodes={nodes} edges={edges} highlightedNodes={highlightedNodes} highlightedEdges={highlightedEdges} currentNode={currentNode} />
  </div>
);

interface IslandGridVisualizationProps {
  grid?: (number | string)[][];
  highlightedCells?: [number, number][];
  visitedCells?: [number, number][];
  currentCell?: [number, number] | null;
}

export const IslandGridVisualization = ({ grid = [], highlightedCells = [], visitedCells = [], currentCell = null }: IslandGridVisualizationProps) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <D3IslandGrid grid={grid} highlightedCells={highlightedCells} visitedCells={visitedCells} currentCell={currentCell} />
  </div>
);
