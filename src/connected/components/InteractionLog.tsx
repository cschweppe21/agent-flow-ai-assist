import React, { useState } from 'react';
import type { Interaction, InteractionType } from '../types';

interface Props {
  interactions: Interaction[];
  onAdd: (interaction: Omit<Interaction, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Interaction>) => void;
}

const TYPE_OPTIONS: InteractionType[] = ['call', 'email', 'meeting', 'message', 'event', 'other'];

export function InteractionLog({ interactions, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<InteractionType>('call');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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
            {editingId === item.id ? (
              <EditRow
                item={item}
                onSave={(updates) => { onUpdate(item.id, updates); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="cn-interaction-meta" style={{ cursor: 'pointer' }} onClick={() => setEditingId(item.id)}>
                  {item.date}<br />
                  <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                </div>
                <div
                  className="cn-interaction-note"
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => setEditingId(item.id)}
                >
                  {item.note}
                </div>
                <button
                  className="cn-icon-btn danger"
                  onClick={() => onDelete(item.id)}
                  title="Remove"
                  style={{ fontSize: '0.75rem', flexShrink: 0 }}
                >
                  ×
                </button>
              </>
            )}
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
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
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

function EditRow({
  item,
  onSave,
  onCancel,
}: {
  item: Interaction;
  onSave: (updates: Partial<Interaction>) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(item.date);
  const [type, setType] = useState<InteractionType>(item.type);
  const [note, setNote] = useState(item.note);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="date"
          className="cn-field-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontSize: '0.75rem', padding: '2px 4px' }}
        />
        <select
          className="cn-select-input"
          value={type}
          onChange={(e) => setType(e.target.value as InteractionType)}
          style={{ fontSize: '0.75rem', padding: '2px 4px' }}
        >
          {(['call', 'email', 'meeting', 'message', 'event', 'other'] as InteractionType[]).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      <textarea
        className="cn-textarea"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        style={{ fontSize: '0.8rem' }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="cn-btn-primary" style={{ fontSize: '0.72rem', padding: '3px 10px' }} onClick={() => onSave({ date, type, note: note.trim() })}>Save</button>
        <button className="cn-btn-ghost" style={{ fontSize: '0.72rem', padding: '3px 10px' }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
