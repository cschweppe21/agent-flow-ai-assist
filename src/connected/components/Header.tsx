import React from 'react';
import type { ViewMode } from '../types';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  saveState: 'saved' | 'saving';
}

const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron');

export function Header({ view, onViewChange, saveState }: Props) {
  return (
    <header className={`cn-header${isElectron ? ' cn-header-electron' : ''}`}>
      <div className="cn-wordmark">
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
