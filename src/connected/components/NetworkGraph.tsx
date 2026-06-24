import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Contact } from '../types';
import type { GraphCluster } from '../types';

interface Props {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
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
  '#2E5141', '#3a7a5a', '#5b8c5a', '#7fa87f',
  '#a06b3c', '#c08040', '#7a5c8c', '#5c7a8c',
  '#8c5c5c', '#6e8c6e', '#3c5c8c', '#8c7a3c',
];

export function NetworkGraph({ contacts, onSelectContact }: Props) {
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

    if (contacts.length === 0) {
      svg.append('text')
        .attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9a9a94')
        .attr('font-size', '0.85rem')
        .attr('font-family', '-apple-system, sans-serif')
        .text('Add contacts to see the web');
      return;
    }

    // Cluster keys and counts
    const clusterKeyOf = (c: Contact) =>
      cluster === 'company'
        ? (c.company ?? '__none__')
        : (c.school ?? '__none__');

    const clusterLabelOf = (c: Contact) => {
      if (cluster === 'company') return c.company ?? '(No company)';
      if (!c.school) return '(No school)';
      const year = c.gradYear ? ` '${c.gradYear.slice(-2)}` : '';
      return `${c.school}${year}`;
    };

    const clusterKeys = Array.from(new Set(contacts.map(clusterKeyOf)));
    const clusterCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      const k = clusterKeyOf(c);
      clusterCounts[k] = (clusterCounts[k] ?? 0) + 1;
    });

    const colorScale = d3.scaleOrdinal<string, string>().domain(clusterKeys).range(CLUSTER_COLORS);

    // Hub centers arranged in a ring
    const numClusters = clusterKeys.length;
    const ringR = Math.min(width, height) * (numClusters === 1 ? 0 : 0.3);
    const clusterCenters: Record<string, { x: number; y: number }> = {};
    clusterKeys.forEach((k, i) => {
      const angle = (i / numClusters) * 2 * Math.PI - Math.PI / 2;
      clusterCenters[k] = {
        x: width / 2 + ringR * Math.cos(angle),
        y: height / 2 + ringR * Math.sin(angle),
      };
    });

    // Build hub nodes (fixed at cluster centers)
    const hubNodes: GraphNode[] = clusterKeys.map((k) => {
      const label = cluster === 'company'
        ? (k === '__none__' ? 'No company' : k)
        : (k === '__none__' ? 'No school' : k);
      return {
        id: `hub:${k}`,
        kind: 'hub',
        label,
        clusterKey: k,
        radius: Math.max(26, Math.sqrt(clusterCounts[k] ?? 1) * 13),
        x: clusterCenters[k].x,
        y: clusterCenters[k].y,
        fx: clusterCenters[k].x,
        fy: clusterCenters[k].y,
      };
    });

    // Build person nodes
    const personNodes: GraphNode[] = contacts.map((c) => {
      const ck = clusterKeyOf(c);
      const center = clusterCenters[ck];
      return {
        id: c.id,
        kind: 'person',
        label: c.name || 'Unnamed',
        clusterKey: ck,
        radius: c.priority ? 13 : 9,
        priority: c.priority,
        followUpRecommended: c.followUpRecommended,
        x: center.x + (Math.random() - 0.5) * 60,
        y: center.y + (Math.random() - 0.5) * 60,
      };
    });

    const allNodes: GraphNode[] = [...hubNodes, ...personNodes];
    const personIdSet = new Set(personNodes.map((n) => n.id));

    // Cluster links: person → their hub
    const clusterLinks: GraphLink[] = personNodes.map((p) => ({
      source: p.id,
      target: `hub:${p.clusterKey}`,
      kind: 'cluster' as const,
    }));

    // Referral links: person → person (both must exist)
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

    // Zoom/pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => g.attr('transform', event.transform.toString()));
    svg.call(zoom as any);

    // Simulation
    const simulation = d3
      .forceSimulation(allNodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(allLinks)
          .id((d) => d.id)
          .distance((l) => {
            if (l.kind === 'cluster') {
              const pNode = (l.source as GraphNode);
              const hNode = (l.target as GraphNode);
              return (hNode.radius ?? 26) + (pNode.radius ?? 9) + 30;
            }
            return 100;
          })
          .strength((l) => (l.kind === 'cluster' ? 0.9 : 0.05))
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('collision', d3.forceCollide<GraphNode>((d) => d.radius + 5))
      .alphaDecay(0.025);

    // Draw cluster links
    const clusterLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.cl')
      .data(clusterLinks)
      .join('line')
      .attr('class', 'cl')
      .attr('stroke', (d) => colorScale((d.source as GraphNode).clusterKey ?? ''))
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.35);

    // Draw referral links
    const referralLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.rl')
      .data(referralLinks)
      .join('line')
      .attr('class', 'rl')
      .attr('stroke', '#b5533c')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '5 4')
      .attr('opacity', 0.75);

    // Draw hub nodes
    const hubEl = g
      .selectAll<SVGGElement, GraphNode>('g.hub')
      .data(hubNodes)
      .join('g')
      .attr('class', 'hub');

    hubEl
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('opacity', 0.9);

    hubEl
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => `${Math.max(0.55, Math.min(0.75, d.radius / 40))}rem`)
      .attr('font-family', '-apple-system, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d) => d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label);

    // Draw person nodes
    const personEl = g
      .selectAll<SVGGElement, GraphNode>('g.person')
      .data(personNodes)
      .join('g')
      .attr('class', 'person')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
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

    personEl
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', (d) => (d.followUpRecommended ? '#c0392b' : 'white'))
      .attr('stroke-width', (d) => (d.followUpRecommended ? 2.5 : 1.5));

    personEl
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '0.5rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d) =>
        d.label.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
      );

    // Tick
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
  }, [contacts, cluster]); // onSelectContact intentionally excluded — use callbackRef

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
          School + Year
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--cn-ink-faint)', fontFamily: 'sans-serif' }}>
          — lines to hub = cluster · dashed orange = referral · red border = follow-up · click to open
        </span>
      </div>

      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          className="cn-graph-svg"
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        />
        {tooltip && (
          <div className="cn-graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
