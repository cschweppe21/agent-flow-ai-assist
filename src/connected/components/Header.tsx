import React from 'react';
import type { ViewMode } from '../types';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  saveState: 'saved' | 'saving';
  darkMode: boolean;
  onToggleDark: () => void;
}

const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron');

export function Header({ view, onViewChange, saveState, darkMode, onToggleDark }: Props) {
  return (
    <header className={`cn-header${isElectron ? ' cn-header-electron' : ''}`}>
      <div className="cn-wordmark">Connected</div>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="cn-dark-toggle"
          onClick={onToggleDark}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '◑'}
        </button>
        <span className={`cn-save-status ${saveState}`}>
          {saveState === 'saving' ? 'Saving…' : 'Saved'}
        </span>
      </div>
    </header>
  );
}
