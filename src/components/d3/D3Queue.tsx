'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3QueueProps {
  data?: number[];
  highlightedIndex?: number | null;
  frontPointer?: boolean;
  rearPointer?: boolean;
  isDark?: boolean;
}

const D3Queue: React.FC<D3QueueProps> = ({
  data = [],
  highlightedIndex = null,
  frontPointer = true,
  rearPointer = true,
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const queueData = data.length > 0 ? data : [10, 20, 30, 40, 50];
    const cellW = 52;
    const cellH = 48;
    const gap = 2;
    const totalW = queueData.length * (cellW + gap) - gap + 40;
    const svgH = cellH + 50;
    const svgW = totalW + 20;

    svg.attr('width', svgW).attr('height', svgH).attr('viewBox', `0 0 ${svgW} ${svgH}`);

    const g = svg.append('g').attr('transform', 'translate(10,0)');

    queueData.forEach((value, index) => {
      const x = index * (cellW + gap);
      const y = 20;
      const isFront = index === 0;
      const isRear = index === queueData.length - 1;
      const isHighlighted = highlightedIndex === index;

      if (frontPointer && isFront) {
        g.append('text')
          .attr('x', x + cellW / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#22c55e')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('opacity', 0)
          .text('front')
          .transition()
          .duration(200)
          .attr('opacity', 1);
      }

      if (rearPointer && isRear && queueData.length > 1) {
        g.append('text')
          .attr('x', x + cellW / 2)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('opacity', 0)
          .text('rear')
          .transition()
          .duration(200)
          .attr('opacity', 1);
      }

      g.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', cellW)
        .attr('height', cellH)
        .attr('rx', 4)
        .attr('fill', isHighlighted ? '#22c55e' : isFront ? '#3b82f6' : isRear ? '#f59e0b' : isDark ? '#1f1f23' : '#f3f4f6')
        .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0)
        .transition()
        .delay(index * 40)
        .duration(250)
        .attr('opacity', 1);

      g.append('text')
        .attr('x', x + cellW / 2)
        .attr('y', y + cellH / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', isHighlighted || isFront || isRear ? '#000' : isDark ? '#fff' : '#1f2937')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('pointer-events', 'none')
        .attr('opacity', 0)
        .text(value)
        .transition()
        .delay(index * 40 + 100)
        .duration(200)
        .attr('opacity', 1);
    });

    const footerY = cellH + 36;
    g.append('text')
      .attr('x', 0)
      .attr('y', footerY)
      .attr('fill', isDark ? '#6b7280' : '#9ca3af')
      .attr('font-size', 10)
      .text('Dequeue ←');

    g.append('text')
      .attr('x', totalW / 2)
      .attr('y', footerY)
      .attr('text-anchor', 'middle')
      .attr('fill', isDark ? '#6b7280' : '#9ca3af')
      .attr('font-size', 10)
      .text('Queue');

    g.append('text')
      .attr('x', totalW)
      .attr('y', footerY)
      .attr('text-anchor', 'end')
      .attr('fill', isDark ? '#6b7280' : '#9ca3af')
      .attr('font-size', 10)
      .text('→ Enqueue');
  }, [data, highlightedIndex, frontPointer, rearPointer, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3Queue;
