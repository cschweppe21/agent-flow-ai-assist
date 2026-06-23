import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Contact } from '../types';
import type { GraphCluster } from '../types';

interface Props {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  company?: string;
  school?: string;
  gradYear?: string;
  clusterKey: string;
  clusterLabel: string;
  priority: boolean;
  followUpRecommended?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  referral: boolean;
}

const CLUSTER_COLORS = [
  '#2E5141', '#3a7a5a', '#5b8c5a', '#7fa87f',
  '#a06b3c', '#c08040', '#7a5c8c', '#5c7a8c',
  '#8c5c5c', '#6e8c6e', '#3c5c8c', '#8c7a3c',
];

export function NetworkGraph({ contacts, onSelectContact }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cluster, setCluster] = useState<GraphCluster>('company');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    // Build nodes
    const nodes: GraphNode[] = contacts.map((c) => {
      let clusterKey = '';
      let clusterLabel = '';
      if (cluster === 'company') {
        clusterKey = c.company ?? '__none__';
        clusterLabel = c.company ?? '(No company)';
      } else {
        const school = c.school ?? '__none__';
        const year = c.gradYear ? `'${c.gradYear.slice(-2)}` : '';
        clusterKey = school;
        clusterLabel = c.school ? `${c.school}${year ? ' ' + year : ''}` : '(No school)';
      }
      return {
        id: c.id,
        name: c.name || 'Unnamed',
        company: c.company,
        school: c.school,
        gradYear: c.gradYear,
        clusterKey,
        clusterLabel,
        priority: c.priority,
        followUpRecommended: c.followUpRecommended,
      };
    });

    // Build links: referral relationships
    const links: GraphLink[] = [];
    contacts.forEach((c) => {
      c.referrals.forEach((r) => {
        if (r.contactId) {
          links.push({ source: c.id, target: r.contactId, referral: true });
        }
      });
    });

    // Cluster color map
    const clusterKeys = Array.from(new Set(nodes.map((n) => n.clusterKey)));
    const colorScale = d3.scaleOrdinal<string, string>().domain(clusterKeys).range(CLUSTER_COLORS);

    // Cluster centers
    const numClusters = clusterKeys.length;
    const clusterCenters: Record<string, { x: number; y: number }> = {};
    clusterKeys.forEach((k, i) => {
      const angle = (i / numClusters) * 2 * Math.PI;
      const r = Math.min(width, height) * 0.32;
      clusterCenters[k] = {
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle),
      };
    });

    // Initialize node positions near cluster center
    nodes.forEach((n) => {
      const center = clusterCenters[n.clusterKey];
      n.x = center.x + (Math.random() - 0.5) * 60;
      n.y = center.y + (Math.random() - 0.5) * 60;
    });

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    svg.call(zoom as any);

    // Simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('cluster', () => {
        nodes.forEach((n) => {
          const center = clusterCenters[n.clusterKey];
          n.vx = (n.vx ?? 0) + (center.x - (n.x ?? 0)) * 0.04;
          n.vy = (n.vy ?? 0) + (center.y - (n.y ?? 0)) * 0.04;
        });
      })
      .force('collision', d3.forceCollide(22));

    // Draw cluster halos (faint circles behind clusters)
    clusterKeys.forEach((k) => {
      const center = clusterCenters[k];
      const count = nodes.filter((n) => n.clusterKey === k).length;
      if (count === 0) return;
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', Math.max(50, count * 20))
        .attr('fill', colorScale(k))
        .attr('opacity', 0.05)
        .attr('stroke', colorScale(k))
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');

      // Cluster label
      g.append('text')
        .attr('x', center.x)
        .attr('y', center.y - Math.max(50, count * 20) - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', '0.65rem')
        .attr('font-family', '-apple-system, sans-serif')
        .attr('letter-spacing', '0.08em')
        .attr('text-transform', 'uppercase')
        .attr('fill', colorScale(k))
        .attr('opacity', 0.7)
        .text(k === '__none__' ? '' : k);
    });

    // Draw links
    const linkEl = g
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.referral ? '5 4' : null))
      .attr('opacity', 0.6);

    // Draw nodes
    const nodeEl = g
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      )
      .on('click', (_event, d) => {
        onSelectContact(d.id);
      })
      .on('mouseenter', (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 8,
          text: `${d.name}${d.company ? ` · ${d.company}` : ''}`,
        });
      })
      .on('mouseleave', () => setTooltip(null));

    nodeEl
      .append('circle')
      .attr('r', (d) => (d.priority ? 14 : 10))
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', (d) => (d.followUpRecommended ? '#c0392b' : 'white'))
      .attr('stroke-width', (d) => (d.followUpRecommended ? 2.5 : 2));

    nodeEl
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '0.55rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d) => d.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase());

    // Tick
    simulation.on('tick', () => {
      linkEl
        .attr('x1', (d) => ((d.source as GraphNode).x ?? 0))
        .attr('y1', (d) => ((d.source as GraphNode).y ?? 0))
        .attr('x2', (d) => ((d.target as GraphNode).x ?? 0))
        .attr('y2', (d) => ((d.target as GraphNode).y ?? 0));

      nodeEl.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [contacts, cluster, onSelectContact]);

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
          Dashed lines = referrals · Red border = follow-up needed · Click node to open
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
          <div
            className="cn-graph-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
