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

const HUB_RADIUS = 62;
const PERSON_RADIUS = 12;

function wrapHubLabel(label: string): { lines: string[]; fontSize: number } {
  const maxWidth = HUB_RADIUS * 1.65;
  const BASE_CHAR_PX = 6.4;
  const MAX_FONT = 0.70;
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length * BASE_CHAR_PX > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const maxLen = Math.max(...lines.map((l) => l.length));
  const fontSize = Math.max(0.46, MAX_FONT * Math.min(1, maxWidth / (maxLen * BASE_CHAR_PX)));
  return { lines, fontSize };
}

export function NetworkGraph({ contacts, onSelectContact, darkMode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onSelectContact);
  callbackRef.current = onSelectContact;

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const hubPositionsRef = useRef<Map<string, { x: number; y: number; label: string }>>(new Map());
  const hubElRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);

  const [cluster, setCluster] = useState<GraphCluster>('company');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [searchMsg, setSearchMsg] = useState('');

  function handleSearch() {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !svgRef.current || !containerRef.current) return;

    let match: { x: number; y: number; key: string } | null = null;
    for (const [key, pos] of hubPositionsRef.current.entries()) {
      if (pos.label.toLowerCase().includes(q)) {
        match = { x: pos.x, y: pos.y, key };
        break;
      }
    }

    if (!match || !zoomRef.current) {
      setSearchMsg('No match found');
      return;
    }

    setSearchMsg('');
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scale = 2.2;
    d3.select(svgRef.current)
      .transition()
      .duration(700)
      .ease(d3.easeCubicInOut)
      .call(
        zoomRef.current.transform as any,
        d3.zoomIdentity
          .translate(width / 2 - scale * match.x, height / 2 - scale * match.y)
          .scale(scale)
      );
    setHighlightedKey(match.key);
  }

  function clearSearch() {
    setSearchQuery('');
    setHighlightedKey(null);
    setSearchMsg('');
  }

  // Update hub highlight without re-running simulation
  useEffect(() => {
    if (!hubElRef.current) return;
    hubElRef.current.select('circle')
      .attr('stroke', (d) => d.clusterKey === highlightedKey ? '#FFD700' : 'rgba(255,255,255,0.25)')
      .attr('stroke-width', (d) => d.clusterKey === highlightedKey ? 5 : 2);
  }, [highlightedKey]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    hubPositionsRef.current.clear();
    hubElRef.current = null;
    setHighlightedKey(null);
    setSearchMsg('');

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

    const clusterKeyOf = (c: Contact) => {
      if (cluster === 'company') return c.company ?? '__none__';
      if (cluster === 'school') return c.school ?? '__none__';
      return c.industry ?? '__none__';
    };
    const clusterLabelOf = (c: Contact) => {
      if (cluster === 'company') return c.company ?? 'No company';
      if (cluster === 'school') return c.school ?? 'No school';
      return c.industry ?? 'No industry';
    };

    const clusterKeys = Array.from(new Set(contacts.map(clusterKeyOf)));
    const clusterLabelMap: Record<string, string> = {};
    contacts.forEach((c) => { clusterLabelMap[clusterKeyOf(c)] = clusterLabelOf(c); });

    const colorScale = d3.scaleOrdinal<string, string>().domain(clusterKeys).range(CLUSTER_COLORS);

    const numClusters = clusterKeys.length;
    const ringR = Math.min(width, height) * (numClusters === 1 ? 0 : 0.40);
    const clusterCenters: Record<string, { x: number; y: number }> = {};
    clusterKeys.forEach((k, i) => {
      const angle = (i / numClusters) * 2 * Math.PI - Math.PI / 2;
      clusterCenters[k] = {
        x: width / 2 + ringR * Math.cos(angle),
        y: height / 2 + ringR * Math.sin(angle),
      };
    });

    clusterKeys.forEach((k) => {
      hubPositionsRef.current.set(k, { ...clusterCenters[k], label: clusterLabelMap[k] ?? k });
    });

    const hubNodes: GraphNode[] = clusterKeys.map((k) => ({
      id: `hub:${k}`,
      kind: 'hub' as NodeKind,
      label: clusterLabelMap[k] ?? k,
      clusterKey: k,
      radius: HUB_RADIUS,
      x: clusterCenters[k].x,
      y: clusterCenters[k].y,
      fx: clusterCenters[k].x,
      fy: clusterCenters[k].y,
    }));

    const personNodes: GraphNode[] = contacts.map((c) => {
      const ck = clusterKeyOf(c);
      const center = clusterCenters[ck];
      return {
        id: c.id,
        kind: 'person' as NodeKind,
        label: c.name || 'Unnamed',
        clusterKey: ck,
        radius: PERSON_RADIUS,
        priority: c.priority,
        followUpRecommended: c.followUpRecommended,
        x: center.x + (Math.random() - 0.5) * 100,
        y: center.y + (Math.random() - 0.5) * 100,
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

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.08, 8])
      .on('zoom', (event) => g.attr('transform', event.transform.toString()));
    svg.call(zoom as any);
    zoomRef.current = zoom;

    const simulation = d3
      .forceSimulation(allNodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>([...clusterLinks, ...referralLinks])
          .id((d) => d.id)
          .distance((l) => l.kind === 'cluster' ? HUB_RADIUS + PERSON_RADIUS + 70 : 150)
          .strength((l) => (l.kind === 'cluster' ? 0.9 : 0.05))
      )
      .force('charge', d3.forceManyBody().strength(-480))
      .force('collision', d3.forceCollide<GraphNode>((d) => d.radius + 20))
      .alphaDecay(0.022);

    const clusterLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.cl')
      .data(clusterLinks)
      .join('line')
      .attr('class', 'cl')
      .attr('stroke', (d) => colorScale((d.source as GraphNode).clusterKey ?? ''))
      .attr('stroke-width', 1.5)
      .attr('opacity', darkMode ? 0.45 : 0.35);

    const referralLinkEl = g
      .selectAll<SVGLineElement, GraphLink>('line.rl')
      .data(referralLinks)
      .join('line')
      .attr('class', 'rl')
      .attr('stroke', '#c0603a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6 4')
      .attr('opacity', 0.85);

    const hubEl = g
      .selectAll<SVGGElement, GraphNode>('g.hub')
      .data(hubNodes)
      .join('g')
      .attr('class', 'hub');

    hubElRef.current = hubEl;

    hubEl.append('circle')
      .attr('r', HUB_RADIUS)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', 'rgba(255,255,255,0.25)')
      .attr('stroke-width', 2);

    hubEl.each(function (d) {
      const el = d3.select(this);
      const { lines, fontSize } = wrapHubLabel(d.label);
      const lineHeightPx = fontSize * 16 * 1.3;
      const totalH = lines.length * lineHeightPx;
      lines.forEach((lineText, i) => {
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -totalH / 2 + i * lineHeightPx + lineHeightPx * 0.72)
          .attr('font-size', `${fontSize}rem`)
          .attr('font-family', '-apple-system, sans-serif')
          .attr('font-weight', '700')
          .attr('fill', 'white')
          .attr('pointer-events', 'none')
          .text(lineText);
      });
    });

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
      .attr('r', PERSON_RADIUS)
      .attr('fill', (d) => colorScale(d.clusterKey))
      .attr('stroke', (d) => d.followUpRecommended ? '#e05c4a' : (darkMode ? 'rgba(255,255,255,0.3)' : 'white'))
      .attr('stroke-width', (d) => d.followUpRecommended ? 2.5 : 1.5);

    personEl.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '0.55rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d) => d.label.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase());

    personEl.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', PERSON_RADIUS + 11)
      .attr('font-size', '0.58rem')
      .attr('font-family', '-apple-system, sans-serif')
      .attr('fill', textColor)
      .attr('opacity', 0.85)
      .attr('pointer-events', 'none')
      .text((d) => d.label.length > 16 ? d.label.slice(0, 15) + '…' : d.label);

    simulation.on('tick', () => {
      clusterLinkEl
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
      referralLinkEl
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
      hubEl.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      personEl.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { simulation.stop(); };
  }, [contacts, cluster, darkMode]);

  return (
    <div className="cn-graph-pane">
      <div className="cn-graph-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%' }}>
          <span className="cn-section-label" style={{ margin: 0 }}>Cluster by</span>
          <button className={`cn-chip ${cluster === 'company' ? 'active' : ''}`} onClick={() => setCluster('company')}>Company</button>
          <button className={`cn-chip ${cluster === 'school' ? 'active' : ''}`} onClick={() => setCluster('school')}>School</button>
          <button className={`cn-chip ${cluster === 'industry' ? 'active' : ''}`} onClick={() => setCluster('industry')}>Industry</button>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--cn-ink-faint)', fontFamily: 'sans-serif' }}>
            Lines = group · dashed = referral · red border = follow-up · click to open
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            className="cn-search"
            type="text"
            placeholder={`Search ${cluster}…`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchMsg(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ maxWidth: 200, height: 28 }}
          />
          <button className="cn-btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={handleSearch}>Find</button>
          {(highlightedKey || searchMsg) && (
            <button className="cn-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={clearSearch}>Clear</button>
          )}
          {searchMsg && (
            <span style={{ fontSize: '0.68rem', color: 'var(--cn-ink-faint)', fontFamily: 'sans-serif' }}>{searchMsg}</span>
          )}
        </div>
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
