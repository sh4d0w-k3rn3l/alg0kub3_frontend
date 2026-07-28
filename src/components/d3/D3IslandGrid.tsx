'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3IslandGridProps {
  grid?: (number | string)[][];
  highlightedCells?: [number, number][];
  visitedCells?: [number, number][];
  currentCell?: [number, number] | null;
  isDark?: boolean;
}

const D3IslandGrid: React.FC<D3IslandGridProps> = ({
  grid = [],
  highlightedCells = [],
  visitedCells = [],
  currentCell = null,
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defaultGrid: (number | string)[][] = [
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1],
    ];
    const data = grid.length > 0 ? grid : defaultGrid;
    const rows = data.length;
    const cols = data[0]?.length || 0;
    const cellSize = 40;
    const svgW = cols * cellSize + 10;
    const svgH = rows * cellSize + 10;

    svg.attr('width', svgW).attr('height', svgH).attr('viewBox', `0 0 ${svgW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(5,5)');

    data.forEach((row, i) => {
      row.forEach((cell, j) => {
        const isLand = cell === 1 || cell === '1';
        const isHighlighted = highlightedCells.some(([r, c]) => r === i && c === j);
        const isCurrent = currentCell && currentCell[0] === i && currentCell[1] === j;
        const isVisited = visitedCells.some(([r, c]) => r === i && c === j);

        let fillColor: string;
        if (isCurrent) fillColor = '#22c55e';
        else if (isHighlighted) fillColor = '#f59e0b';
        else if (isVisited && isLand) fillColor = '#3b82f6';
        else if (isLand) fillColor = '#065f46';
        else fillColor = '#1e3a5f';

        g.append('rect')
          .attr('x', j * cellSize)
          .attr('y', i * cellSize)
          .attr('width', cellSize - 1)
          .attr('height', cellSize - 1)
          .attr('rx', 3)
          .attr('fill', fillColor)
          .attr('stroke', isDark ? '#2f2f35' : '#d1d5db')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0)
          .transition()
          .delay((i * cols + j) * 20)
          .duration(200)
          .attr('opacity', 1);

        g.append('text')
          .attr('x', j * cellSize + cellSize / 2 - 0.5)
          .attr('y', i * cellSize + cellSize / 2 + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', isCurrent || isHighlighted || (isVisited && isLand) ? '#fff' : isDark ? '#9ca3af' : '#6b7280')
          .attr('font-size', 12)
          .attr('font-weight', 600)
          .attr('pointer-events', 'none')
          .attr('opacity', 0)
          .text(cell)
          .transition()
          .delay((i * cols + j) * 20 + 100)
          .duration(150)
          .attr('opacity', 1);
      });
    });
  }, [grid, highlightedCells, visitedCells, currentCell, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3IslandGrid;
