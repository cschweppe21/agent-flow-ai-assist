import React from 'react';
import type { ViewMode } from '../types';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  saveState: 'saved' | 'saving';
}

export function Header({ view, onViewChange, saveState }: Props) {
  return (
    <header className="cn-header">
      <div className="cn-wordmark">
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="Connected"
          width="22"
          height="22"
          style={{ borderRadius: 5, display: 'block', flexShrink: 0 }}
        />
        Connected
      </div>

      <div className="cn-view-toggle">
        <button
          className={`cn-toggle-btn ${view === 'contacts' ? 'active' : ''}`}
          onClick={() => onViewChange('contacts')}
        >
          Contacts
        </button>
        <button
          className={`cn-toggle-btn ${view === 'graph' ? 'active' : ''}`}
          onClick={() => onViewChange('graph')}
        >
          Web
        </button>
      </div>

      <span className={`cn-save-status ${saveState}`}>
        {saveState === 'saving' ? 'Saving…' : 'Saved'}
      </span>
    </header>
  );
}
