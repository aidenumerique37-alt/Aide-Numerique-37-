import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, X, Globe, Users } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
};

const PartnerDetail = ({ partner, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }} data-testid="partner-detail-overlay">
      <div ref={ref} className="max-w-md w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="p-5 relative" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" data-testid="partner-detail-close">
            <X size={14} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              {partner.logo_url
              ? <img src={resolveImageUrl(partner.logo_url)} alt={`Logo ${partner.name}${partner.activity ? ` - ${partner.activity}` : ''} - Partenaire Aide Numérique 37 assistance informatique Tours`} className="w-full h-full object-contain p-2" loading="lazy" decoding="async" />
              : <span className="text-xl font-bold text-french-blue">{partner.name.substring(0, 2).toUpperCase()}</span>}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{partner.name}</h3>
              {partner.category && <p className="text-sm text-french-blue">{partner.category}</p>}
              {partner.activity && <p className="text-xs text-gray-500">{partner.activity}</p>}
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {partner.description && <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{partner.description}</p>}
          <div className="flex flex-wrap gap-2">
            {partner.website && (
              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 bg-french-blue/10 text-french-blue" data-testid={`partner-website-${partner.id}`}>
                <Globe size={14} /> Visiter le site
              </a>
            )}
            {partner.social_links?.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:opacity-80 transition-all">
                <ExternalLink size={14} /> {s.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MarqueeRow = ({ partners, speed, reverse, onSelect }) => {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = reverse ? el.scrollWidth / 2 : 0;
    let raf;
    const tick = () => {
      if (!paused) {
        pos += reverse ? -speed : speed;
        const half = el.scrollWidth / 2;
        if (!reverse && pos >= half) pos = 0;
        if (reverse && pos <= 0) pos = half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, reverse, paused]);

  const doubled = [...partners, ...partners];

  return (
    <div
      ref={ref}
      className="flex overflow-hidden"
      style={{ scrollbarWidth: 'none' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {doubled.map((p, i) => (
        <button
          key={`${p.id}-${i}`}
          onClick={() => onSelect(p)}
          className="flex-shrink-0 group flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/60 hover:shadow-lg cursor-pointer"
          style={{ width: 100 }}
          data-testid={`partner-item-${p.id}`}
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200">
            {p.logo_url ? (
              <img
                src={resolveImageUrl(p.logo_url)}
                alt={`Logo ${p.name}${p.activity ? ` - ${p.activity}` : ''} - Partenaire Aide Numérique 37`}
                className="w-full h-full object-contain p-2"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-french-blue">{p.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center leading-tight w-full group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-2">
            {p.name}
          </span>
        </button>
      ))}
    </div>
  );
};

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/partners`)
      .then(res => setPartners(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && partners.length === 0) return null;
  if (loading) return (
    <section id="partenaires" className="py-12 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 text-center"><div className="animate-pulse text-gray-400">Chargement...</div></div>
    </section>
  );

  // Split partners into rows for the marquee
  const mid = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, mid);
  const row2 = partners.slice(mid);

  return (
    <section id="partenaires" className="py-12 bg-gray-50/50 dark:bg-gray-900/30 transition-colors duration-300" data-testid="partners-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-french-blue/10 text-french-blue">
            <Users size={14} />
            {partners.length} partenaire{partners.length > 1 ? 's' : ''}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Partenaires</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Des professionnels de confiance avec qui je collabore
          </p>
        </div>

        <div className="space-y-1">
          <MarqueeRow partners={row1} speed={0.4} reverse={false} onSelect={setSelected} />
          {row2.length > 0 && (
            <MarqueeRow partners={row2} speed={0.35} reverse={true} onSelect={setSelected} />
          )}
        </div>
      </div>

      {selected && <PartnerDetail partner={selected} onClose={() => setSelected(null)} />}
    </section>
  );
};

export default Partners;
