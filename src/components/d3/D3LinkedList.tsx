'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3LinkedListProps {
  data?: number[];
  highlightedIndices?: number[];
  currentIndex?: number | null;
  pointers?: Record<string, number>;
  isDark?: boolean;
}

const D3LinkedList: React.FC<D3LinkedListProps> = ({
  data = [],
  highlightedIndices = [],
  currentIndex = null,
  pointers = {},
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const listData = data.length > 0 ? data : [1, 2, 3, 4, 5];
    const nodeW = 80;
    const nodeH = 40;
    const arrowW = 36;
    const totalW = listData.length * (nodeW + arrowW) + 60;
    const svgH = 80;

    svg.attr('width', totalW).attr('height', svgH).attr('viewBox', `0 0 ${totalW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(10,20)');

    const pointerEntries = Object.entries(pointers);
    const pointerMap = new Map<number, string[]>();
    pointerEntries.forEach(([label, idx]) => {
      const existing = pointerMap.get(idx) || [];
      existing.push(label);
      pointerMap.set(idx, existing);
    });

    listData.forEach((value, index) => {
      const x = index * (nodeW + arrowW);
      const isHighlighted = highlightedIndices.includes(index);
      const isCurrent = currentIndex === index;
      const ptrs = pointerMap.get(index) || [];

      ptrs.forEach((label, pi) => {
        g.append('text')
          .attr('x', x + nodeW / 2)
          .attr('y', -8 + pi * -14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#22c55e')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('opacity', 0)
          .text(label)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        g.append('polygon')
          .attr('points', `${x + nodeW / 2 - 4},${-2 + pi * -14} ${x + nodeW / 2 + 4},${-2 + pi * -14} ${x + nodeW / 2},${2 + pi * -14}`)
          .attr('fill', '#22c55e')
          .attr('opacity', 0)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });

      g.append('rect')
        .attr('x', x)
        .attr('y', 0)
        .attr('width', nodeW)
        .attr('height', nodeH)
        .attr('rx', 4)
        .attr('fill', isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : isDark ? '#1f1f23' : '#f3f4f6')
        .attr('stroke', isCurrent ? '#22c55e' : isHighlighted ? '#3b82f6' : isDark ? '#3f3f46' : '#d1d5db')
        .attr('stroke-width', isCurrent || isHighlighted ? 2.5 : 1.5)
        .attr('opacity', 0)
        .transition()
        .duration(250)
        .attr('opacity', 1);

      g.append('line')
        .attr('x1', x + nodeW * 0.6)
        .attr('y1', 0)
        .attr('x2', x + nodeW * 0.6)
        .attr('y2', nodeH)
        .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', x + nodeW * 0.3)
        .attr('y', nodeH / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isCurrent || isHighlighted ? '#000' : isDark ? '#fff' : '#1f2937')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('pointer-events', 'none')
        .attr('opacity', 0)
        .text(value)
        .transition()
        .delay(100)
        .duration(200)
        .attr('opacity', 1);

      const dotColor = index < listData.length - 1 ? (isDark ? '#fff' : '#1f2937') : '#ef4444';
      g.append('circle')
        .attr('cx', x + nodeW * 0.8)
        .attr('cy', nodeH / 2)
        .attr('r', 4)
        .attr('fill', dotColor)
        .attr('opacity', 0)
        .transition()
        .duration(200)
        .attr('opacity', 1);

      if (index < listData.length - 1) {
        const ax = x + nodeW;
        const bx = x + nodeW + arrowW;
        g.append('line')
          .attr('x1', ax + 2)
          .attr('y1', nodeH / 2)
          .attr('x2', bx - 8)
          .attr('y2', nodeH / 2)
          .attr('stroke', isDark ? '#6b7280' : '#9ca3af')
          .attr('stroke-width', 2)
          .attr('opacity', 0)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        g.append('polygon')
          .attr('points', `${bx - 8},${nodeH / 2 - 5} ${bx},${nodeH / 2} ${bx - 8},${nodeH / 2 + 5}`)
          .attr('fill', isDark ? '#6b7280' : '#9ca3af')
          .attr('opacity', 0)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      } else {
        g.append('text')
          .attr('x', x + nodeW + 6)
          .attr('y', nodeH / 2 + 1)
          .attr('dominant-baseline', 'central')
          .attr('fill', '#ef4444')
          .attr('font-size', 12)
          .attr('font-weight', 700)
          .attr('font-family', 'monospace')
          .attr('opacity', 0)
          .text('NULL')
          .transition()
          .duration(200)
          .attr('opacity', 1);
      }
    });
  }, [data, highlightedIndices, currentIndex, pointers, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3LinkedList;
