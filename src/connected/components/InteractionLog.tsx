import React, { useState } from 'react';
import type { Interaction, InteractionType } from '../types';

interface Props {
  interactions: Interaction[];
  onAdd: (interaction: Omit<Interaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function InteractionLog({ interactions, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<InteractionType>('call');
  const [note, setNote] = useState('');

  const sorted = [...interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function submit() {
    if (!note.trim()) return;
    onAdd({ date, type, note: note.trim() });
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    setType('call');
    setShowForm(false);
  }

  return (
    <div>
      <div className="cn-interaction-log">
        {sorted.length === 0 && (
          <div style={{ color: 'var(--cn-ink-faint)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
            No interactions logged yet.
          </div>
        )}
        {sorted.map((item, i) => (
          <div key={item.id} className="cn-interaction-item">
            <span className="cn-interaction-dot" />
            {i < sorted.length - 1 && <span className="cn-interaction-line" />}
            <div className="cn-interaction-meta">
              {item.date}<br />
              <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
            </div>
            <div className="cn-interaction-note">{item.note}</div>
            <button
              className="cn-icon-btn danger"
              onClick={() => onDelete(item.id)}
              title="Remove"
              style={{ fontSize: '0.75rem', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="cn-add-interaction">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value as InteractionType)}>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="message">Message</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="cn-btn-primary" onClick={submit}>Add</button>
            <button className="cn-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          className="cn-add-small-btn"
          style={{ marginTop: 10 }}
          onClick={() => setShowForm(true)}
        >
          + Log touchpoint
        </button>
      )}
    </div>
  );
}
