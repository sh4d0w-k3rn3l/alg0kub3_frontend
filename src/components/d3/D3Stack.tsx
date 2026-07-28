'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3StackProps {
  data?: number[];
  highlightedIndex?: number | null;
  topPointer?: boolean;
  isDark?: boolean;
}

const D3Stack: React.FC<D3StackProps> = ({
  data = [],
  highlightedIndex = null,
  topPointer = true,
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const stackData = data.length > 0 ? data : [10, 20, 30, 40, 50];
    const cellW = 72;
    const cellH = 40;
    const gap = 2;
    const totalH = stackData.length * (cellH + gap) - gap + 10;
    const svgW = cellW + 60;
    const svgH = totalH + 10;

    svg.attr('width', svgW).attr('height', svgH).attr('viewBox', `0 0 ${svgW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(40,5)');

    g.append('line')
      .attr('x1', -4)
      .attr('y1', 0)
      .attr('x2', -4)
      .attr('y2', totalH - 10)
      .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
      .attr('stroke-width', 2);

    g.append('line')
      .attr('x1', cellW + 4)
      .attr('y1', 0)
      .attr('x2', cellW + 4)
      .attr('y2', totalH - 10)
      .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
      .attr('stroke-width', 2);

    g.append('line')
      .attr('x1', -4)
      .attr('y1', totalH - 10)
      .attr('x2', cellW + 4)
      .attr('y2', totalH - 10)
      .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
      .attr('stroke-width', 2);

    stackData.forEach((value, index) => {
      const reversedIndex = stackData.length - 1 - index;
      const y = index * (cellH + gap);

      const isTop = reversedIndex === 0;
      const isHighlighted = highlightedIndex === index;

      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', cellW)
        .attr('height', cellH)
        .attr('rx', 3)
        .attr('fill', isHighlighted ? '#22c55e' : isTop ? '#3b82f6' : isDark ? '#1f1f23' : '#f3f4f6')
        .attr('stroke', isHighlighted ? '#22c55e' : isTop ? '#3b82f6' : isDark ? '#3f3f46' : '#d1d5db')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0)
        .transition()
        .delay(index * 50)
        .duration(250)
        .attr('opacity', 1);

      g.append('text')
        .attr('x', cellW / 2)
        .attr('y', y + cellH / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isHighlighted || isTop ? '#000' : isDark ? '#fff' : '#1f2937')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('pointer-events', 'none')
        .attr('opacity', 0)
        .text(value)
        .transition()
        .delay(index * 50 + 100)
        .duration(200)
        .attr('opacity', 1);

      if (topPointer && isTop) {
        const ptrY = y + cellH / 2;
        g.append('polygon')
          .attr('points', `${cellW + 10},${ptrY - 5} ${cellW + 20},${ptrY} ${cellW + 10},${ptrY + 5}`)
          .attr('fill', '#22c55e')
          .attr('opacity', 0)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        g.append('text')
          .attr('x', cellW + 28)
          .attr('y', ptrY + 1)
          .attr('dominant-baseline', 'central')
          .attr('fill', '#22c55e')
          .attr('font-size', 11)
          .attr('font-weight', 700)
          .attr('opacity', 0)
          .text('top')
          .transition()
          .duration(200)
          .attr('opacity', 1);
      }
    });
  }, [data, highlightedIndex, topPointer, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3Stack;
