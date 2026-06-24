import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Contact } from '../types';
import type { GraphCluster } from '../types';

interface Props {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
  darkMode: boolean;
}

type NodeKind = 'person' | 'hub';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  kind: NodeKind;
  label: string;
  clusterKey: string;
  radius: number;
  priority?: boolean;
  followUpRecommended?: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  kind: 'cluster' | 'referral';
}

const CLUSTER_COLORS = [
  '#2E6B54', '#3a7a5a', '#5b8c5a', '#7fa87f',
  '#a06b3c', '#c08040', '#7a5c8c', '#5c7a8c',
  '#8c5c5c', '#6e8c6e', '#3c5c8c', '#8c7a3c',
];

// Estimate radius needed to fit label text (sans-serif ~6px/char at 0.68rem)
function hubRadius(label: string, count: number): number {
  return Math.max(34, label.length * 4.0 + 14, Math.sqrt(count) * 13);
}

export function NetworkGraph({ contacts, onSelectContact, darkMode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onSelectContact);
  callbackRef.current = onSelectContact;

  const [cluster, setCluster] = useState<GraphCluster>('company');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const bgColor = darkMode ? '#1c1c1a' : '#FBFBF9';
    const textColor = darkMode ? '#e8e8e4' : '#1a1a18';

    svg.append('rect').attr('width', width).attr('height', height).attr('fill', bgColor);

    if (contacts.length === 0) {
      svg.append('text')
        .attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', darkMode ? '#5a5a54' : '#9a9a94')
        .attr('font-size', '0.85rem')
        .attr('font-family', '-apple-system, sans-serif')
        .text('Add contacts to see the web');
      return;
    }

    const clusterKeyOf = (c: Contact) =>
      cluster === 'company' ? (c.company ?? '__none__') : (c.school ?? '__none__');

    const clusterLabelOf = (c: Contact) =>
      cluster === 'company'
        ? (c.company ?? 'No company')
        : (c.school ?? 'No school');

    const clusterKeys = Array.from(new Set(contacts.map(clusterKeyOf)));
    const clusterCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      const k = clusterKeyOf(c);
      clusterCounts[k] = (clusterCounts[k] ?? 0) + 1;
    });
    const clusterLabelMap: Record<string, string> = {};
    contacts.forEach((c) => { clusterLabelMap[clusterKeyOf(c)] = clusterLabelOf(c); });

    const colorScale = d3.scaleOrdinal<string, string>().domain(clusterKeys).range(CLUSTER_COLORS);

    const numClusters = clusterKeys.length;
    const ringR = Math.min(width, height) * (numClusters === 1 ? 0 : 0.32);
    const clusterCenters: Record<string, { x: number; y: number }> = {};
    clusterKeys.forEach((k, i) => {
      const angle = (i / numClusters) * 2 * Math.PI - Math.PI / 2;
      clusterCenters[k] = {
        x: width / 2 + ringR * Math.cos(angle),
        y: height / 2 + ringR * Math.sin(angle),
      };
    });

    // Hub nodes (fixed)
    const hubNodes: GraphNode[] = clusterKeys.map((k) => {
      const label = clusterLabelMap[k] ?? k;
      const r = hubRadius(label, clusterCounts[k] ?? 1);
      return {
        id: `hub:${k}`,
        kind: 'hub',
        label,
        clusterKey: k,
        radius: r,
        x: clusterCenters[k].x,
        y: clusterCenters[k].y,
        fx: clusterCenters[k].x,
        fy: clusterCenters[k].y,
      };
    });

    // Person nodes
    const personNodes: GraphNode[] = contacts.map((c) => {
      const ck = clusterKeyOf(c);
      const center = clusterCenters[ck];
      return {
        id: c.id,
        kind: 'person',
        label: c.name || 'Unnamed',
        clusterKey: ck,
        radius: c.priority ? 14 : 10,
        priority: c.priority,
        followUpRecommended: c.followUpRecommended,
        x: center.x + (Math.random() - 0.5) * 80,
        y: center.y + (Math.random() - 0.5) * 80,
      };
    });

    const allNodes: GraphNode[] = [...hubNodes, ...personNodes];
    const personIdSet = new Set(personNodes.map((n) => n.id));

    const clusterLinks: GraphLink[] = personNodes.map((p) => ({
      source: p.id,
      target: `hub:${p.clusterKey}`,
      kind: 'cluster' as const,
    }));

    const referralLinks: GraphLink[] = [];
    contacts.forEach((c) => {
      c.referrals.forEach((r) => {
        if (r.contactId && personIdSet.has(r.contactId)) {
          referralLinks.push({ source: c.id, target: r.contactId, kind: 'referral' as const });
        }
      });
    });

    const allLinks: GraphLink[] = [...clusterLinks, ...referralLinks];

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 6])
      .on('zoom', (event) => g.attr('transform', event.transform.toString()));
    svg.call(zoom as any);

    const simulation = d3
      .forceSimulation(allNodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(allLinks)
          .id((d) => d.id)
          .distance((l) => {
            const hub = (l.target as GraphNode);
            const person = (l.source as GraphNode);
            return l.kind === 'cluster' ? (hub.radius ?? 34) + (person.radius ?? 10) + 28 : 110;
          })
          .strength((l) => (l.kind === 'cluster' ? 0.85 : 0.05))
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('collision', d3.forceCollide<GraphNode>((d) => d.radius + 6))
      .alphaDecay(0.025);

    // Cluster lines
    const clusterLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.cl')
      .data(clusterLinks)
      .join('line')
      .attr('class', 'cl')
      .attr('stroke', (d) => colorScale((d.source as GraphNode).clusterKey ?? ''))
      .attr('stroke-width', 1.5)
      .attr('opacity', darkMode ? 0.45 : 0.35);

    // Referral lines (dashed terracotta)
    const referralLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.rl')
      .data(referralLinks)
      .join('line')
      .attr('class', 'rl')
      .attr('stroke', '#c0603a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6 4')
      .attr('opacity', 0.85);

    // Hub nodes
    const hubEl = g
      .selectAll<SVGGElement, GraphNode>('g.hub')
      .data(hubNodes)
      .join('g')
      .attr('class', 'hub');

    hubEl.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', 'rgba(255,255,255,0.25)')
      .attr('stroke-width', 2);

    // Hub label — split into two lines if long
    hubEl.each(function (d) {
      const el = d3.select(this);
      const words = d.label.split(' ');
      if (words.length > 1 && d.label.length > 10) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.45em')
          .attr('font-size', `${Math.max(0.58, Math.min(0.74, d.radius / 55))}rem`)
          .attr('font-family', '-apple-system, sans-serif')
          .attr('font-weight', '700')
          .attr('fill', 'white')
          .attr('pointer-events', 'none')
          .attr('paint-order', 'stroke')
          .attr('stroke', colorScale(d.clusterKey))
          .attr('stroke-width', 3)
          .text(line1);
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.75em')
          .attr('font-size', `${Math.max(0.58, Math.min(0.74, d.radius / 55))}rem`)
          .attr('font-family', '-apple-system, sans-serif')
          .attr('font-weight', '700')
          .attr('fill', 'white')
          .attr('pointer-events', 'none')
          .attr('paint-order', 'stroke')
          .attr('stroke', colorScale(d.clusterKey))
          .attr('stroke-width', 3)
          .text(line2);
      } else {
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', `${Math.max(0.58, Math.min(0.74, d.radius / 55))}rem`)
          .attr('font-family', '-apple-system, sans-serif')
          .attr('font-weight', '700')
          .attr('fill', 'white')
          .attr('pointer-events', 'none')
          .attr('paint-order', 'stroke')
          .attr('stroke', colorScale(d.clusterKey))
          .attr('stroke-width', 3)
          .text(d.label);
      }
    });

    // Person nodes
    const personEl = g
      .selectAll<SVGGElement, GraphNode>('g.person')
      .data(personNodes)
      .join('g')
      .attr('class', 'person')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }) as any
      )
      .on('click', (_e, d) => callbackRef.current(d.id))
      .on('mouseenter', (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left + 14, y: event.clientY - rect.top - 10, text: d.label });
      })
      .on('mouseleave', () => setTooltip(null));

    personEl.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', (d) => (d.followUpRecommended ? '#e05c4a' : (darkMode ? 'rgba(255,255,255,0.3)' : 'white')))
      .attr('stroke-width', (d) => (d.followUpRecommended ? 2.5 : 1.5));

    personEl.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '0.55rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d) =>
        d.label.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
      );

    // Name label below person nodes
    personEl.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 11)
      .attr('font-size', '0.58rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('fill', textColor)
      .attr('opacity', 0.85)
      .attr('pointer-events', 'none')
      .text((d) => d.label.length > 16 ? d.label.slice(0, 15) + '…' : d.label);

    simulation.on('tick', () => {
      clusterLinkEl
        .attr('x1', (d) => ((d.source as GraphNode).x ?? 0))
        .attr('y1', (d) => ((d.source as GraphNode).y ?? 0))
        .attr('x2', (d) => ((d.target as GraphNode).x ?? 0))
        .attr('y2', (d) => ((d.target as GraphNode).y ?? 0));

      referralLinkEl
        .attr('x1', (d) => ((d.source as GraphNode).x ?? 0))
        .attr('y1', (d) => ((d.source as GraphNode).y ?? 0))
        .attr('x2', (d) => ((d.target as GraphNode).x ?? 0))
        .attr('y2', (d) => ((d.target as GraphNode).y ?? 0));

      hubEl.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      personEl.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { simulation.stop(); };
  }, [contacts, cluster, darkMode]);

  return (
    <div className="cn-graph-pane">
      <div className="cn-graph-toolbar">
        <span className="cn-section-label" style={{ margin: 0 }}>Cluster by</span>
        <button
          className={`cn-chip ${cluster === 'company' ? 'active' : ''}`}
          onClick={() => setCluster('company')}
        >
          Company
        </button>
        <button
          className={`cn-chip ${cluster === 'school' ? 'active' : ''}`}
          onClick={() => setCluster('school')}
        >
          School
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--cn-ink-faint)', fontFamily: 'sans-serif' }}>
          Lines = cluster · dashed = referral · red border = follow-up · click to open
        </span>
      </div>

      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} className="cn-graph-svg" width="100%" height="100%" style={{ display: 'block' }} />
        {tooltip && (
          <div className="cn-graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
