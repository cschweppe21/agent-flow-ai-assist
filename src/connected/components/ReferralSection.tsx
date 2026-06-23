import React, { useState } from 'react';
import type { Referral } from '../types';

interface Props {
  referrals: Referral[];
  onAddReferral: (data: Omit<Referral, 'id' | 'contactId'>) => void;
  onNavigate: (contactId: string) => void;
}

export function ReferralSection({ referrals, onAddReferral, onNavigate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [smartContact, setSmartContact] = useState('');

  function submit() {
    const cleanName = name.replace(/,/g, '').trim();
    if (!cleanName) return;
    onAddReferral({ name: cleanName, company: company.trim() || undefined, school: school.trim() || undefined, smartContact: smartContact.trim() || undefined });
    setName('');
    setCompany('');
    setSchool('');
    setSmartContact('');
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
        <div
          key={r.id}
          className="cn-referral-item"
          onClick={() => r.contactId && onNavigate(r.contactId)}
        >
          <div>
            <div className="cn-referral-name">{r.name}</div>
            <div className="cn-referral-sub">
              {[r.company, r.school].filter(Boolean).join(' · ')}
              {r.smartContact && ` · ${r.smartContact}`}
            </div>
          </div>
          {r.contactId && (
            <span style={{ fontSize: '0.65rem', color: 'var(--cn-green)', fontFamily: 'sans-serif' }}>
              View →
            </span>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="cn-add-referral-form">
          <input
            type="text"
            placeholder="Name (required)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
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
