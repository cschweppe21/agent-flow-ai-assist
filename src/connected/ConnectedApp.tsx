import React, { useState } from 'react';
import './connected.css';
import type { ViewMode, Interaction, Referral } from './types';
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
    addReferral,
  } = useContacts();

  const [view, setView] = useState<ViewMode>('contacts');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    const newId = addReferral(referrerId, data);
    // Optionally navigate to the new referred contact
    // setSelectedId(newId);
  }

  function handleGraphSelect(id: string) {
    setView('contacts');
    setSelectedId(id);
  }

  return (
    <div className="cn-app">
      <Header view={view} onViewChange={setView} saveState={saveState} />

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
                onAddReferral={handleAddReferral}
                onNavigate={setSelectedId}
              />
            ) : (
              <div className="cn-detail-empty">
                Select a contact or create a new one
              </div>
            )}
          </>
        ) : (
          <NetworkGraph contacts={contacts} onSelectContact={handleGraphSelect} />
        )}
      </div>
    </div>
  );
}
