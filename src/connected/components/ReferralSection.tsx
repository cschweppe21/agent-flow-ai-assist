import React, { useState } from 'react';
import type { Referral } from '../types';

interface Props {
  referrals: Referral[];
  onAddReferral: (data: Omit<Referral, 'id' | 'contactId'>) => void;
  onDeleteReferral: (referralId: string) => void;
  onUpdateReferral: (referralId: string, updates: Partial<Referral>) => void;
  onNavigate: (contactId: string) => void;
}

export function ReferralSection({ referrals, onAddReferral, onDeleteReferral, onUpdateReferral, onNavigate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [smartContact, setSmartContact] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function submit() {
    const cleanName = name.replace(/,/g, '').trim();
    if (!cleanName) return;
    onAddReferral({ name: cleanName, company: company.trim() || undefined, school: school.trim() || undefined, smartContact: smartContact.trim() || undefined, date });
    setName('');
    setCompany('');
    setSchool('');
    setSmartContact('');
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }

  return (
    <div>
      {referrals.length === 0 && !showForm && (
        <div style={{ color: 'var(--cn-ink-faint)', fontSize: '0.8rem', fontFamily: 'sans-serif', marginBottom: 8 }}>
          No referrals yet.
        </div>
      )}

      {referrals.map((r) => (
        <div key={r.id} className="cn-referral-item" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, cursor: r.contactId ? 'pointer' : 'default' }} onClick={() => r.contactId && onNavigate(r.contactId)}>
            <div className="cn-referral-name">{r.name}</div>
            <div className="cn-referral-sub">
              {[r.company, r.school].filter(Boolean).join(' · ')}
              {r.smartContact && ` · ${r.smartContact}`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <input
              type="date"
              className="cn-field-input"
              value={r.date ?? ''}
              onChange={(e) => onUpdateReferral(r.id, { date: e.target.value || undefined })}
              style={{ fontSize: '0.7rem', padding: '2px 4px', width: 120 }}
              title="Referral date"
            />
            {r.contactId && (
              <span style={{ fontSize: '0.65rem', color: 'var(--cn-green)', fontFamily: 'sans-serif', cursor: 'pointer' }} onClick={() => onNavigate(r.contactId!)}>
                View →
              </span>
            )}
            <button
              className="cn-attachment-remove"
              onClick={() => { if (confirm(`Remove referral for ${r.name}?`)) onDeleteReferral(r.id); }}
              title="Remove referral"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="cn-add-referral-form">
          <div className="cn-referral-form-row">
            <input
              type="text"
              placeholder="Name (required)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <input
              type="date"
              className="cn-field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              title="Referral date"
            />
          </div>
          <div className="cn-referral-form-row">
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              type="text"
              placeholder="School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Email, phone, or LinkedIn URL"
            value={smartContact}
            onChange={(e) => setSmartContact(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="cn-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="cn-btn-primary" onClick={submit} disabled={!name.trim()}>
              Add
            </button>
          </div>
        </div>
      ) : (
        <button className="cn-add-small-btn" onClick={() => setShowForm(true)}>
          + Add referral
        </button>
      )}
    </div>
  );
}
