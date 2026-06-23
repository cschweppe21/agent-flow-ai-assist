import React, { useState } from 'react';
import type { Groundwork } from '../types';

interface Props {
  groundwork: Groundwork;
  onChange: (g: Groundwork) => void;
}

type Tab = 'personal' | 'company' | 'industry';

export function GroundworkSection({ groundwork, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('personal');

  const items = groundwork[tab];

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange({ ...groundwork, [tab]: next });
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    onChange({ ...groundwork, [tab]: next });
  }

  function addItem() {
    onChange({ ...groundwork, [tab]: [...items, ''] });
  }

  const tabLabels: Record<Tab, string> = {
    personal: 'Personal',
    company: 'Company',
    industry: 'Industry',
  };

  return (
    <div>
      <div className="cn-groundwork-tabs">
        {(['personal', 'company', 'industry'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`cn-gw-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <ul className="cn-gw-list">
        {items.map((item, i) => (
          <li key={i} className="cn-gw-item">
            <input
              type="text"
              value={item}
              placeholder={`${tabLabels[tab]} question…`}
              onChange={(e) => updateItem(i, e.target.value)}
            />
            <button className="cn-gw-remove" onClick={() => removeItem(i)} title="Remove">
              ×
            </button>
          </li>
        ))}
      </ul>

      <button className="cn-add-small-btn" onClick={addItem}>
        + Add question
      </button>
    </div>
  );
}
