import React, { useState, useCallback } from 'react';
import './connected.css';
import type { ViewMode, Referral } from './types';
import { useContacts } from './useContacts';
import { Header } from './components/Header';
import { ContactList } from './components/ContactList';
import { ContactDetail } from './components/ContactDetail';
import { NetworkGraph } from './components/NetworkGraph';

export function ConnectedApp() {
  const {
    contacts,
    saveState,
    createContact,
    updateContact,
    deleteContact,
    addInteraction,
    deleteInteraction,
    updateInteraction,
    addReferral,
    deleteReferral,
    updateReferral,
  } = useContacts();

  const [view, setView] = useState<ViewMode>('contacts');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('cn_dark') === 'true');

  function toggleDark() {
    setDarkMode((d) => {
      localStorage.setItem('cn_dark', String(!d));
      return !d;
    });
  }

  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null;

  function handleAdd() {
    const c = createContact();
    setSelectedId(c.id);
  }

  function handleDelete(id: string) {
    deleteContact(id);
    if (selectedId === id) setSelectedId(null);
  }

  function handleAddReferral(referrerId: string, data: Omit<Referral, 'id' | 'contactId'>) {
    addReferral(referrerId, data);
  }

  function handleDeleteReferral(referrerId: string, referralId: string) {
    deleteReferral(referrerId, referralId);
  }

  function handleUpdateReferral(referrerId: string, referralId: string, updates: Partial<Referral>) {
    updateReferral(referrerId, referralId, updates);
  }

  const handleGraphSelect = useCallback((id: string) => {
    setView('contacts');
    setSelectedId(id);
  }, []);

  return (
    <div className={`cn-app${darkMode ? ' cn-dark' : ''}`}>
      <Header
        view={view}
        onViewChange={setView}
        saveState={saveState}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <div className="cn-body">
        {view === 'contacts' ? (
          <>
            <div className="cn-list-pane">
              <ContactList
                contacts={contacts}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={handleAdd}
              />
            </div>

            {selectedContact ? (
              <ContactDetail
                contact={selectedContact}
                contacts={contacts}
                onChange={updateContact}
                onDelete={handleDelete}
                onAddInteraction={addInteraction}
                onDeleteInteraction={deleteInteraction}
                onUpdateInteraction={updateInteraction}
                onAddReferral={handleAddReferral}
                onDeleteReferral={handleDeleteReferral}
                onUpdateReferral={handleUpdateReferral}
                onNavigate={setSelectedId}
              />
            ) : (
              <div className="cn-detail-empty">
                Select a contact or create a new one
              </div>
            )}
          </>
        ) : (
          <NetworkGraph
            contacts={contacts}
            onSelectContact={handleGraphSelect}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}
