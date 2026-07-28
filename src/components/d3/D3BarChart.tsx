'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface D3BarChartProps {
  array: number[];
  highlightedIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  maxValue?: number;
  compact?: boolean;
  isDark?: boolean;
}

const D3BarChart: React.FC<D3BarChartProps> = ({
  array,
  highlightedIndices,
  swappingIndices,
  sortedIndices,
  maxValue: propMaxValue,
  compact = false,
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevArrayRef = useRef<number[]>([]);

  useEffect(() => {
    if (!svgRef.current || array.length === 0) return;

    const svg = d3.select(svgRef.current);
    const maxValue = propMaxValue ?? Math.max(...array.map(Math.abs), 1);

    const margin = compact
      ? { top: 20, right: 10, bottom: 20, left: 10 }
      : { top: 30, right: 15, bottom: 25, left: 15 };
    const containerWidth = svgRef.current.parentElement?.clientWidth || 500;
    const containerHeight = svgRef.current.parentElement?.clientHeight || (compact ? 180 : 340);
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr('width', containerWidth).attr('height', containerHeight);

    let chartG = svg.select<SVGGElement>('g.chart-group');
    if (chartG.empty()) {
      chartG = svg.append('g').attr('class', 'chart-group');
    }
    chartG.attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(array.map((_, i) => i.toString()))
      .range([0, width])
      .padding(array.length > 15 ? 0.2 : 0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.15])
      .range([height, 0]);

    const barWidth = xScale.bandwidth();

    const getColor = (index: number): string => {
      if (swappingIndices.includes(index)) return '#f59e0b';
      if (highlightedIndices.includes(index)) return '#22c55e';
      if (sortedIndices.includes(index)) return '#3b82f6';
      return isDark ? '#06b6d4' : '#0891b2';
    };

    const getStroke = (index: number): string => {
      if (swappingIndices.includes(index)) return '#d97706';
      if (highlightedIndices.includes(index)) return '#16a34a';
      if (sortedIndices.includes(index)) return '#2563eb';
      return 'transparent';
    };

    const getStrokeWidth = (index: number): number => {
      return (highlightedIndices.includes(index) || swappingIndices.includes(index)) ? 2 : 0;
    };

    const prevArray = prevArrayRef.current;
    const arrayChanged = prevArray.length !== array.length ||
      prevArray.some((v, i) => v !== array[i]);
    const isFirstRender = prevArray.length === 0;
    prevArrayRef.current = [...array];

    // Bars
    const bars = chartG.selectAll<SVGRectElement, number>('.bar')
      .data(array, (_, i) => i);

    bars.exit().remove();

    const barsEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', (_, i) => xScale(i.toString()) || 0)
      .attr('width', barWidth)
      .attr('fill', (_, i) => getColor(i))
      .attr('stroke', (_, i) => getStroke(i))
      .attr('stroke-width', (_, i) => getStrokeWidth(i))
      .attr('y', isFirstRender ? height : (_, i) => yScale(Math.abs(array[i])))
      .attr('height', isFirstRender ? 0 : (_, i) => height - yScale(Math.abs(array[i])));

    if (isFirstRender || arrayChanged) {
      barsEnter.transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(Math.abs(d)))
        .attr('height', (d) => height - yScale(Math.abs(d)));
    }

    bars.merge(barsEnter)
      .transition()
      .duration(200)
      .attr('x', (_, i) => xScale(i.toString()) || 0)
      .attr('width', barWidth)
      .attr('y', (d) => yScale(Math.abs(d)))
      .attr('height', (d) => height - yScale(Math.abs(d)))
      .attr('fill', (_, i) => getColor(i))
      .attr('stroke', (_, i) => getStroke(i))
      .attr('stroke-width', (_, i) => getStrokeWidth(i));

    // Value labels
    const labels = chartG.selectAll<SVGTextElement, number>('.bar-label')
      .data(array, (_, i) => i);

    labels.exit().remove();

    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', compact ? 9 : 11)
      .attr('font-weight', 600)
      .text((d) => d);

    labels.merge(labelsEnter)
      .transition()
      .duration(200)
      .attr('x', (_, i) => (xScale(i.toString()) || 0) + barWidth / 2)
      .attr('y', (d) => yScale(Math.abs(d)) - 6)
      .attr('fill', (d, i) =>
        highlightedIndices.includes(i) || swappingIndices.includes(i) || sortedIndices.includes(i)
          ? isDark ? '#fff' : '#1f2937'
          : isDark ? '#9ca3af' : '#6b7280'
      )
      .text((d) => d);

    // Index labels
    const indices = chartG.selectAll<SVGTextElement, number>('.bar-index')
      .data(array, (_, i) => i);

    indices.exit().remove();

    const indicesEnter = indices.enter()
      .append('text')
      .attr('class', 'bar-index')
      .attr('text-anchor', 'middle')
      .attr('font-size', compact ? 8 : 9)
      .text((_, i) => i);

    indices.merge(indicesEnter)
      .attr('x', (_, i) => (xScale(i.toString()) || 0) + barWidth / 2)
      .attr('y', height + 14)
      .attr('fill', isDark ? '#6b7280' : '#9ca3af')
      .text((_, i) => i);

  }, [array, highlightedIndices, swappingIndices, sortedIndices, propMaxValue, compact, isDark]);

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: compact ? 180 : 200 }}
      />
    </div>
  );
};

export default D3BarChart;
