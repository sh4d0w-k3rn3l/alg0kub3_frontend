'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3ArrayBoxesProps {
  array: number[];
  highlightedIndices?: number[];
  swappingIndices?: number[];
  sortedIndices?: number[];
  pointerIndices?: { index: number; label: string; color?: string }[];
  isDark?: boolean;
  cellSize?: number;
  showIndices?: boolean;
}

const D3ArrayBoxes: React.FC<D3ArrayBoxesProps> = ({
  array,
  highlightedIndices = [],
  swappingIndices = [],
  sortedIndices = [],
  pointerIndices = [],
  isDark = true,
  cellSize = 48,
  showIndices = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || array.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const gap = 4;
    const totalW = array.length * (cellSize + gap) - gap;
    const pointerRowH = pointerIndices.length > 0 ? 28 : 0;
    const indexRowH = showIndices ? 20 : 0;
    const svgH = cellSize + pointerRowH + indexRowH + 10;
    const svgW = totalW + 20;

    svg.attr('width', svgW).attr('height', svgH).attr('viewBox', `0 0 ${svgW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(10,0)');

    const getColor = (idx: number): string => {
      if (swappingIndices.includes(idx)) return '#f59e0b';
      if (highlightedIndices.includes(idx)) return '#22c55e';
      if (sortedIndices.includes(idx)) return '#3b82f6';
      return '#06b6d4';
    };

    const getTextColor = (idx: number): string => {
      if (swappingIndices.includes(idx) || highlightedIndices.includes(idx) || sortedIndices.includes(idx)) return '#000';
      return isDark ? '#fff' : '#1f2937';
    };

    const pointerMap = new Map<number, { label: string; color: string }[]>();
    pointerIndices.forEach((p) => {
      const existing = pointerMap.get(p.index) || [];
      existing.push({ label: p.label, color: p.color || '#22c55e' });
      pointerMap.set(p.index, existing);
    });

    pointerMap.forEach((pointers, idx) => {
      pointers.forEach((ptr, pi) => {
        const x = idx * (cellSize + gap) + cellSize / 2;
        const y = pointerRowH > 0 ? pi * 14 : 0;

        g.append('text')
          .attr('x', x)
          .attr('y', y + 10)
          .attr('text-anchor', 'middle')
          .attr('fill', ptr.color)
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('opacity', 0)
          .text(ptr.label)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });
    });

    const boxY = pointerRowH;

    g.selectAll('.box')
      .data(array)
      .join('rect')
      .attr('class', 'box')
      .attr('x', (_, i) => i * (cellSize + gap))
      .attr('y', boxY)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (_, i) => getColor(i))
      .attr('stroke', (_, i) => {
        const ptrs = pointerMap.get(i);
        if (ptrs && ptrs.length > 0) return ptrs[0].color;
        if (swappingIndices.includes(i)) return '#d97706';
        if (highlightedIndices.includes(i)) return '#16a34a';
        if (sortedIndices.includes(i)) return '#2563eb';
        return isDark ? '#3f3f46' : '#d1d5db';
      })
      .attr('stroke-width', (_, i) => {
        const ptrs = pointerMap.get(i);
        if (ptrs && ptrs.length > 0) return 3;
        if (swappingIndices.includes(i) || highlightedIndices.includes(i)) return 2;
        return 1;
      })
      .attr('opacity', 0)
      .transition()
      .duration(250)
      .ease(d3.easeCubicOut)
      .attr('opacity', 1);

    g.selectAll('.val')
      .data(array)
      .join('text')
      .attr('class', 'val')
      .attr('x', (_, i) => i * (cellSize + gap) + cellSize / 2)
      .attr('y', boxY + cellSize / 2 + 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', (_, i) => getTextColor(i))
      .attr('font-size', cellSize > 40 ? 15 : 12)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text((d) => d)
      .transition()
      .delay(100)
      .duration(200)
      .attr('opacity', 1);

    if (showIndices) {
      const idxY = boxY + cellSize + 14;
      g.selectAll('.idx')
        .data(array)
        .join('text')
        .attr('class', 'idx')
        .attr('x', (_, i) => i * (cellSize + gap) + cellSize / 2)
        .attr('y', idxY)
        .attr('text-anchor', 'middle')
        .attr('fill', isDark ? '#6b7280' : '#9ca3af')
        .attr('font-size', 9)
        .text((_, i) => i);
    }
  }, [array, highlightedIndices, swappingIndices, sortedIndices, pointerIndices, isDark, cellSize, showIndices]);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3ArrayBoxes;
