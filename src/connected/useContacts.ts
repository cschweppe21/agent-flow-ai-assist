import { useState, useEffect, useCallback, useRef } from 'react';
import type { Contact, ContactStatus, Interaction, Referral, Ratings, Groundwork } from './types';
import {
  loadContacts,
  saveContacts,
  generateId,
  computeFollowUpRecommended,
} from './storage';

type SaveState = 'saved' | 'saving';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts());
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((updated: Contact[]) => {
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveContacts(updated);
      setSaveState('saved');
    }, 600);
  }, []);

  const setAndSave = useCallback(
    (updater: (prev: Contact[]) => Contact[]) => {
      setContacts((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Recompute follow-up flags daily on mount
  useEffect(() => {
    setContacts((prev) =>
      prev.map((c) => ({ ...c, followUpRecommended: computeFollowUpRecommended(c) }))
    );
  }, []);

  const createContact = useCallback(
    (partial: Partial<Contact> = {}): Contact => {
      const now = new Date().toISOString();
      const newContact: Contact = {
        id: generateId(),
        name: '',
        status: 'to_reach_out',
        priority: false,
        alumni: false,
        ratings: { responsiveness: 0, rapport: 0, helpfulness: 0 },
        notes: '',
        groundwork: { personal: [], company: [], industry: [] },
        interactions: [],
        referrals: [],
        createdAt: now,
        updatedAt: now,
        ...partial,
      };
      newContact.followUpRecommended = computeFollowUpRecommended(newContact);
      setAndSave((prev) => [...prev, newContact]);
      return newContact;
    },
    [setAndSave]
  );

  const updateContact = useCallback(
    (id: string, updates: Partial<Contact>) => {
      setAndSave((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
          updated.followUpRecommended = computeFollowUpRecommended(updated);
          return updated;
        })
      );
    },
    [setAndSave]
  );

  const deleteContact = useCallback(
    (id: string) => {
      setAndSave((prev) => prev.filter((c) => c.id !== id));
    },
    [setAndSave]
  );

  const addInteraction = useCallback(
    (contactId: string, interaction: Omit<Interaction, 'id'>) => {
      const entry: Interaction = { id: generateId(), ...interaction };
      setAndSave((prev) =>
        prev.map((c) => {
          if (c.id !== contactId) return c;
          const updated = {
            ...c,
            interactions: [...c.interactions, entry],
            updatedAt: new Date().toISOString(),
          };
          updated.followUpRecommended = computeFollowUpRecommended(updated);
          return updated;
        })
      );
    },
    [setAndSave]
  );

  const deleteInteraction = useCallback(
    (contactId: string, interactionId: string) => {
      setAndSave((prev) =>
        prev.map((c) => {
          if (c.id !== contactId) return c;
          return {
            ...c,
            interactions: c.interactions.filter((i) => i.id !== interactionId),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [setAndSave]
  );

  const addReferral = useCallback(
    (referrerId: string, referralData: Omit<Referral, 'id' | 'contactId'>) => {
      const cleanName = referralData.name.replace(/,/g, '').trim();
      const referralId = generateId();

      // Create a new contact for the referred person
      const now = new Date().toISOString();
      const newContactId = generateId();
      const referralInteraction: Interaction = {
        id: generateId(),
        date: now.slice(0, 10),
        type: 'other',
        note: `Referred by ${contacts.find((c) => c.id === referrerId)?.name ?? 'someone'}.`,
      };

      const newContact: Contact = {
        id: newContactId,
        name: cleanName,
        company: referralData.company,
        school: referralData.school,
        email:
          referralData.smartContact && detectSmartType(referralData.smartContact) === 'email'
            ? referralData.smartContact
            : undefined,
        phone:
          referralData.smartContact && detectSmartType(referralData.smartContact) === 'phone'
            ? referralData.smartContact
            : undefined,
        linkedIn:
          referralData.smartContact && detectSmartType(referralData.smartContact) === 'linkedin'
            ? referralData.smartContact
            : undefined,
        status: 'to_reach_out',
        priority: false,
        alumni: false,
        ratings: { responsiveness: 0, rapport: 0, helpfulness: 0 },
        notes: 'Referred — not logged yet.',
        groundwork: { personal: [], company: [], industry: [] },
        interactions: [referralInteraction],
        referrals: [],
        referredById: referrerId,
        createdAt: now,
        updatedAt: now,
      };
      newContact.followUpRecommended = computeFollowUpRecommended(newContact);

      const referral: Referral = {
        id: referralId,
        name: cleanName,
        company: referralData.company,
        school: referralData.school,
        smartContact: referralData.smartContact,
        contactId: newContactId,
        date: referralData.date ?? now.slice(0, 10),
      };

      const referralLogEntry: Interaction = {
        id: generateId(),
        date: now.slice(0, 10),
        type: 'other',
        note: `Referred ${cleanName}.`,
      };

      setAndSave((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== referrerId) return c;
          return {
            ...c,
            referrals: [...c.referrals, referral],
            interactions: [...c.interactions, referralLogEntry],
            updatedAt: now,
          };
        });
        return [...updated, newContact];
      });

      return newContactId;
    },
    [contacts, setAndSave]
  );

  const deleteReferral = useCallback(
    (referrerId: string, referralId: string) => {
      setAndSave((prev) => {
        const referrer = prev.find((c) => c.id === referrerId);
        const referral = referrer?.referrals.find((r) => r.id === referralId);
        const referredContactId = referral?.contactId;
        return prev.map((c) => {
          if (c.id === referrerId) {
            return { ...c, referrals: c.referrals.filter((r) => r.id !== referralId), updatedAt: new Date().toISOString() };
          }
          if (referredContactId && c.id === referredContactId) {
            return { ...c, referredById: undefined, updatedAt: new Date().toISOString() };
          }
          return c;
        });
      });
    },
    [setAndSave]
  );

  const updateReferral = useCallback(
    (referrerId: string, referralId: string, updates: Partial<Referral>) => {
      setAndSave((prev) =>
        prev.map((c) => {
          if (c.id !== referrerId) return c;
          return {
            ...c,
            referrals: c.referrals.map((r) => r.id === referralId ? { ...r, ...updates } : r),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [setAndSave]
  );

  return {
    contacts,
    saveState,
    createContact,
    updateContact,
    deleteContact,
    addInteraction,
    deleteInteraction,
    addReferral,
    deleteReferral,
    updateReferral,
  };
}

export function detectSmartType(value: string): 'email' | 'phone' | 'linkedin' | 'unknown' {
  if (!value) return 'unknown';
  if (value.includes('@')) return 'email';
  if (value.includes('linkedin.com')) return 'linkedin';
  if (/^\+?[\d\s\-().]{7,}$/.test(value)) return 'phone';
  return 'unknown';
}
