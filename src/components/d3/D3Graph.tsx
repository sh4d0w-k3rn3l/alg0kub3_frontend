'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: number;
  x?: number;
  y?: number;
  label?: string;
}

interface D3GraphProps {
  nodes?: GraphNode[];
  edges?: [number, number][];
  highlightedNodes?: number[];
  highlightedEdges?: [number, number][];
  currentNode?: number | null;
  isDark?: boolean;
  directed?: boolean;
}

const D3Graph: React.FC<D3GraphProps> = ({
  nodes = [],
  edges = [],
  highlightedNodes = [],
  highlightedEdges = [],
  currentNode = null,
  isDark = true,
  directed = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defaultNodes: GraphNode[] = [
      { id: 0, x: 100, y: 50 },
      { id: 1, x: 50, y: 120 },
      { id: 2, x: 150, y: 120 },
      { id: 3, x: 25, y: 200 },
      { id: 4, x: 75, y: 200 },
      { id: 5, x: 175, y: 200 },
    ];
    const defaultEdges: [number, number][] = [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 4],
    ];

    const graphNodes = nodes.length > 0 ? nodes : defaultNodes;
    const graphEdges = edges.length > 0 ? edges : defaultEdges;

    const hasCoords = graphNodes.some((n) => n.x !== undefined && n.y !== undefined);

    let layoutNodes: { id: number; x: number; y: number; label?: string }[];
    const layoutEdges = graphEdges;

    if (hasCoords) {
      layoutNodes = graphNodes.map((n) => ({
        id: n.id,
        x: n.x ?? 100,
        y: n.y ?? 100,
        label: n.label,
      }));
    } else {
      const simNodes = graphNodes.map((n) => ({ ...n, vx: 0, vy: 0 }));
      const simLinks = graphEdges.map(([s, t]) => ({ source: s, target: t })) as unknown as d3.SimulationLinkDatum<typeof simNodes[number]>[];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const simulation = d3.forceSimulation(simNodes as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .force('link', d3.forceLink(simLinks as any).id((d: any) => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(200, 160))
        .force('collision', d3.forceCollide(35))
        .stop();

      for (let i = 0; i < 300; i++) simulation.tick();

      layoutNodes = simNodes.map((n) => ({ id: n.id, x: n.x ?? 100, y: n.y ?? 100, label: n.label }));
    }

    const xs = layoutNodes.map((n) => n.x);
    const ys = layoutNodes.map((n) => n.y);
    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 50;
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 50;

    const svgWidth = maxX - minX;
    const svgHeight = maxY - minY;

    svg.attr('width', svgWidth).attr('height', svgHeight).attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    const offsetX = -minX;
    const offsetY = -minY;

    const g = svg.append('g').attr('transform', `translate(${offsetX},${offsetY})`);

    const nodeR = 22;
    const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

    const isEdgeHighlighted = (from: number, to: number): boolean =>
      highlightedEdges.some(([f, t]) => (f === from && t === to) || (!directed && f === to && t === from));

    if (directed) {
      const defs = svg.append('defs');
      defs
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', nodeR + 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', isDark ? '#3f3f46' : '#9ca3af');

      defs
        .append('marker')
        .attr('id', 'arrow-highlight')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', nodeR + 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#22c55e');
    }

    const edgeLines = g.selectAll('.edge')
      .data(layoutEdges)
      .join('line')
      .attr('class', 'edge')
      .attr('x1', ([from]) => nodeMap.get(from)?.x ?? 0)
      .attr('y1', ([from]) => nodeMap.get(from)?.y ?? 0)
      .attr('x2', ([, to]) => nodeMap.get(to)?.x ?? 0)
      .attr('y2', ([, to]) => nodeMap.get(to)?.y ?? 0)
      .attr('stroke', ([from, to]) => isEdgeHighlighted(from, to) ? '#22c55e' : isDark ? '#3f3f46' : '#d1d5db')
      .attr('stroke-width', ([from, to]) => (isEdgeHighlighted(from, to) ? 3 : 2))
      .attr('opacity', 0);

    if (directed) {
      edgeLines.attr('marker-end', ([from, to]) => `url(#${isEdgeHighlighted(from, to) ? 'arrow-highlight' : 'arrow'})`);
    }

    edgeLines.transition()
      .duration(300)
      .attr('opacity', 1);

    const nodeGroups = g
      .selectAll('.node')
      .data(layoutNodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeGroups
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => {
        if (currentNode === d.id) return '#22c55e';
        if (highlightedNodes.includes(d.id)) return '#3b82f6';
        return isDark ? '#1f1f23' : '#f3f4f6';
      })
      .attr('stroke', (d) => {
        if (currentNode === d.id) return '#22c55e';
        if (highlightedNodes.includes(d.id)) return '#3b82f6';
        return isDark ? '#3f3f46' : '#d1d5db';
      })
      .attr('stroke-width', 2.5)
      .transition()
      .duration(350)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('r', nodeR);

    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => {
        if (currentNode === d.id || highlightedNodes.includes(d.id)) return '#000';
        return isDark ? '#fff' : '#1f2937';
      })
      .attr('font-size', 14)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text((d) => d.label ?? d.id)
      .transition()
      .delay(150)
      .duration(200)
      .attr('opacity', 1);

  }, [nodes, edges, highlightedNodes, highlightedEdges, currentNode, isDark, directed]);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3Graph;
