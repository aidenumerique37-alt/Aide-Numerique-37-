import { useEffect, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GoogleAnalytics = () => {
  const { analyticsEnabled } = useCookieConsent();
  const [trackingId, setTrackingId] = useState('');

  // Fetch the GA tracking ID from the public settings endpoint once
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.ga_tracking_id) setTrackingId(data.ga_tracking_id);
      })
      .catch(() => {});
  }, []);

  // Inject the GA script only when consent is given and tracking ID is known
  useEffect(() => {
    if (!analyticsEnabled || !trackingId) return;

    // Avoid double-injection
    if (document.getElementById('ga-script')) return;

    const script1 = document.createElement('script');
    script1.id = 'ga-script';
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.id = 'ga-init';
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', { anonymize_ip: true });
    `;
    document.head.appendChild(script2);

    return () => {
      // On consent withdrawal — remove scripts and clear dataLayer
      ['ga-script', 'ga-init'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      window.dataLayer = [];
    };
  }, [analyticsEnabled, trackingId]);

  return null;
};

export default GoogleAnalytics;
