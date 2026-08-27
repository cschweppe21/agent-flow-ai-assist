import React, { useState, useMemo } from 'react';
import type { Company } from '../types';

interface Props {
  companies: Company[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

type CompanyFilter = 'all' | 'target' | 'priority';

export function CompanyList({ companies, selectedId, onSelect, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CompanyFilter>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('');

  const industries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => { if (c.industry?.trim()) set.add(c.industry.trim()); });
    return Array.from(set).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    let list = [...companies];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry ?? '').toLowerCase().includes(q) ||
          (c.targetLocations ?? '').toLowerCase().includes(q) ||
          (c.notes ?? '').toLowerCase().includes(q)
      );
    }

    if (filter === 'target') list = list.filter((c) => c.target);
    if (filter === 'priority') list = list.filter((c) => c.priority);

    if (industryFilter) {
      list = list.filter((c) => (c.industry ?? '').trim() === industryFilter);
    }

    list.sort((a, b) => {
      // Priority first, then target, then alpha
      if (b.priority !== a.priority) return b.priority ? 1 : -1;
      if (b.target !== a.target) return b.target ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [companies, query, filter, industryFilter]);

  return (
    <>
      <div className="cn-list-toolbar">
        <input
          className="cn-search"
          type="text"
          placeholder="Search companies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="cn-filter-row">
          <button
            className={`cn-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`cn-chip ${filter === 'target' ? 'active' : ''}`}
            onClick={() => setFilter('target')}
          >
            Target
          </button>
          <button
            className={`cn-chip ${filter === 'priority' ? 'active' : ''}`}
            onClick={() => setFilter('priority')}
          >
            Priority
          </button>
        </div>
        {industries.length > 0 && (
          <select
            className="cn-sort-select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="">All industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        )}
      </div>

      <div className="cn-contact-list">
        {filtered.length === 0 && (
          <div
            style={{
              padding: '24px 16px',
              color: 'var(--cn-ink-faint)',
              fontSize: '0.8rem',
              fontFamily: 'sans-serif',
            }}
          >
            No companies found.
          </div>
        )}

        {filtered.map((company) => (
          <CompanyRow
            key={company.id}
            company={company}
            selected={company.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <button className="cn-add-btn" onClick={onAdd}>
        + New Company
      </button>
    </>
  );
}

function CompanyRow({
  company,
  selected,
  onSelect,
}: {
  company: Company;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`cn-contact-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(company.id)}
    >
      <div className="cn-contact-name">
        {company.priority && <span className="cn-flag-priority">★</span>}
        {company.name || (
          <span style={{ color: 'var(--cn-ink-faint)', fontStyle: 'italic' }}>Unnamed</span>
        )}
        {company.target && <span className="cn-flag-target">Target</span>}
      </div>
      <div className="cn-contact-sub">
        {company.industry || (
          <span style={{ color: 'var(--cn-ink-faint)' }}>No industry set</span>
        )}
      </div>
    </div>
  );
}
