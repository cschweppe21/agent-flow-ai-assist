import React, { useCallback } from 'react';
import type { Company, Contact } from '../types';

interface Props {
  company: Company;
  contacts: Contact[];
  onChange: (id: string, updates: Partial<Company>) => void;
  onDelete: (id: string) => void;
  onNavigateContact: (contactId: string) => void;
}

export function CompanyDetail({
  company,
  contacts,
  onChange,
  onDelete,
  onNavigateContact,
}: Props) {
  const update = useCallback(
    (field: keyof Company, value: unknown) => {
      onChange(company.id, { [field]: value } as Partial<Company>);
    },
    [company.id, onChange]
  );

  function openWebsite(url: string | undefined) {
    if (!url) return;
    const href = url.startsWith('http') ? url : `https://${url}`;
    const api = (window as any).electronAPI;
    if (api?.openUrl) api.openUrl(href);
    else window.open(href, '_blank');
  }

  // Find contacts whose company field matches this company name
  const linkedContacts = contacts.filter(
    (c) =>
      company.name.trim() &&
      c.company?.trim().toLowerCase() === company.name.trim().toLowerCase()
  );

  return (
    <div className="cn-detail-pane">
      {/* Name + action buttons */}
      <div className="cn-name-row">
        <textarea
          className="cn-contact-title-display"
          rows={1}
          placeholder="Company name"
          value={company.name}
          onChange={(e) => update('name', e.target.value)}
          style={{ resize: 'none', overflow: 'hidden' }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />
        <div className="cn-action-icons">
          <button
            className={`cn-icon-btn ${company.priority ? 'active' : ''}`}
            title={company.priority ? 'Unmark priority' : 'Mark priority'}
            onClick={() => update('priority', !company.priority)}
          >
            ★
          </button>
          <button
            className={`cn-icon-btn ${company.target ? 'active cn-target-active' : ''}`}
            title={company.target ? 'Remove Target flag' : 'Mark as Target'}
            style={{ fontSize: '0.72rem', fontFamily: 'sans-serif', letterSpacing: '0.03em' }}
            onClick={() => update('target', !company.target)}
          >
            Target
          </button>
          <button
            className="cn-icon-btn danger"
            title="Delete company"
            onClick={() => {
              if (confirm(`Delete ${company.name || 'this company'}?`)) onDelete(company.id);
            }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {company.priority && (
          <span style={{ fontSize: '0.7rem', background: 'var(--cn-accent)', color: 'white', borderRadius: 4, padding: '1px 7px', fontFamily: 'sans-serif' }}>
            Priority
          </span>
        )}
        {company.target && (
          <span style={{ fontSize: '0.7rem', background: '#2e7d5b', color: 'white', borderRadius: 4, padding: '1px 7px', fontFamily: 'sans-serif' }}>
            🎯 Target
          </span>
        )}
      </div>

      <div className="cn-divider" />

      {/* Core fields */}
      <div className="cn-section-label">Details</div>
      <div className="cn-fields-grid">
        <Field label="Industry">
          <input
            className="cn-field-input"
            value={company.industry ?? ''}
            placeholder="e.g. Investment Banking, Wealth Management…"
            onChange={(e) => update('industry', e.target.value || undefined)}
          />
        </Field>
        <Field label="Target Locations">
          <input
            className="cn-field-input"
            value={company.targetLocations ?? ''}
            placeholder="e.g. New York, Chicago…"
            onChange={(e) => update('targetLocations', e.target.value || undefined)}
          />
        </Field>
        <Field label="Website">
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              className="cn-field-input"
              value={company.website ?? ''}
              placeholder="company.com"
              onChange={(e) => update('website', e.target.value || undefined)}
              onDoubleClick={() => openWebsite(company.website)}
              title="Double-click to open in browser"
              style={{ flex: 1 }}
            />
            {company.website && (
              <button
                className="cn-icon-btn"
                title="Open website in browser"
                onClick={() => openWebsite(company.website)}
                style={{ fontSize: '0.7rem', padding: '2px 6px', flexShrink: 0 }}
              >
                ↗
              </button>
            )}
          </div>
        </Field>
      </div>

      <div className="cn-divider" />

      {/* Notes */}
      <div className="cn-section-label">Notes</div>
      <textarea
        className="cn-textarea"
        placeholder="Research, culture notes, contacts to target…"
        value={company.notes ?? ''}
        onChange={(e) => update('notes', e.target.value)}
        rows={5}
      />

      <div className="cn-divider" />

      {/* Associated contacts */}
      <div className="cn-section-label">
        Contacts at {company.name || 'this company'} · {linkedContacts.length}
      </div>
      {linkedContacts.length === 0 ? (
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--cn-ink-faint)',
            fontFamily: 'sans-serif',
            marginBottom: 12,
          }}
        >
          {company.name.trim()
            ? 'No contacts with this company name yet. Set a contact\'s Company field to link them here.'
            : 'Enter a company name to link contacts.'}
        </div>
      ) : (
        <div className="cn-company-contacts-list">
          {linkedContacts.map((c) => (
            <div
              key={c.id}
              className="cn-company-contact-row"
              onClick={() => onNavigateContact(c.id)}
            >
              <span className="cn-company-contact-name">
                {c.priority && <span className="cn-flag-priority">★</span>}
                {c.name || <em>Unnamed</em>}
              </span>
              <span className="cn-company-contact-title">
                {[c.title, c.status.replace(/_/g, ' ')].filter(Boolean).join(' · ')}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cn-field">
      <label className="cn-field-label">{label}</label>
      {children}
    </div>
  );
}
