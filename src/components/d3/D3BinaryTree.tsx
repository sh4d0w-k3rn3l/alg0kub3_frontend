'use client';

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

interface D3BinaryTreeProps {
  data?: TreeNode | null;
  highlightedNodes?: number[];
  currentNode?: number | null;
  isDark?: boolean;
}

const D3BinaryTree: React.FC<D3BinaryTreeProps> = ({
  data,
  highlightedNodes = [],
  currentNode = null,
  isDark = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defaultTree: TreeNode = {
      val: 4,
      left: { val: 2, left: { val: 1 }, right: { val: 3 } },
      right: { val: 6, left: { val: 5 }, right: { val: 7 } },
    };
    const treeData = data || defaultTree;

    const root = d3.hierarchy<TreeNode>(treeData);
    const treeLayout = d3.tree<TreeNode>().nodeSize([64, 80]);
    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    const xs = nodes.map((n) => n.x!);
    const ys = nodes.map((n) => n.y!);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 40;
    const svgWidth = maxX - minX + 2 * padding + 44;
    const svgHeight = maxY - minY + 2 * padding + 44;

    svg
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    const offsetX = -minX + padding + 22;
    const offsetY = -minY + padding + 22;

    const g = svg.append('g').attr('transform', `translate(${offsetX},${offsetY})`);

    const nodeR = 22;

    const defs = svg.append('defs');
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    g.selectAll('.link')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        const sx = d.source.x!;
        const sy = d.source.y!;
        const tx = d.target.x!;
        const ty = d.target.y!;
        return `M${sx},${sy + nodeR} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty - nodeR}`;
      })
      .attr('fill', 'none')
      .attr('stroke', isDark ? '#3f3f46' : '#d1d5db')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .attr('opacity', 1);

    const nodeGroups = g
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeGroups
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => {
        const val = d.data.val;
        if (currentNode === val) return '#22c55e';
        if (highlightedNodes.includes(val)) return '#3b82f6';
        return isDark ? '#1f1f23' : '#f3f4f6';
      })
      .attr('stroke', (d) => {
        const val = d.data.val;
        if (currentNode === val) return '#22c55e';
        if (highlightedNodes.includes(val)) return '#3b82f6';
        return isDark ? '#3f3f46' : '#d1d5db';
      })
      .attr('stroke-width', 2.5)
      .attr('filter', (d) => {
        const val = d.data.val;
        if (currentNode === val || highlightedNodes.includes(val)) return 'url(#glow)';
        return 'none';
      })
      .transition()
      .duration(350)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('r', nodeR);

    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => {
        const val = d.data.val;
        if (currentNode === val || highlightedNodes.includes(val)) return '#000';
        return isDark ? '#fff' : '#1f2937';
      })
      .attr('font-size', 14)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text((d) => d.data.val)
      .transition()
      .delay(200)
      .duration(200)
      .attr('opacity', 1);

  }, [data, highlightedNodes, currentNode, isDark]);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default D3BinaryTree;
