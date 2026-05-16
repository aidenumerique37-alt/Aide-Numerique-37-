import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Save, CheckCircle, AlertCircle, ExternalLink, FileText, Shield, ShoppingBag } from 'lucide-react';
import { Button } from '../../ui/button';
import RichEditor from '../RichEditor';
import { BACKEND_URL, getAuthHeaders } from '../constants';

const PAGES = [
  {
    id: 'mentions-legales',
    label: 'Mentions Légales',
    icon: FileText,
    url: '/mentions-legales',
    description: 'Informations légales obligatoires : éditeur, hébergeur, propriété intellectuelle.',
  },
  {
    id: 'cgv',
    label: 'Conditions Générales de Vente',
    icon: ShoppingBag,
    url: '/cgv',
    description: 'Conditions régissant vos prestations : tarifs, paiements, responsabilité.',
  },
  {
    id: 'confidentialite',
    label: 'Politique de Confidentialité',
    icon: Shield,
    url: '/politique-de-confidentialite',
    description: 'Traitement des données personnelles conformément au RGPD.',
  },
];

const LegalPagesSection = ({ showStatus }) => {
  const [activeTab, setActiveTab] = useState('mentions-legales');
  const [pages, setPages] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (id) => {
    if (pages[id] !== undefined) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/legal/${id}`, { headers: getAuthHeaders() });
      setPages(prev => ({ ...prev, [id]: res.data }));
    } catch {
      setPages(prev => ({ ...prev, [id]: { title: '', content_html: '' } }));
    }
  }, [pages]);

  useEffect(() => {
    setLoading(true);
    loadPage('mentions-legales').finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = async (id) => {
    setActiveTab(id);
    await loadPage(id);
  };

  const handleChange = (field, value) => {
    setPages(prev => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] || {}), [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = pages[activeTab] || {};
      await axios.put(`${BACKEND_URL}/api/admin/legal/${activeTab}`, data, { headers: getAuthHeaders() });
      showStatus('success', 'Page sauvegardée ✓');
    } catch {
      showStatus('error', 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const current = pages[activeTab] || {};
  const activePage = PAGES.find(p => p.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pages Juridiques</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gérez le contenu de vos pages légales depuis cet éditeur</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="gap-2 text-white"
          style={{ background: '#0D2E5C' }}
        >
          <Save size={15} />
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PAGES.map(page => {
          const Icon = page.icon;
          const isActive = activeTab === page.id;
          return (
            <button
              key={page.id}
              onClick={() => handleTabChange(page.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
              style={isActive
                ? { background: '#0D2E5C', color: 'white', borderColor: '#0D2E5C' }
                : { background: 'white', color: '#374151', borderColor: '#e5e7eb' }}
            >
              <Icon size={15} />
              {page.label}
            </button>
          );
        })}
      </div>

      {/* Editor card */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
               style={{ background: '#f8fafc' }}>
            <div className="flex items-center gap-3">
              {activePage && <activePage.icon size={18} style={{ color: '#0D2E5C' }} />}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{activePage?.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{activePage?.description}</p>
              </div>
            </div>
            <a
              href={activePage?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ExternalLink size={13} />
              Voir la page
            </a>
          </div>

          {/* Title field */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Titre de la page
            </label>
            <input
              type="text"
              value={current.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Titre affiché sur la page…"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Rich text editor */}
          <div className="p-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Contenu
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden quill-admin">
              <RichEditor
                value={current.content_html || ''}
                onChange={html => handleChange('content_html', html)}
                articleKey={activeTab}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs text-gray-400">
              {current.updated_at
                ? `Dernière modification : ${new Date(current.updated_at).toLocaleString('fr-FR')}`
                : 'Jamais modifié — contenu par défaut'}
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-1.5 text-white"
              style={{ background: '#0D2E5C' }}
            >
              <Save size={13} />
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      )}

      {/* Info callout */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-4 flex gap-3">
        <div className="shrink-0 mt-0.5">
          <CheckCircle size={16} className="text-blue-500" />
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p className="font-medium">Ces pages sont accessibles publiquement</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            <strong>/mentions-legales</strong> · <strong>/cgv</strong> · <strong>/politique-de-confidentialite</strong>
            <br />Les liens sont déjà intégrés dans le pied de page du site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPagesSection;
