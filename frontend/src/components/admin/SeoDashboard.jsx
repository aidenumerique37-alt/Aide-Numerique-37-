import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Search, RefreshCw, ExternalLink,
  AlertTriangle, CheckCircle2, XCircle, Clock, Send, BarChart2,
  Globe, MousePointerClick, Eye, Target, ChevronUp, ChevronDown,
  Minus, Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const getAuthHeaders = () => ({ 'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}` });

// ─── Position Badge ──────────────────────────────────────────────────────────
const PosBadge = ({ pos }) => {
  const p = parseFloat(pos);
  if (isNaN(p)) return <span className="text-gray-400 text-sm">—</span>;
  let cls = 'text-xs font-bold px-2 py-0.5 rounded-full ';
  if (p <= 3) cls += 'bg-green-100 text-green-700';
  else if (p <= 10) cls += 'bg-yellow-100 text-yellow-700';
  else if (p <= 20) cls += 'bg-orange-100 text-orange-700';
  else cls += 'bg-red-100 text-red-700';
  return <span className={cls}>{p.toFixed(1)}</span>;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color ? 'bg-current/10' : 'bg-gray-100 dark:bg-gray-800'}`}
          style={{ backgroundColor: color ? undefined : undefined }}>
          <Icon size={20} className={color || 'text-gray-600 dark:text-gray-400'} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Sortable column header ───────────────────────────────────────────────────
const SortHeader = ({ label, field, sort, onSort }) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
    onClick={() => onSort(field)}
  >
    <span className="flex items-center gap-1">
      {label}
      {sort.field === field
        ? sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        : <Minus size={12} className="opacity-30" />}
    </span>
  </th>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SeoDashboard = () => {
  const [period, setPeriod] = useState(28);
  const [overview, setOverview] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [pages, setPages] = useState([]);
  const [loadingOv, setLoadingOv] = useState(true);
  const [loadingKw, setLoadingKw] = useState(true);
  const [loadingPg, setLoadingPg] = useState(true);

  // Keyword table sort
  const [kwSort, setKwSort] = useState({ field: 'clicks', dir: 'desc' });
  const [kwSearch, setKwSearch] = useState('');
  // Pages table sort
  const [pgSort, setPgSort] = useState({ field: 'clicks', dir: 'desc' });

  // URL Inspector
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspectResult, setInspectResult] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [inspectError, setInspectError] = useState('');

  // Reindex
  const [reindexUrl, setReindexUrl] = useState('');
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState(null);
  const [reindexError, setReindexError] = useState('');

  // Non-indexed
  const [nonIndexed, setNonIndexed] = useState(null);
  const [loadingNI, setLoadingNI] = useState(false);

  // Submission history
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active sub-tab
  const [subTab, setSubTab] = useState('keywords'); // keywords | pages | inspect | reindex | nonindexed | history

  const fetchData = useCallback(async () => {
    setLoadingOv(true); setLoadingKw(true); setLoadingPg(true);
    try {
      const [ovRes, kwRes, pgRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/seo/overview?days=${period}`),
        axios.get(`${BACKEND_URL}/api/admin/seo/keywords?days=${period}&limit=100`),
        axios.get(`${BACKEND_URL}/api/admin/seo/pages?days=${period}&limit=100`),
      ]);
      setOverview(ovRes.data);
      setKeywords(kwRes.data.keywords || []);
      setPages(pgRes.data.pages || []);
    } catch (e) {
      console.error('SEO fetch error', e);
    } finally {
      setLoadingOv(false); setLoadingKw(false); setLoadingPg(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (setter, sort, field) => {
    setter(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' }
    );
  };

  const sorted = (arr, s) =>
    [...arr].sort((a, b) =>
      s.dir === 'asc' ? a[s.field] - b[s.field] : b[s.field] - a[s.field]
    );

  const filteredKw = sorted(
    keywords.filter(k => k.keyword.toLowerCase().includes(kwSearch.toLowerCase())),
    kwSort
  );

  const handleInspect = async () => {
    if (!inspectUrl.trim()) return;
    setInspecting(true); setInspectResult(null); setInspectError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/seo/inspect`, { url: inspectUrl });
      setInspectResult(res.data);
    } catch (e) {
      setInspectError(e.response?.data?.detail || 'Erreur lors de l\'inspection.');
    } finally {
      setInspecting(false);
    }
  };

  const handleReindex = async () => {
    if (!reindexUrl.trim()) return;
    setReindexing(true); setReindexResult(null); setReindexError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/seo/reindex`, { url: reindexUrl, action: 'update' });
      setReindexResult(res.data);
    } catch (e) {
      setReindexError(e.response?.data?.detail || 'Erreur lors de la soumission.');
    } finally {
      setReindexing(false);
    }
  };

  const handleNonIndexed = async () => {
    setLoadingNI(true); setNonIndexed(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/seo/non-indexed?days=90`);
      setNonIndexed(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNI(false);
    }
  };

  const handleLoadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/seo/history`);
      setHistory(res.data.submissions || []);
    } catch (e) { console.error(e); }
    setLoadingHistory(false);
  };

  useEffect(() => { if (subTab === 'history') handleLoadHistory(); }, [subTab]);

  const [batchReindexing, setBatchReindexing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  const handleBatchReindex = async () => {
    if (!nonIndexed?.urls?.length) return;
    setBatchReindexing(true); setBatchResult(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/seo/batch-reindex`, {
        urls: nonIndexed.urls
      }, { headers: getAuthHeaders() });
      setBatchResult(res.data);
    } catch (e) {
      setBatchResult({ error: e.response?.data?.detail || 'Erreur batch reindex' });
    } finally {
      setBatchReindexing(false);
    }
  };

  const urlShort = (url) => {
    const origin = window.location.origin;
    return url.replace('https://www.aidenumerique37.fr', '').replace('https://aidenumerique37.fr', '').replace(origin, '') || '/';
  };

  const subTabs = [
    { id: 'keywords', label: 'Mots-clés' },
    { id: 'pages', label: 'Pages' },
    { id: 'inspect', label: 'Inspection URL' },
    { id: 'reindex', label: 'Ré-indexation' },
    { id: 'nonindexed', label: 'Pages non indexées' },
    { id: 'history', label: 'Historique soumissions' },
  ];

  return (
    <div className="space-y-6" data-testid="seo-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-french-blue" size={26} />
            Tableau de bord SEO
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Données Google Search Console en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 28, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === d ? 'bg-french-blue text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'}`}>
              {d}j
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCw size={14} className={loadingOv ? 'animate-spin' : ''} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {loadingOv ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`skeleton-card-${i}`} className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-5">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MousePointerClick} label="Clics totaux" value={overview.total_clicks.toLocaleString('fr')}
            sub={`${overview.start_date} → ${overview.end_date}`} color="text-blue-600" />
          <StatCard icon={Eye} label="Impressions" value={overview.total_impressions.toLocaleString('fr')}
            sub="Nombre d'affichages dans Google" color="text-purple-600" />
          <StatCard icon={Target} label="CTR moyen" value={`${overview.avg_ctr}%`}
            sub="Taux de clic" color={overview.avg_ctr >= 3 ? 'text-green-600' : 'text-orange-500'} />
          <StatCard icon={TrendingUp} label="Position moyenne" value={`#${overview.avg_position}`}
            sub="Classement moyen sur Google" color={overview.avg_position <= 10 ? 'text-green-600' : 'text-orange-500'} />
        </div>
      )}

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {subTabs.map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${subTab === t.id ? 'border-french-blue text-french-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Keywords Tab ── */}
      {subTab === 'keywords' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">Mots-clés ({filteredKw.length})</CardTitle>
              <Input placeholder="Filtrer les mots-clés..." value={kwSearch}
                onChange={e => setKwSearch(e.target.value)}
                className="w-56 h-8 text-sm dark:bg-gray-800 dark:border-gray-700" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingKw ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mot-clé</th>
                      <SortHeader label="Clics" field="clicks" sort={kwSort} onSort={(f) => handleSort(setKwSort, kwSort, f)} />
                      <SortHeader label="Impressions" field="impressions" sort={kwSort} onSort={(f) => handleSort(setKwSort, kwSort, f)} />
                      <SortHeader label="CTR" field="ctr" sort={kwSort} onSort={(f) => handleSort(setKwSort, kwSort, f)} />
                      <SortHeader label="Position" field="position" sort={kwSort} onSort={(f) => handleSort(setKwSort, kwSort, f)} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredKw.slice(0, 100).map((kw, i) => (
                      <tr key={`row-kw-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">{kw.keyword}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold">{kw.clicks}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{kw.impressions.toLocaleString('fr')}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{kw.ctr}%</td>
                        <td className="px-4 py-3"><PosBadge pos={kw.position} /></td>
                      </tr>
                    ))}
                    {filteredKw.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun résultat</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Pages Tab ── */}
      {subTab === 'pages' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance par page ({pages.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPg ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                      <SortHeader label="Clics" field="clicks" sort={pgSort} onSort={(f) => handleSort(setPgSort, pgSort, f)} />
                      <SortHeader label="Impressions" field="impressions" sort={pgSort} onSort={(f) => handleSort(setPgSort, pgSort, f)} />
                      <SortHeader label="CTR" field="ctr" sort={pgSort} onSort={(f) => handleSort(setPgSort, pgSort, f)} />
                      <SortHeader label="Position" field="position" sort={pgSort} onSort={(f) => handleSort(setPgSort, pgSort, f)} />
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sorted(pages, pgSort).map((pg, i) => (
                      <tr key={`row-kw-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate block" title={pg.url}>
                            {urlShort(pg.url)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{pg.clicks}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{pg.impressions.toLocaleString('fr')}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{pg.ctr}%</td>
                        <td className="px-4 py-3"><PosBadge pos={pg.position} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button title="Inspecter" onClick={() => { setInspectUrl(pg.url); setSubTab('inspect'); }}
                              className="p-1 text-gray-400 hover:text-french-blue transition-colors">
                              <Search size={14} />
                            </button>
                            <button title="Ré-indexer" onClick={() => { setReindexUrl(pg.url); setSubTab('reindex'); }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                              <RefreshCw size={14} />
                            </button>
                            <a href={pg.url} target="_blank" rel="noopener noreferrer" title="Ouvrir"
                              className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── URL Inspect Tab ── */}
      {subTab === 'inspect' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search size={16} className="text-french-blue" />
              Inspection d'URL
            </CardTitle>
            <p className="text-xs text-gray-500">Vérifiez si une page est bien indexée par Google et obtenez des détails complets.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={inspectUrl} onChange={e => setInspectUrl(e.target.value)}
                placeholder="https://www.aidenumerique37.fr/articles/mon-article"
                className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                onKeyDown={e => e.key === 'Enter' && handleInspect()} />
              <Button onClick={handleInspect} disabled={inspecting || !inspectUrl}
                className="bg-french-blue hover:bg-french-blue/90 gap-1.5">
                {inspecting ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                Inspecter
              </Button>
            </div>

            {inspectError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                <XCircle size={16} /> {inspectError}
              </div>
            )}

            {inspectResult && (
              <div className="space-y-4">
                {/* Status badge */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${inspectResult.is_indexed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                  {inspectResult.is_indexed
                    ? <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                    : <XCircle size={24} className="text-red-600 flex-shrink-0" />}
                  <div>
                    <p className={`font-semibold ${inspectResult.is_indexed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {inspectResult.is_indexed ? 'Page indexée par Google' : 'Page NON indexée par Google'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{inspectResult.coverage_label}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'État d\'indexation', value: inspectResult.indexing_state },
                    { label: 'Dernier crawl', value: inspectResult.last_crawl ? new Date(inspectResult.last_crawl).toLocaleString('fr-FR') : '—' },
                    { label: 'Robots.txt', value: inspectResult.robots_txt_state },
                    { label: 'Fetch de la page', value: inspectResult.page_fetch_state },
                    { label: 'Canonical déclaré', value: inspectResult.user_canonical || '—' },
                    { label: 'Canonical Google', value: inspectResult.canonical_url || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Issues */}
                {inspectResult.issues?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Problèmes détectés
                    </p>
                    <ul className="space-y-1">
                      {inspectResult.issues.map((issue, i) => (
                        <li key={`rec-${i}`} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick action */}
                {!inspectResult.is_indexed && (
                  <Button onClick={() => { setReindexUrl(inspectUrl); setSubTab('reindex'); }}
                    className="w-full bg-french-blue hover:bg-french-blue/90 gap-2">
                    <Send size={14} /> Soumettre pour ré-indexation
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Reindex Tab ── */}
      {subTab === 'reindex' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send size={16} className="text-french-blue" />
              Demande de ré-indexation
            </CardTitle>
            <p className="text-xs text-gray-500">Notifiez Google qu'une page a été mise à jour pour accélérer son indexation.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                L'API d'indexation Google est conçue pour les pages mises à jour fréquemment. Google traitera la demande en quelques heures.
              </p>
            </div>

            <div className="flex gap-2">
              <Input value={reindexUrl} onChange={e => setReindexUrl(e.target.value)}
                placeholder="https://www.aidenumerique37.fr/articles/mon-article"
                className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                onKeyDown={e => e.key === 'Enter' && handleReindex()} />
              <Button onClick={handleReindex} disabled={reindexing || !reindexUrl}
                className="bg-green-600 hover:bg-green-700 gap-1.5">
                {reindexing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                Soumettre
              </Button>
            </div>

            {reindexError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                <XCircle size={16} /> {reindexError}
              </div>
            )}

            {reindexResult && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Soumission réussie !</p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">{reindexResult.message}</p>
                  {reindexResult.notified_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      Notifié le : {new Date(reindexResult.notified_time).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Non-Indexed Tab ── */}
      {subTab === 'nonindexed' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  Pages potentiellement non indexées
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Pages du sitemap sans visibilité dans Search Console sur les 90 derniers jours.</p>
              </div>
              <Button onClick={handleNonIndexed} disabled={loadingNI} className="bg-french-blue hover:bg-french-blue/90 gap-1.5">
                {loadingNI ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                Analyser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!nonIndexed && !loadingNI && (
              <div className="text-center py-10 text-gray-400">
                <Globe size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Cliquez sur "Analyser" pour comparer le sitemap avec les données Google.</p>
              </div>
            )}

            {loadingNI && (
              <div className="text-center py-10 text-gray-400 animate-pulse">
                <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
                <p className="text-sm">Analyse en cours... (peut prendre quelques secondes)</p>
              </div>
            )}

            {nonIndexed && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{nonIndexed.total_sitemap_pages}</p>
                    <p className="text-xs text-gray-500">Pages dans le sitemap</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{nonIndexed.total_indexed_in_gsc}</p>
                    <p className="text-xs text-gray-500">Visibles dans GSC</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-500">{nonIndexed.potentially_not_indexed}</p>
                    <p className="text-xs text-gray-500">Potentiellement absentes</p>
                  </div>
                </div>

                {nonIndexed.urls?.length > 0 && (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50">
                      <div>
                        <p className="font-semibold text-orange-700 text-sm">Soumettre toutes les URLs à Google</p>
                        <p className="text-xs text-orange-600 mt-0.5">{nonIndexed.urls.length} URLs seront soumises en une seule opération</p>
                      </div>
                      <Button onClick={handleBatchReindex} disabled={batchReindexing}
                        className="bg-orange-600 hover:bg-orange-700 gap-1.5 flex-shrink-0 ml-4">
                        {batchReindexing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                        Tout soumettre
                      </Button>
                    </div>
                    {batchResult && (
                      <div className={`rounded-xl p-3 flex items-center gap-3 border text-sm font-medium ${batchResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        {batchResult.error ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        {batchResult.error || batchResult.message}
                      </div>
                    )}
                    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        URLs à vérifier ({nonIndexed.urls.length})
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                        {nonIndexed.urls.map((url, i) => (
                          <div key={`url-${i}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate flex-1 mr-4">{urlShort(url) || url}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button title="Inspecter" onClick={() => { setInspectUrl(url); setSubTab('inspect'); }} className="p-1 text-gray-400 hover:text-french-blue transition-colors"><Search size={13} /></button>
                              <button title="Ré-indexer" onClick={() => { setReindexUrl(url); setSubTab('reindex'); }} className="p-1 text-gray-400 hover:text-green-600 transition-colors"><RefreshCw size={13} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {nonIndexed.urls?.length === 0 && (
                  <div className="text-center py-6 text-green-600">
                    <CheckCircle2 size={32} className="mx-auto mb-2" />
                    <p className="font-semibold">Toutes vos pages semblent indexées !</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── History Tab ── */}
      {subTab === 'history' && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock size={16} className="text-french-blue" />
                  Historique des soumissions
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Toutes les URLs soumises à Google via ce panel.</p>
              </div>
              <Button onClick={handleLoadHistory} disabled={loadingHistory} variant="outline" size="sm" className="gap-1.5">
                <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-10 animate-pulse text-gray-400">
                <RefreshCw size={28} className="mx-auto mb-2 animate-spin" />
                <p className="text-sm">Chargement...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Clock size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune soumission enregistrée</p>
                <p className="text-xs mt-1">Les soumissions via ce panel apparaîtront ici.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">URL</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {history.map((sub, i) => (
                      <tr key={`history-row-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 max-w-xs">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate block" title={sub.url}>
                            {sub.url.replace('https://www.aidenumerique37.fr','').replace('https://aidenumerique37.fr','') || sub.url}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(sub.submitted_at).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sub.source === 'batch' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {sub.source === 'batch' ? 'Lot' : 'Manuel'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sub.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {sub.status === 'success' ? 'Envoyé' : 'Erreur'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoDashboard;
