import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Settings, FileText, List, Upload, RefreshCw, CheckCircle,
  AlertCircle, Save, ExternalLink, Zap, Trash2, X, Eye, Code, BookOpen,
  Clock, Edit2, Send
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';
import { SeoBadge, PlanningDataBadge } from './SeoBadge';

const ArticleGenerator = ({ setPreviewArticle, setActiveSection, setEditingArticle }) => {
  const [genTab, setGenTab] = useState('create');
  const [config, setConfig] = useState({ master_prompt: '', default_category: 'Conseils & Astuces', generate_image: true });
  const [mode, setMode] = useState('single');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleContext, setSingleContext] = useState('');
  const [batchTitles, setBatchTitles] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [planningItems, setPlanningItems] = useState([]);
  const [planningStats, setPlanningStats] = useState(null);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [generatingItem, setGeneratingItem] = useState(null);
  const [publishingItem, setPublishingItem] = useState(null);
  const [csvImports, setCsvImports] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [triggeringQueue, setTriggeringQueue] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reserveArticles, setReserveArticles] = useState([]);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [publishingSlug, setPublishingSlug] = useState(null);
  const batchFileRef = useRef(null);
  const csvFileRef = useRef(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/generator/config`, { headers: getAuthHeaders() })
      .then(r => setConfig(r.data)).catch(() => {});
    // Load reserve count on mount
    loadReserveArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (genTab === 'planning') loadPlanning();
    if (genTab === 'csv') loadCsvImports();
    if (genTab === 'reserve') loadReserveArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genTab]);

  const loadReserveArticles = async () => {
    setReserveLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() });
      const scheduled = res.data.filter(a => a.source === 'ai_generated' && a.status === 'scheduled');
      setReserveArticles(scheduled.sort((a, b) => new Date(a.scheduled_at || a.date_published) - new Date(b.scheduled_at || b.date_published)));
    } catch { setReserveArticles([]); }
    setReserveLoading(false);
  };

  const publishArticleNow = async (article) => {
    if (!window.confirm(`Publier "${article.title}" immédiatement ?`)) return;
    setPublishingSlug(article.slug);
    try {
      await axios.put(`${BACKEND_URL}/api/admin/articles/${article.slug}`,
        { status: 'published', date_published: new Date().toISOString() },
        { headers: getAuthHeaders() }
      );
      await loadReserveArticles();
    } catch (e) { alert(e.response?.data?.detail || e.message); }
    setPublishingSlug(null);
  };

  const editReserveArticle = (article) => {
    if (setEditingArticle) setEditingArticle({ ...article, _originalSlug: article.slug });
    if (setActiveSection) setActiveSection('articles');
  };

  const loadCsvImports = async () => {
    setCsvLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/csv-imports`, { headers: getAuthHeaders() });
      setCsvImports(res.data);
    } catch { setCsvImports([]); }
    setCsvLoading(false);
  };

  const deleteCsvImport = async (id, filename) => {
    if (!window.confirm(`Supprimer le fichier "${filename}" et tous ses articles en attente ?`)) return;
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/admin/csv-imports/${id}`, { headers: getAuthHeaders() });
      setImportResult({ message: res.data.message });
      loadCsvImports();
      loadPlanning();
    } catch (e) { setImportResult({ error: e.response?.data?.detail || e.message }); }
  };

  const triggerQueue = async () => {
    setTriggeringQueue(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/planning/trigger-queue`, {}, { headers: getAuthHeaders() });
      setImportResult({ message: res.data.message });
      setTimeout(() => { loadPlanning(); }, 3000);
    } catch (e) { setImportResult({ error: e.response?.data?.detail || e.message }); }
    setTriggeringQueue(false);
  };

  const loadPlanning = async () => {
    setPlanningLoading(true);
    try {
      const [items, stats] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/planning`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/planning/stats`, { headers: getAuthHeaders() })
      ]);
      setPlanningItems(items.data);
      setPlanningStats(stats.data);
      setSelectedItem(prev => prev ? (items.data.find(it => it.id === prev.id) || null) : null);
    } catch (error) {
      console.error('Failed to load planning:', error);
    } finally {
      setPlanningLoading(false);
    }
  };

  const saveConfig = async () => {
    await axios.put(`${BACKEND_URL}/api/admin/generator/config`, config, { headers: getAuthHeaders() });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const generateSingle = async () => {
    if (!singleTitle.trim()) return;
    setGenerating(true); setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/generate-article`,
        { title: singleTitle, master_prompt: config.master_prompt, generate_image: config.generate_image, extra_context: singleContext },
        { headers: getAuthHeaders(), timeout: 120000 }
      );
      setResults(prev => [res.data.article, ...prev]);
      setSingleTitle(''); setSingleContext('');
    } catch (e) {
      if (e.response?.status === 502 || e.code === 'ECONNABORTED' || !e.response) {
        setError("La génération prend plus de temps que prévu. L'article sera disponible dans /articles dans quelques instants.");
      } else {
        setError(e.response?.data?.detail || e.message);
      }
    }
    setGenerating(false);
  };

  const generateBatch = async () => {
    const titles = batchTitles.split('\n').map(t => t.trim()).filter(Boolean);
    if (!titles.length) return;
    setGenerating(true); setCurrentIndex(0); setError(null);
    for (let i = 0; i < titles.length; i++) {
      setCurrentIndex(i + 1);
      try {
        const res = await axios.post(`${BACKEND_URL}/api/admin/generate-article`,
          { title: titles[i], master_prompt: config.master_prompt, generate_image: config.generate_image },
          { headers: getAuthHeaders(), timeout: 120000 }
        );
        setResults(prev => [res.data.article, ...prev]);
      } catch (e) { setError(prev => (prev ? prev + ', ' : '') + titles[i]); }
    }
    setGenerating(false); setBatchTitles('');
  };

  const handleBatchFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const titles = ev.target.result.split(/[\n,]/).map(t => t.trim().replace(/^"|"$/g, '')).filter(Boolean);
      setBatchTitles(prev => prev ? `${prev}\n${titles.join('\n')}` : titles.join('\n'));
    };
    reader.readAsText(file);
    if (batchFileRef.current) batchFileRef.current.value = '';
  };

  const importCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/planning/import`, formData, {
        headers: getAuthHeaders()
      });
      setImportResult(res.data);
      loadPlanning();
    } catch (e) {
      setImportResult({ error: e.response?.data?.detail || e.message });
    }
    if (csvFileRef.current) csvFileRef.current.value = '';
  };

  const generateItemNow = async (item) => {
    setGeneratingItem(item.id);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/planning/${item.id}/generate-now`, {},
        { headers: getAuthHeaders(), timeout: 120000 }
      );
      loadPlanning();
    } catch (e) {
      if (e.response?.status === 502 || e.code === 'ECONNABORTED' || !e.response) {
        setImportResult({ message: "Génération en cours (le serveur traite la demande)... Rechargement dans 5 secondes." });
        setTimeout(() => { loadPlanning(); setImportResult(null); }, 5000);
      } else {
        alert(e.response?.data?.detail || e.message);
      }
    }
    setGeneratingItem(null);
  };

  const publishItemNow = async (item) => {
    setPublishingItem(item.id);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/planning/${item.id}/publish-now`, {},
        { headers: getAuthHeaders() }
      );
      loadPlanning();
    } catch (e) { alert(e.response?.data?.detail || e.message); }
    setPublishingItem(null);
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Supprimer "${item.subject}" du planning ?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/planning/${item.id}`,
        { headers: getAuthHeaders() }
      );
      loadPlanning();
    } catch (error) {
      console.error('Failed to delete planning item:', error);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending:    { label: 'En attente', className: 'bg-gray-100 text-gray-600' },
      generating: { label: 'Génération...', className: 'bg-blue-100 text-blue-700 animate-pulse' },
      scheduled:  { label: 'Planifié', className: 'bg-orange-100 text-orange-700' },
      published:  { label: 'Publié', className: 'bg-green-100 text-green-700' },
      error:      { label: 'Erreur', className: 'bg-red-100 text-red-600' },
    };
    const s = map[status] || map.pending;
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.className}`}>{s.label}</span>;
  };

  const priorityBadge = (p) => {
    if (!p) return null;
    const pLow = p.toLowerCase();
    const col = pLow.includes('haut') || pLow.includes('high') ? 'text-red-600 bg-red-50' :
                pLow.includes('moyen') || pLow.includes('med') ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50';
    return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${col}`}>{p}</span>;
  };

  const titlesCount = batchTitles.split('\n').filter(t => t.trim()).length;

  return (
    <div className="space-y-5" data-testid="article-generator">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" />
            Générateur d'articles IA
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Claude Sonnet · articles SEO optimisés · publication automatique</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)} data-testid="gen-config-btn">
          <Settings size={16} className="mr-2" />Prompt maître
        </Button>
      </div>


      {showConfig && (
        <Card className="border-purple-200">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Settings size={14} className="text-purple-500" />Prompt maître (instructions pour Claude)</h3>
            <textarea value={config.master_prompt} onChange={e => setConfig(p => ({ ...p, master_prompt: e.target.value }))}
              rows={10} className="w-full text-xs border rounded-lg p-3 font-mono resize-y" data-testid="master-prompt-textarea" />
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.generate_image} onChange={e => setConfig(p => ({ ...p, generate_image: e.target.checked }))} className="rounded" />
                Générer une image pour chaque article
              </label>
            </div>
            <Button onClick={saveConfig} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" data-testid="save-config-btn">
              {configSaved ? <><CheckCircle size={14} className="mr-1.5" />Sauvegardé</> : <><Save size={14} className="mr-1.5" />Sauvegarder</>}
            </Button>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Maintenance images</strong> — Sauvegarde les images IA existantes dans la base de données pour qu'elles résistent aux redémarrages du serveur.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await axios.post(`${BACKEND_URL}/api/admin/media/backup-to-db`, {}, { headers: getAuthHeaders() });
                    alert(res.data.message);
                  } catch (e) {
                    alert('Erreur: ' + (e.response?.data?.detail || e.message));
                  }
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 text-xs"
                data-testid="backup-images-btn"
              >
                <RefreshCw size={12} className="mr-1.5" />Sauvegarder les images en base
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b">
        {[
          ['create', 'Créer un article', FileText],
          ['reserve', `En réserve${reserveArticles.length > 0 ? ` (${reserveArticles.length})` : ''}`, Clock],
        ].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setGenTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${genTab === id ? 'border-french-blue text-french-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            data-testid={`gen-subtab-${id}`}>
            <Icon size={15} />{label}
            {id === 'reserve' && reserveArticles.length > 0 && (
              <span className="ml-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{reserveArticles.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: CREATE ─── */}
      {genTab === 'create' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode('single')} data-testid="mode-single-btn"
              className={`flex-1 py-3 rounded-lg font-medium text-sm border-2 transition-all ${mode === 'single' ? 'border-french-blue bg-french-blue/5 text-french-blue' : 'border-gray-200 text-gray-500'}`}>
              <FileText size={15} className="inline mr-2" />Titre unique
            </button>
            <button onClick={() => setMode('batch')} data-testid="mode-batch-btn"
              className={`flex-1 py-3 rounded-lg font-medium text-sm border-2 transition-all ${mode === 'batch' ? 'border-french-blue bg-french-blue/5 text-french-blue' : 'border-gray-200 text-gray-500'}`}>
              <List size={15} className="inline mr-2" />Liste de titres
            </button>
          </div>

          {mode === 'single' ? (
            <Card><CardContent className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Titre de l'article</label>
                <input value={singleTitle} onChange={e => setSingleTitle(e.target.value)} data-testid="single-title-input"
                  placeholder="Ex: Comment sécuriser votre WiFi facilement" onKeyDown={e => e.key === 'Enter' && generateSingle()}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contexte <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea value={singleContext} onChange={e => setSingleContext(e.target.value)} data-testid="single-context-input"
                  placeholder="Mot-clé cible, ville, public visé..." rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <Button onClick={generateSingle} disabled={generating || !singleTitle.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" data-testid="generate-single-btn">
                {generating ? <><RefreshCw size={15} className="animate-spin mr-2" />Génération... (30-60s)</> : <><Sparkles size={15} className="mr-2" />Générer l'article</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card><CardContent className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Liste de titres — <span className="text-french-blue">{titlesCount} titre(s)</span></label>
                <textarea value={batchTitles} onChange={e => setBatchTitles(e.target.value)} data-testid="batch-titles-textarea"
                  placeholder={"Un titre par ligne :\nComment configurer votre imprimante\nSécuriser son mot de passe Gmail"}
                  rows={6} className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y" />
              </div>
              <div className="flex items-center gap-2">
                <input ref={batchFileRef} type="file" accept=".txt,.csv" onChange={handleBatchFile} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => batchFileRef.current?.click()} data-testid="batch-file-btn">
                  <Upload size={13} className="mr-1.5" />Importer .txt/.csv
                </Button>
              </div>
              {generating && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-1.5">
                    <RefreshCw size={13} className="animate-spin" />Génération {currentIndex}/{titlesCount}
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${(currentIndex / titlesCount) * 100}%` }} />
                  </div>
                </div>
              )}
              <Button onClick={generateBatch} disabled={generating || titlesCount === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" data-testid="generate-batch-btn">
                {generating ? <><RefreshCw size={15} className="animate-spin mr-2" />Traitement {currentIndex}/{titlesCount}...</>
                  : <><Sparkles size={15} className="mr-2" />Générer {titlesCount} article{titlesCount > 1 ? 's' : ''}</>}
              </Button>
            </CardContent></Card>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
          </div>}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-600 flex items-center gap-1.5">
                <CheckCircle size={15} className="text-green-500" />{results.length} article{results.length > 1 ? 's' : ''} généré{results.length > 1 ? 's' : ''}
              </h3>
              {results.map((art, i) => (
                <div key={i} className="bg-white border border-green-200 rounded-xl p-3 flex gap-3" data-testid={`generated-article-${i}`}>
                  {art.image_url && <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                    <img src={art.image_url?.startsWith('http') ? art.image_url : `${BACKEND_URL}${art.image_url}`} alt={art.title} className="w-full h-full object-cover" />
                  </div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{art.title}</h4>
                      {art.status === 'published'
                        ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">Publié</span>
                        : <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">{art.status === 'draft' ? 'Brouillon' : art.status}</span>
                      }
                    </div>
                    <p className="text-xs text-gray-500">{art.category} · /articles/{art.slug}</p>
                    <a href={`/articles/${art.slug}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-french-blue text-xs hover:underline mt-1 font-medium">
                      <ExternalLink size={11} />Voir l'article
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: EN RÉSERVE ─── */}
      {genTab === 'reserve' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Articles générés par l'IA et <strong>en attente de publication</strong>.
                Prévisualisez-les, modifiez-les ou publiez-les immédiatement.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadReserveArticles} disabled={reserveLoading} data-testid="refresh-reserve-btn">
              <RefreshCw size={13} className={`mr-1.5 ${reserveLoading ? 'animate-spin' : ''}`} />Actualiser
            </Button>
          </div>

          {reserveLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
              <RefreshCw size={16} className="animate-spin" />Chargement...
            </div>
          )}

          {!reserveLoading && reserveArticles.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Clock size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Aucun article en réserve</p>
              <p className="text-xs text-gray-400 mt-1">
                Le système génère automatiquement {' '}
                <strong>5 articles d'avance</strong> toutes les 2h à partir du planning éditorial.
              </p>
            </div>
          )}

          {!reserveLoading && reserveArticles.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-orange-600 font-medium flex items-center gap-1.5">
                <Clock size={12} />
                {reserveArticles.length} article{reserveArticles.length > 1 ? 's' : ''} prêt{reserveArticles.length > 1 ? 's' : ''} — sera{reserveArticles.length > 1 ? 'ont' : ''} publié{reserveArticles.length > 1 ? 's' : ''} automatiquement aux dates prévues
              </p>
              {reserveArticles.map((article) => (
                <div key={article.slug}
                  className="bg-white border border-orange-100 rounded-xl p-4 flex gap-3 hover:shadow-sm transition-shadow"
                  data-testid={`reserve-article-${article.slug}`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {(article.image_url || article.featured_image) ? (
                      <img
                        src={article.image_url?.startsWith('/api') ? `${BACKEND_URL}${article.image_url}` : (article.image_url || article.featured_image)}
                        alt={article.title} className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        Pub. prévue : {new Date(article.scheduled_at || article.date_published).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      {article.category && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{article.category}</span>
                      )}
                      <SeoBadge article={article} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.excerpt || article.meta_description || ''}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline"
                      onClick={() => setPreviewArticle(article)}
                      className="text-xs gap-1.5 h-7 px-2"
                      data-testid={`preview-reserve-${article.slug}`}
                      title="Prévisualiser et modifier l'article"
                    >
                      <Eye size={12} />Prévisualiser
                    </Button>
                    <Button size="sm" variant="outline"
                      onClick={() => editReserveArticle(article)}
                      className="text-xs gap-1.5 h-7 px-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      data-testid={`edit-reserve-${article.slug}`}
                      title="Modifier dans la section Articles"
                    >
                      <Edit2 size={12} />Modifier
                    </Button>
                    <Button size="sm"
                      onClick={() => publishArticleNow(article)}
                      disabled={publishingSlug === article.slug}
                      className="text-xs gap-1.5 h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                      data-testid={`publish-reserve-${article.slug}`}
                      title="Publier immédiatement"
                    >
                      {publishingSlug === article.slug
                        ? <RefreshCw size={12} className="animate-spin" />
                        : <Send size={12} />
                      }
                      Publier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: PLANNING ─── */}
      {genTab === 'planning' && (
        <div className="space-y-4">
          {planningStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'En attente', value: planningStats.pending, color: 'text-gray-600 bg-gray-50' },
                { label: 'Génération...', value: planningStats.generating, color: 'text-blue-600 bg-blue-50' },
                { label: 'Planifiés', value: planningStats.scheduled, color: 'text-orange-600 bg-orange-50' },
                { label: 'Publiés', value: planningStats.published, color: 'text-green-600 bg-green-50' },
                { label: 'Erreurs', value: planningStats.errors, color: 'text-red-600 bg-red-50' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {planningStats && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
              <RefreshCw size={13} />
              <span>File : <strong>{planningStats.scheduled}/{planningStats.queue_size}</strong> articles en réserve · Prochaine publication : <strong>{planningStats.next_publish ? new Date(planningStats.next_publish).toLocaleString('fr-FR', {weekday:'long', day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit'}) : '—'}</strong></span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input ref={csvFileRef} type="file" accept=".csv,.txt" onChange={importCSV} className="hidden" />
            <Button onClick={() => csvFileRef.current?.click()} className="bg-french-blue hover:bg-french-blue/90" data-testid="import-csv-btn">
              <Upload size={15} className="mr-2" />Importer un CSV
            </Button>
            <Button variant="outline" onClick={loadPlanning} disabled={planningLoading}>
              <RefreshCw size={15} className={planningLoading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={triggerQueue} disabled={triggeringQueue} variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50" data-testid="trigger-queue-btn">
              {triggeringQueue ? <RefreshCw size={15} className="animate-spin mr-2" /> : <Sparkles size={15} className="mr-2 text-purple-500" />}
              Déclencher la file
            </Button>
            <p className="text-xs text-gray-500 ml-1">Colonnes : Date suggérée, Sujet, Mot-clé principal, Ville cible, Public, Longueur, Priorité SEO, Notes</p>
          </div>

          {importResult && (
            <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${importResult.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {importResult.error ? <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> : <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />}
              <span>{importResult.error || importResult.message}</span>
            </div>
          )}

          {planningLoading ? (
            <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-french-blue" size={28} /></div>
          ) : planningItems.length === 0 ? (
            <Card><CardContent className="p-12 text-center">
              <List size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Aucun article dans le planning</p>
              <p className="text-sm text-gray-400 mt-1">Importez un fichier CSV pour commencer</p>
            </CardContent></Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm" data-testid="planning-table">
                <thead className="text-xs text-gray-500 uppercase tracking-wide border-b" style={{ background: '#0D2E5C', color: 'rgba(255,255,255,0.7)' }}>
                  <tr>
                    <th className="px-3 py-3 text-left">Statut</th>
                    <th className="px-3 py-3 text-left">Date publi.</th>
                    <th className="px-3 py-3 text-left" style={{ minWidth: 200 }}>Sujet</th>
                    <th className="px-3 py-3 text-left" style={{ minWidth: 130 }}>Mot-clé principal</th>
                    <th className="px-3 py-3 text-left">Ville</th>
                    <th className="px-3 py-3 text-left">Public</th>
                    <th className="px-3 py-3 text-left">Longueur</th>
                    <th className="px-3 py-3 text-left">Priorité</th>
                    <th className="px-3 py-3 text-left">Données</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {planningItems.map((item, i) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(isSelected ? null : item)}
                        className={`cursor-pointer transition-colors ${isSelected ? '' : i % 2 === 0 ? 'hover:bg-gray-50' : 'bg-gray-50/30 hover:bg-gray-100/60'}`}
                        style={isSelected ? { borderLeft: '3px solid #0D2E5C', background: 'rgba(13,46,92,0.05)' } : {}}
                        data-testid={`planning-row-${item.id}`}
                      >
                        <td className="px-3 py-2.5">{statusBadge(item.status)}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                          {new Date(item.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-3 py-2.5" style={{ maxWidth: 240 }}>
                          <p className="text-xs font-medium text-gray-800 truncate" title={item.subject}>{item.subject}</p>
                          {item.notes && <p className="text-[10px] text-gray-400 truncate">{item.notes}</p>}
                          {item.status === 'error' && <p className="text-[10px] text-red-500 truncate">⚠ {item.error_message?.slice(0, 50)}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600" style={{ maxWidth: 150 }}>
                          <span className="truncate block" title={item.main_keyword}>{item.main_keyword || '—'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{item.target_city || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{item.audience || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{item.length || 'moyen'}</td>
                        <td className="px-3 py-2.5">{priorityBadge(item.seo_priority)}</td>
                        <td className="px-3 py-2.5">
                          {item.article ? <SeoBadge article={item.article} /> : <PlanningDataBadge item={item} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── FIXED RIGHT PANEL ─── */}
      {selectedItem && genTab === 'planning' && (
        <div
          data-testid="planning-detail-panel"
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
            zIndex: 50, background: 'white',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
            borderLeft: '1px solid #e5e7eb',
            overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b sticky top-0 z-10" style={{ background: '#0D2E5C' }}>
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Détails &amp; Actions</span>
            <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {statusBadge(selectedItem.status)}
              {priorityBadge(selectedItem.seo_priority)}
              {selectedItem.article ? <SeoBadge article={selectedItem.article} /> : <PlanningDataBadge item={selectedItem} />}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Sujet</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{selectedItem.subject}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Date publi.', new Date(selectedItem.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })],
                ['Mot-clé', selectedItem.main_keyword],
                ['Ville cible', selectedItem.target_city],
                ['Public', selectedItem.audience],
                ['Longueur', selectedItem.length || 'moyen'],
                ['Catégorie', selectedItem.category],
                ['H2 principal', selectedItem.h2_1],
                ['FAQ Q1', selectedItem.faq_q1],
                ['CTA', selectedItem.cta_main],
                ['Alt image', selectedItem.img_main_alt],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                  <p className="text-gray-700 font-medium truncate mt-0.5" title={val}>{val}</p>
                </div>
              ))}
            </div>

            {selectedItem.notes && (
              <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 border border-amber-100">
                <p className="font-bold mb-1">Notes éditeur</p>
                <p>{selectedItem.notes}</p>
              </div>
            )}

            {selectedItem.status === 'error' && selectedItem.error_message && (
              <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700 border border-red-200">
                <p className="font-bold mb-1">Erreur de génération</p>
                <p className="break-words">{selectedItem.error_message}</p>
              </div>
            )}

            {selectedItem.article && (
              <div className="bg-blue-50 rounded-xl p-3 text-xs space-y-1.5 border border-blue-100">
                <p className="font-bold text-french-blue text-[10px] uppercase tracking-wide mb-2">Article généré</p>
                {selectedItem.article.meta_title && (
                  <div>
                    <span className="text-gray-500">Titre SEO : </span>
                    <span className={`font-medium ${selectedItem.article.meta_title.length > 60 ? 'text-red-600' : 'text-gray-800'}`}>
                      {selectedItem.article.meta_title}
                    </span>
                    <span className="text-gray-400 ml-1">({selectedItem.article.meta_title.length}/60)</span>
                  </div>
                )}
                {(selectedItem.article.meta_description || selectedItem.article.excerpt) && (
                  <div>
                    <span className="text-gray-500">Méta desc : </span>
                    <span className="text-gray-600 line-clamp-2">{selectedItem.article.meta_description || selectedItem.article.excerpt}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t space-y-2 sticky bottom-0 bg-white">
            {(selectedItem.status === 'pending' || selectedItem.status === 'error') && (
              <button
                onClick={() => generateItemNow(selectedItem)}
                disabled={generatingItem === selectedItem.id}
                data-testid={`panel-generate-${selectedItem.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: '#7C3AED', color: 'white' }}
              >
                {generatingItem === selectedItem.id
                  ? <><RefreshCw size={15} className="animate-spin" />Génération en cours...</>
                  : <><Sparkles size={15} />Générer maintenant</>}
              </button>
            )}
            {selectedItem.status === 'scheduled' && selectedItem.article_slug && (
              <button
                onClick={() => publishItemNow(selectedItem)}
                disabled={publishingItem === selectedItem.id}
                data-testid={`panel-publish-${selectedItem.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: '#059669', color: 'white' }}
              >
                {publishingItem === selectedItem.id
                  ? <><RefreshCw size={15} className="animate-spin" />Publication...</>
                  : <><Zap size={15} />Publier maintenant</>}
              </button>
            )}
            {(selectedItem.status === 'scheduled' || selectedItem.status === 'published') && selectedItem.article_slug && (
              <a
                href={`/articles/${selectedItem.article_slug}`} target="_blank" rel="noreferrer"
                data-testid={`panel-view-${selectedItem.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={15} />Voir l'article
              </a>
            )}
            {selectedItem.article && (
              <button
                onClick={() => setPreviewArticle(selectedItem.article)}
                data-testid={`panel-preview-${selectedItem.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
              >
                <Eye size={15} />Prévisualiser / Modifier
              </button>
            )}
            <button
              onClick={() => { deleteItem(selectedItem); setSelectedItem(null); }}
              data-testid={`panel-delete-${selectedItem.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />Supprimer cet article
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB: CSV HISTORY ─── */}
      {genTab === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Historique des imports CSV</h3>
              <p className="text-xs text-gray-500 mt-0.5">La suppression retire les articles <strong>en attente</strong> uniquement.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadCsvImports} disabled={csvLoading}>
              <RefreshCw size={15} className={csvLoading ? 'animate-spin' : ''} />
            </Button>
          </div>

          {importResult && (
            <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${importResult.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {importResult.error ? <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> : <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />}
              <span>{importResult.error || importResult.message}</span>
            </div>
          )}

          {csvLoading ? (
            <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin text-french-blue" size={28} /></div>
          ) : csvImports.length === 0 ? (
            <Card><CardContent className="p-12 text-center">
              <Upload size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Aucun CSV importé</p>
              <p className="text-sm text-gray-400 mt-1">Allez dans "Planning éditorial" pour importer un fichier CSV</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {csvImports.map((imp) => {
                const stats = imp.live_stats || {};
                const totalItems = (stats.published || 0) + (stats.scheduled || 0) + (stats.pending || 0) + (stats.errors || 0);
                const progress = totalItems > 0 ? Math.round(((stats.published || 0) + (stats.scheduled || 0)) / totalItems * 100) : 0;
                return (
                  <Card key={imp.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-800 truncate">{imp.filename}</p>
                            <span className="text-[10px] bg-french-blue/10 text-french-blue px-1.5 py-0.5 rounded-full font-medium">{imp.imported_count} articles</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Importé le {new Date(imp.imported_at).toLocaleString('fr-FR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                          {imp.skipped_past > 0 && <p className="text-[10px] text-gray-400">{imp.skipped_past} ignoré(s) date passée · {imp.skipped_dup || 0} doublon(s)</p>}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                              <span className="text-green-600 font-medium">{stats.published || 0} publiés</span>
                              <span className="text-orange-500 font-medium">{stats.scheduled || 0} planifiés</span>
                              <span className="text-gray-400">{stats.pending || 0} en attente</span>
                              {stats.errors > 0 && <span className="text-red-500">{stats.errors} erreurs</span>}
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteCsvImport(imp.id, imp.filename)}
                          className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer ce CSV (et ses articles en attente)" data-testid={`delete-csv-${imp.id}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleGenerator;
