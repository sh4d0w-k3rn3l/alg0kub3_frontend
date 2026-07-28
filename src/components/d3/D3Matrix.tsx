'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3MatrixProps {
  data?: number[][];
  highlightedCells?: [number, number][];
  currentCell?: [number, number] | null;
  visitedCells?: [number, number][];
  isDark?: boolean;
}

const D3Matrix: React.FC<D3MatrixProps> = ({
  data = [],
  highlightedCells = [],
  currentCell = null,
  visitedCells = [],
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defaultData = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const matrix = data.length > 0 ? data : defaultData;
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const cellSize = 44;
    const svgW = cols * cellSize + 10;
    const svgH = rows * cellSize + 10;

    svg.attr('width', svgW).attr('height', svgH).attr('viewBox', `0 0 ${svgW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(5,5)');

    matrix.forEach((row, i) => {
      row.forEach((cell, j) => {
        const isHighlighted = highlightedCells.some(([r, c]) => r === i && c === j);
        const isCurrent = currentCell && currentCell[0] === i && currentCell[1] === j;
        const isVisited = visitedCells.some(([r, c]) => r === i && c === j);

        let fillColor: string;
        if (isCurrent) fillColor = '#22c55e';
        else if (isHighlighted) fillColor = '#f59e0b';
        else if (isVisited) fillColor = '#3b82f6';
        else fillColor = isDark ? '#1f1f23' : '#f3f4f6';

        g.append('rect')
          .attr('x', j * cellSize)
          .attr('y', i * cellSize)
          .attr('width', cellSize - 2)
          .attr('height', cellSize - 2)
          .attr('rx', 4)
          .attr('fill', fillColor)
          .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .transition()
          .delay((i * cols + j) * 25)
          .duration(200)
          .attr('opacity', 1);

        g.append('text')
          .attr('x', j * cellSize + cellSize / 2 - 1)
          .attr('y', i * cellSize + cellSize / 2 - 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', isCurrent || isHighlighted || isVisited ? '#fff' : isDark ? '#fff' : '#1f2937')
          .attr('font-size', 14)
          .attr('font-weight', 700)
          .attr('pointer-events', 'none')
          .attr('opacity', 0)
          .text(cell)
          .transition()
          .delay((i * cols + j) * 25 + 100)
          .duration(150)
          .attr('opacity', 1);
      });
    });
  }, [data, highlightedCells, currentCell, visitedCells, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3Matrix;
