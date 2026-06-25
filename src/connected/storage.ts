import type { Contact } from './types';

const KEY = 'connected_contacts_v1';

function getAPI() {
  return (window as any).electronAPI ?? null;
}

export function loadContacts(): Contact[] {
  // Electron: data was read synchronously by preload before React started
  const api = getAPI();
  if (api?.initialData) {
    try {
      return JSON.parse(api.initialData) as Contact[];
    } catch {}
  }
  // Web / fallback: use localStorage
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Contact[];
  } catch {
    return [];
  }
}

export function saveContacts(contacts: Contact[]): void {
  const json = JSON.stringify(contacts);
  // Save to file in Electron (persists across rebuilds)
  const api = getAPI();
  if (api?.saveData) {
    api.saveData(json);
  } else {
    // Web fallback
    localStorage.setItem(KEY, json);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function computeFollowUpRecommended(contact: Contact): boolean {
  if (contact.followUpDate) {
    return new Date(contact.followUpDate) <= new Date();
  }
  if (contact.interactions.length === 0) {
    const created = new Date(contact.createdAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return created < sixMonthsAgo;
  }
  const sorted = [...contact.interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastDate = new Date(sorted[0].date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return lastDate < sixMonthsAgo;
}

export function lastInteractionDate(contact: Contact): Date | null {
  if (contact.interactions.length === 0) return null;
  const sorted = [...contact.interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return new Date(sorted[0].date);
}

export function avgRating(contact: Contact): number {
  const { responsiveness, rapport, helpfulness } = contact.ratings;
  return (responsiveness + rapport + helpfulness) / 3;
}
