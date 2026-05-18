'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SupportModalContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openSupport: () => void;
  closeSupport: () => void;
};

const SupportModalContext = createContext<SupportModalContextValue | undefined>(
  undefined
);

export function SupportModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSupport = useCallback(() => setIsOpen(true), []);
  const closeSupport = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, setIsOpen, openSupport, closeSupport }),
    [isOpen, openSupport, closeSupport]
  );

  return (
    <SupportModalContext.Provider value={value}>{children}</SupportModalContext.Provider>
  );
}

export function useSupportModal() {
  const ctx = useContext(SupportModalContext);
  if (!ctx) {
    throw new Error('useSupportModal must be used within SupportModalProvider');
  }
  return ctx;
}
