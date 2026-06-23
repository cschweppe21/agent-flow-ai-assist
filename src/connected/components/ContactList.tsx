import React, { useState, useMemo } from 'react';
import type { Contact, FilterMode, SortField } from '../types';
import { avgRating, lastInteractionDate } from '../storage';

interface Props {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function ContactList({ contacts, selectedId, onSelect, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortField>('name');
  const [ageFilter, setAgeFilter] = useState<string>('any');

  const now = new Date();

  const filtered = useMemo(() => {
    let list = [...contacts];

    // Full-text search across multiple fields
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company ?? '').toLowerCase().includes(q) ||
          (c.title ?? '').toLowerCase().includes(q) ||
          (c.industry ?? '').toLowerCase().includes(q) ||
          (c.school ?? '').toLowerCase().includes(q) ||
          (c.notes ?? '').toLowerCase().includes(q)
      );
    }

    // Quick filters
    if (filter === 'followUp') list = list.filter((c) => c.followUpRecommended);
    if (filter === 'priority') list = list.filter((c) => c.priority);

    // Relationship-age filter
    if (ageFilter !== 'any') {
      const months = parseInt(ageFilter, 10);
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - months);
      list = list.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= cutoff;
      });
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return (a.company ?? '').localeCompare(b.company ?? '');
        case 'followUp': {
          const aDate = a.followUpDate ? new Date(a.followUpDate) : new Date(8640000000000000);
          const bDate = b.followUpDate ? new Date(b.followUpDate) : new Date(8640000000000000);
          return aDate.getTime() - bDate.getTime();
        }
        case 'recency': {
          const aLast = lastInteractionDate(a)?.getTime() ?? new Date(a.createdAt).getTime();
          const bLast = lastInteractionDate(b)?.getTime() ?? new Date(b.createdAt).getTime();
          return bLast - aLast;
        }
        case 'rating':
          return avgRating(b) - avgRating(a);
        default:
          return 0;
      }
    });

    return list;
  }, [contacts, query, filter, sort, ageFilter]);

  return (
    <>
      <div className="cn-list-toolbar">
        <input
          className="cn-search"
          type="text"
          placeholder="Search contacts…"
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
            className={`cn-chip ${filter === 'followUp' ? 'active' : ''}`}
            onClick={() => setFilter('followUp')}
          >
            Follow-up
          </button>
          <button
            className={`cn-chip ${filter === 'priority' ? 'active' : ''}`}
            onClick={() => setFilter('priority')}
          >
            Priority
          </button>
          <select
            className="cn-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
          >
            <option value="name">Name</option>
            <option value="company">Company</option>
            <option value="followUp">Follow-up</option>
            <option value="recency">Recency</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <select
          className="cn-age-filter"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
        >
          <option value="any">Any age</option>
          <option value="3">Last 3 mo</option>
          <option value="6">Last 6 mo</option>
          <option value="12">Last 12 mo</option>
          <option value="24">Last 2 yr</option>
        </select>
      </div>

      <div className="cn-contact-list">
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', color: 'var(--cn-ink-faint)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
            No contacts found.
          </div>
        )}
        {filtered.map((c) => (
          <ContactRow key={c.id} contact={c} selected={c.id === selectedId} onSelect={onSelect} />
        ))}
      </div>

      <button className="cn-add-btn" onClick={onAdd}>
        + New Contact
      </button>
    </>
  );
}

function ContactRow({
  contact,
  selected,
  onSelect,
}: {
  contact: Contact;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`cn-contact-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(contact.id)}
    >
      <div className="cn-contact-name">
        {contact.priority && <span className="cn-flag-priority">★</span>}
        {contact.name || <span style={{ color: 'var(--cn-ink-faint)', fontStyle: 'italic' }}>Unnamed</span>}
        {contact.alumni && <span className="cn-flag-alumni">Alumni</span>}
        {contact.followUpRecommended && <span className="cn-flag-followup" title="Follow-up recommended" />}
      </div>
      <div className="cn-contact-sub">
        {[contact.title, contact.company].filter(Boolean).join(' · ') || (
          <span style={{ color: 'var(--cn-ink-faint)' }}>{statusLabel(contact.status)}</span>
        )}
      </div>
    </div>
  );
}

function statusLabel(s: Contact['status']): string {
  const map: Record<Contact['status'], string> = {
    to_reach_out: 'To reach out',
    reached_out: 'Reached out',
    in_conversation: 'In conversation',
    met: 'Met',
    ongoing: 'Ongoing',
    dormant: 'Dormant',
  };
  return map[s];
}
