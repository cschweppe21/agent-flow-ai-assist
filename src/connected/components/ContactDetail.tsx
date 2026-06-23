import React, { useEffect, useState, useCallback } from 'react';
import type { Contact, ContactStatus, Interaction, Referral } from '../types';
import { RatingStars } from './RatingStars';
import { InteractionLog } from './InteractionLog';
import { GroundworkSection } from './GroundworkSection';
import { ReferralSection } from './ReferralSection';

interface Props {
  contact: Contact;
  contacts: Contact[];
  onChange: (id: string, updates: Partial<Contact>) => void;
  onDelete: (id: string) => void;
  onAddInteraction: (contactId: string, interaction: Omit<Interaction, 'id'>) => void;
  onDeleteInteraction: (contactId: string, interactionId: string) => void;
  onAddReferral: (referrerId: string, data: Omit<Referral, 'id' | 'contactId'>) => void;
  onNavigate: (contactId: string) => void;
}

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'to_reach_out', label: 'To reach out' },
  { value: 'reached_out', label: 'Reached out' },
  { value: 'in_conversation', label: 'In conversation' },
  { value: 'met', label: 'Met' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'dormant', label: 'Dormant' },
];

export function ContactDetail({
  contact,
  contacts,
  onChange,
  onDelete,
  onAddInteraction,
  onDeleteInteraction,
  onAddReferral,
  onNavigate,
}: Props) {
  const update = useCallback(
    (field: keyof Contact, value: unknown) => {
      onChange(contact.id, { [field]: value } as Partial<Contact>);
    },
    [contact.id, onChange]
  );

  const referredBy = contact.referredById
    ? contacts.find((c) => c.id === contact.referredById)
    : null;

  return (
    <div className="cn-detail-pane">
      {/* Name + action buttons */}
      <div className="cn-name-row">
        <textarea
          className="cn-contact-title-display"
          rows={1}
          placeholder="Full name"
          value={contact.name}
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
            className={`cn-icon-btn ${contact.priority ? 'active' : ''}`}
            title={contact.priority ? 'Unmark priority' : 'Mark priority'}
            onClick={() => update('priority', !contact.priority)}
          >
            ★
          </button>
          <button
            className={`cn-icon-btn ${contact.alumni ? 'active' : ''}`}
            title={contact.alumni ? 'Remove alumni flag' : 'Mark as alumni'}
            onClick={() => update('alumni', !contact.alumni)}
            style={{ fontSize: '0.75rem', fontFamily: 'sans-serif', letterSpacing: '0.03em' }}
          >
            Alumni
          </button>
          <button
            className="cn-icon-btn danger"
            title="Delete contact"
            onClick={() => {
              if (confirm(`Delete ${contact.name || 'this contact'}?`)) onDelete(contact.id);
            }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Status + follow-up */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <span className={`cn-status cn-status-${contact.status}`}>
          {STATUS_OPTIONS.find((o) => o.value === contact.status)?.label}
        </span>
        {contact.followUpRecommended && (
          <span className="cn-followup-flag">
            <span className="cn-flag-followup" />
            Follow-up recommended
          </span>
        )}
        {referredBy && (
          <span
            style={{ fontSize: '0.72rem', color: 'var(--cn-ink-faint)', fontFamily: 'sans-serif', cursor: 'pointer' }}
            onClick={() => onNavigate(referredBy.id)}
          >
            Referred by <strong style={{ color: 'var(--cn-ink)' }}>{referredBy.name}</strong>
          </span>
        )}
      </div>

      <div className="cn-divider" />

      {/* Core fields */}
      <div className="cn-section-label">Details</div>
      <div className="cn-fields-grid">
        <Field label="Title">
          <input className="cn-field-input" value={contact.title ?? ''} placeholder="Title" onChange={(e) => update('title', e.target.value)} />
        </Field>
        <Field label="Company">
          <input className="cn-field-input" value={contact.company ?? ''} placeholder="Company" onChange={(e) => update('company', e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="cn-field-input" type="email" value={contact.email ?? ''} placeholder="email@example.com" onChange={(e) => update('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="cn-field-input" type="tel" value={contact.phone ?? ''} placeholder="+1 (555) 000-0000" onChange={(e) => update('phone', e.target.value)} />
        </Field>
        <Field label="LinkedIn">
          <input className="cn-field-input" value={contact.linkedIn ?? ''} placeholder="linkedin.com/in/…" onChange={(e) => update('linkedIn', e.target.value)} />
        </Field>
        <Field label="Industry">
          <input className="cn-field-input" value={contact.industry ?? ''} placeholder="Industry" onChange={(e) => update('industry', e.target.value)} />
        </Field>
        <Field label="School">
          <input className="cn-field-input" value={contact.school ?? ''} placeholder="University" onChange={(e) => update('school', e.target.value)} />
        </Field>
        <Field label="Grad Year">
          <input className="cn-field-input" value={contact.gradYear ?? ''} placeholder="2020" onChange={(e) => update('gradYear', e.target.value)} />
        </Field>
        <Field label="Status">
          <select
            className="cn-select-input"
            value={contact.status}
            onChange={(e) => update('status', e.target.value as ContactStatus)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Follow-up Date">
          <input
            className="cn-field-input"
            type="date"
            value={contact.followUpDate ?? ''}
            onChange={(e) => update('followUpDate', e.target.value || undefined)}
          />
        </Field>
      </div>

      <div className="cn-divider" />

      {/* Ratings */}
      <div className="cn-section-label">Relationship Ratings</div>
      <div className="cn-ratings-row">
        <RatingStars
          label="Responsiveness"
          value={contact.ratings.responsiveness}
          onChange={(v) => update('ratings', { ...contact.ratings, responsiveness: v })}
        />
        <RatingStars
          label="Rapport"
          value={contact.ratings.rapport}
          onChange={(v) => update('ratings', { ...contact.ratings, rapport: v })}
        />
        <RatingStars
          label="Helpfulness"
          value={contact.ratings.helpfulness}
          onChange={(v) => update('ratings', { ...contact.ratings, helpfulness: v })}
        />
      </div>

      <div className="cn-divider" />

      {/* Notes */}
      <div className="cn-section-label">Notes</div>
      <textarea
        className="cn-textarea"
        placeholder="Free-form notes…"
        value={contact.notes}
        onChange={(e) => update('notes', e.target.value)}
        rows={5}
      />

      <div className="cn-divider" />

      {/* Groundwork */}
      <div className="cn-section-label">Groundwork Prep</div>
      <GroundworkSection
        groundwork={contact.groundwork}
        onChange={(g) => update('groundwork', g)}
      />

      <div className="cn-divider" />

      {/* Referrals */}
      <div className="cn-section-label">Referrals</div>
      <ReferralSection
        referrals={contact.referrals}
        onAddReferral={(data) => onAddReferral(contact.id, data)}
        onNavigate={onNavigate}
      />

      <div className="cn-divider" />

      {/* Interaction Log */}
      <div className="cn-section-label">Interaction Log</div>
      <InteractionLog
        interactions={contact.interactions}
        onAdd={(interaction) => onAddInteraction(contact.id, interaction)}
        onDelete={(interactionId) => onDeleteInteraction(contact.id, interactionId)}
      />

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
