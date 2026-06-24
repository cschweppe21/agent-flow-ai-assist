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
        <svg className="cn-tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <polyline
            points="2,9 6,13 14,4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
