import React, { createContext, useContext, useState, useEffect } from 'react';

const CookieConsentContext = createContext();

export const useCookieConsent = () => useContext(CookieConsentContext);

const STORAGE_KEY = 'cookie_consent';
const EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 months

function readStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { value, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value; // 'accepted' | 'refused'
  } catch {
    return null;
  }
}

function writeConsent(value) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ value, expiresAt: Date.now() + EXPIRY_MS })
  );
}

export const CookieConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(() => readStoredConsent());
  // null = not yet decided, 'accepted', 'refused'

  const accept = () => {
    writeConsent('accepted');
    setConsent('accepted');
  };

  const refuse = () => {
    writeConsent('refused');
    setConsent('refused');
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
  };

  const hasConsented = consent !== null;
  const analyticsEnabled = consent === 'accepted';

  return (
    <CookieConsentContext.Provider value={{ consent, accept, refuse, reset, hasConsented, analyticsEnabled }}>
      {children}
    </CookieConsentContext.Provider>
  );
};
