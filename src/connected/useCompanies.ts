import { useState, useCallback, useRef } from 'react';
import type { Company } from './types';
import { loadCompanies, saveCompanies, generateId } from './storage';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>(() => loadCompanies());
  const companiesRef = useRef(companies);
  companiesRef.current = companies;

  const persist = useCallback((list: Company[]) => {
    setCompanies(list);
    saveCompanies(list);
  }, []);

  const createCompany = useCallback((): Company => {
    const now = new Date().toISOString();
    const c: Company = {
      id: generateId(),
      name: '',
      priority: false,
      target: false,
      createdAt: now,
      updatedAt: now,
    };
    persist([c, ...companiesRef.current]);
    return c;
  }, [persist]);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    persist(
      companiesRef.current.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
  }, [persist]);

  const deleteCompany = useCallback((id: string) => {
    persist(companiesRef.current.filter((c) => c.id !== id));
  }, [persist]);

  return { companies, createCompany, updateCompany, deleteCompany };
}
