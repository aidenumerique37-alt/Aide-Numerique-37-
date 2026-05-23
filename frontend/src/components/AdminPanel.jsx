import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Save, Eye, LogOut, Type, FileText, Settings, CheckCircle, AlertCircle,
  Plus, Trash2, Edit2, MapPin, RefreshCw, Globe, GripVertical, X, Users,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Link as LinkIcon,
  ArrowUp, ArrowDown, LayoutGrid, Upload, Image as ImageIcon, Sparkles, Wand2,
  List, ExternalLink, Building2, ChevronDown, ChevronUp, BarChart2,
  LayoutDashboard, Code, Zap, BookOpen, Scale
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import axios from 'axios';
import SeoDashboard from './admin/SeoDashboard';
import { SeoBadge, computeSeoScore } from './admin/SeoBadge';
import RichEditor from './admin/RichEditor';
import ArticlePreview from './admin/ArticlePreview';
import ImageInputField from './admin/ImageInputField';
import MediaLibrary from './admin/MediaLibrary';
import ArticleGenerator from './admin/ArticleGenerator';
import VideoUploader from './admin/VideoUploader';
import CitiesSection from './admin/sections/CitiesSection';
import PartnersSection from './admin/sections/PartnersSection';
import ArticlesSection from './admin/sections/ArticlesSection';
import PortfolioSection from './admin/sections/PortfolioSection';
import LegalPagesSection from './admin/sections/LegalPagesSection';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const getAuthHeaders = () => ({ 'Authorization': `Bearer ${sessionStorage.getItem('adminToken') || ''}` });


// Icon options for services
const ICON_OPTIONS = [
  { value: 'monitor', label: 'Moniteur' },
  { value: 'graduation-cap', label: 'Formation' },
  { value: 'settings', label: 'Paramètres' },
  { value: 'wrench', label: 'Dépannage' },
  { value: 'globe', label: 'Web/Globe' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'shield', label: 'Sécurité' },
  { value: 'mail', label: 'Email' },
];


const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [content, setContent] = useState({
    hero: { title: '', title_highlight: '', title_suffix: '', subtitle: '', button_text: '', font_family: 'Montserrat', font_size: 'normal', font_size_suffix: 'small' },
    services: { title: '', subtitle: '' },
    about: { title: '', description: '' },
    contact: { title: '', subtitle: '' },
    section_order: ['reviews', 'services', 'howItWorks', 'urssafInfo', 'press', 'contact', 'partners']
  });
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityPages, setCityPages] = useState([]);
  const [editingCityPage, setEditingCityPage] = useState(null); // null | {} | {slug:...}
  const [cityPageGenerating, setCityPageGenerating] = useState(false);
  const [citiesSubTab, setCitiesSubTab] = useState('zone'); // 'zone' | 'pages'
  const [articles, setArticles] = useState([]);
  const [articleFilter, setArticleFilter] = useState('all'); // 'all' | 'ai' | 'no-content' | 'low-seo'
  const [articleSort, setArticleSort] = useState('date'); // 'date' | 'seo-asc'
  const [articleSearch, setArticleSearch] = useState('');
  const [editingArticle, setEditingArticle] = useState(null);
  const [backfillResult, setBackfillResult] = useState(null);
  const [backfilling, setBackfilling] = useState(false);
  const [articleSaving, setArticleSaving] = useState(false);
  const [regeneratingArticle, setRegeneratingArticle] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(null);
  const [generatingMeta, setGeneratingMeta] = useState(null);
  const [updatingYears, setUpdatingYears] = useState(false);
  const [yearUpdateResult, setYearUpdateResult] = useState(null);
  const [fixingLinks, setFixingLinks] = useState(false);
  const [fixLinksResult, setFixLinksResult] = useState(null);
  const [fixingPlanningLinks, setFixingPlanningLinks] = useState(false);
  const [fixPlanningLinksResult, setFixPlanningLinksResult] = useState(null);
  const [sitemapRegen, setSitemapRegen] = useState(false);
  const [sitemapResult, setSitemapResult] = useState(null);

  // Auto-enrich low-SEO articles
  const [autoEnrichRun, setAutoEnrichRun] = useState(null); // { run_id, status, total, processed, report }
  const [autoEnrichLaunching, setAutoEnrichLaunching] = useState(false);
  const autoEnrichPollRef = useRef(null);

  // CSV import
  const [importingCsv, setImportingCsv] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const csvInputRef = useRef(null);

  // Portfolio state
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  // Memoized filtered + sorted article list
  const filteredArticles = useMemo(() => {
    let list = articles
      .filter(a => {
        if (articleFilter === 'ai')         return a.source === 'ai_generated';
        if (articleFilter === 'no-content') return !a.content || a.content.length < 50;
        if (articleFilter === 'low-seo')    return computeSeoScore(a).score <= 2;
        if (articleFilter === 'scheduled')  return a.status === 'scheduled';
        return true;
      })
      .filter(a => !articleSearch || a.title?.toLowerCase().includes(articleSearch.toLowerCase()));

    if (articleSort === 'seo-asc') {
      list = [...list].sort((a, b) => computeSeoScore(a).score - computeSeoScore(b).score);
    }
    if (articleSort === 'date-asc') {
      list = [...list].sort((a, b) => {
        const da = new Date(a.date_published || a.scheduled_at || '9999');
        const db_ = new Date(b.date_published || b.scheduled_at || '9999');
        return da - db_;
      });
    }
    return list;
  }, [articles, articleFilter, articleSort, articleSearch]);

  // Memoized city lists
  const primaryCitiesList = useMemo(() => cities.filter(c => c.is_primary), [cities]);
  const secondaryCitiesList = useMemo(
    () => cities.filter(c => !c.is_primary).sort((a,b) => a.name.localeCompare(b.name, 'fr')),
    [cities]
  );

  const runBackfillSeo = async () => {
    setBackfilling(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/articles/backfill-seo`, {}, { headers: getAuthHeaders() });
      setBackfillResult({ message: res.data.message });
      axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() })
        .then(r => setArticles(r.data)).catch(() => {});
    } catch (e) { setBackfillResult({ error: e.response?.data?.detail || e.message }); }
    setBackfilling(false);
    setTimeout(() => setBackfillResult(null), 6000);
  };

  const runSitemapRegen = async () => {
    setSitemapRegen(true);
    setSitemapResult(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/sitemap/regenerate`, {}, { headers: getAuthHeaders() });
      setSitemapResult({ message: res.data.message, success: true });
    } catch (e) {
      setSitemapResult({ error: e.response?.data?.detail || e.message, success: false });
    }
    setSitemapRegen(false);
    setTimeout(() => setSitemapResult(null), 8000);
  };

  // ── Auto-enrich low SEO articles (≤ threshold/5) ──
  const pollAutoEnrich = (runId) => {
    if (autoEnrichPollRef.current) clearInterval(autoEnrichPollRef.current);
    autoEnrichPollRef.current = setInterval(async () => {
      try {
        const r = await axios.get(
          `${BACKEND_URL}/api/admin/articles/auto-enrich/status?run_id=${runId}`,
          { headers: getAuthHeaders() }
        );
        if (r.data.found) {
          setAutoEnrichRun(r.data);
          if (r.data.status === 'done' || (typeof r.data.status === 'string' && r.data.status.startsWith('error'))) {
            clearInterval(autoEnrichPollRef.current);
            autoEnrichPollRef.current = null;
            // Refresh article list once finished
            axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() })
              .then(resp => setArticles(resp.data)).catch(() => {});
          }
        }
      } catch (e) { /* noop */ }
    }, 5000);
  };

  const cancelAutoEnrich = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/admin/articles/auto-enrich/cancel`, {}, { headers: getAuthHeaders() });
      if (autoEnrichPollRef.current) { clearInterval(autoEnrichPollRef.current); autoEnrichPollRef.current = null; }
      setAutoEnrichRun(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (e) {
      alert('Erreur annulation : ' + (e.response?.data?.detail || e.message));
    }
  };

  // Import planning CSV → POST /api/admin/articles/import-csv
  const importCsv = async (file) => {
    if (!file) return;
    setImportingCsv(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/import-csv`,
        formData,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      const d = res.data;
      setImportResult({
        success: true,
        message: `✓ ${d.inserted} articles importés, ${d.skipped} ignorés (doublons)` +
          (d.errors?.length ? `, ${d.errors.length} erreur(s)` : ''),
        errors: d.errors || [],
      });
      // Refresh article list
      axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() })
        .then(r => setArticles(r.data)).catch(() => {});
    } catch (e) {
      setImportResult({ success: false, message: e.response?.data?.detail || e.message, errors: [] });
    }
    setImportingCsv(false);
    setTimeout(() => setImportResult(null), 10000);
  };

  const launchAutoEnrich = async (opts = {}) => {
    const threshold = opts.threshold ?? 3;
    const max_articles = opts.max_articles ?? 10;
    const regenerate_images = opts.regenerate_images ?? false;
    if (!window.confirm(`Lancer l'enrichissement automatique des articles (max ${max_articles} articles, ~30-90 s/article) ?\n\nClaude va générer : contenu complet, meta_title, meta_description, tags pour chaque article déficient.`)) return;
    // Fetch saved master_prompt from DB before launching
    let master_prompt = '';
    try {
      const cfgRes = await axios.get(`${BACKEND_URL}/api/admin/generator/config`, { headers: getAuthHeaders() });
      master_prompt = cfgRes.data?.master_prompt || '';
    } catch (_) {}
    setAutoEnrichLaunching(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/auto-enrich`,
        { threshold, max_articles, regenerate_images, master_prompt },
        { headers: getAuthHeaders(), timeout: 15000 }
      );
      if (res.data.success) {
        setAutoEnrichRun({ run_id: res.data.run_id, status: 'queued', total: 0, processed: 0, report: [] });
        pollAutoEnrich(res.data.run_id);
      } else {
        alert(res.data.message || 'Un enrichissement est déjà en cours.');
        if (res.data.run_id) pollAutoEnrich(res.data.run_id);
      }
    } catch (e) {
      alert(e.response?.data?.detail || e.message);
    }
    setAutoEnrichLaunching(false);
  };

  // Resume polling if a run is still active after page reload
  useEffect(() => {
    if (!isAuthenticated) return;
    axios.get(`${BACKEND_URL}/api/admin/articles/auto-enrich/status`,
      { headers: getAuthHeaders() })
      .then(r => {
        if (r.data.found && r.data.status === 'running') {
          setAutoEnrichRun(r.data);
          pollAutoEnrich(r.data.run_id);
        }
      }).catch(() => {});
    return () => { if (autoEnrichPollRef.current) clearInterval(autoEnrichPollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const [partners, setPartners] = useState([]);
  const [partnerCategories, setPartnerCategories] = useState([]);
  const [newPartnerCategory, setNewPartnerCategory] = useState('');
  const [syncStatus, setSyncStatus] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [newCity, setNewCity] = useState('');

  // Check session auth
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeSection === 'dashboard') loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, isAuthenticated]);

  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`, { headers: getAuthHeaders() });
      setDashboardStats(res.data);
    } catch { setDashboardStats(null); }
    setDashboardLoading(false);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [contentRes, servicesRes, citiesRes, articlesRes, partnersRes, partnerCatsRes, syncStatusRes, cityPagesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/content`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/services`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/cities`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/partners`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/partner-categories`, { headers: getAuthHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/articles/sync-status`, { headers: getAuthHeaders() }).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/admin/city-pages`, { headers: getAuthHeaders() }).catch(() => ({ data: [] }))
      ]);
      setContent(contentRes.data);
      setServices(servicesRes.data);
      setCities(citiesRes.data);
      setArticles(articlesRes.data);
      setPartners(partnersRes.data);
      setPartnerCategories(partnerCatsRes.data);
      setSyncStatus(syncStatusRes.data);
      setCityPages(cityPagesRes.data || []);
      // Load portfolio
      axios.get(`${BACKEND_URL}/api/admin/portfolio`, { headers: getAuthHeaders() })
        .then(r => setPortfolioProjects(r.data || [])).catch(() => {});
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============ PORTFOLIO CRUD ============
  const saveProject = async (project) => {
    try {
      if (project.id) {
        const res = await axios.put(`${BACKEND_URL}/api/admin/portfolio/${project.id}`, project, { headers: getAuthHeaders() });
        setPortfolioProjects(prev => prev.map(p => p.id === project.id ? res.data : p));
      } else {
        const res = await axios.post(`${BACKEND_URL}/api/admin/portfolio`, project, { headers: getAuthHeaders() });
        setPortfolioProjects(prev => [...prev, res.data]);
      }
      setEditingProject(null);
    } catch (e) { alert('Erreur lors de la sauvegarde : ' + (e.response?.data?.detail || e.message)); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Supprimer cette réalisation ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/portfolio/${id}`, { headers: getAuthHeaders() });
      setPortfolioProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert('Erreur suppression : ' + (e.response?.data?.detail || e.message)); }
  };

  // ============ ARTICLES CRUD ============
  const deleteArticle = async (slug) => {
    if (!window.confirm('Supprimer définitivement cet article ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/articles/${slug}`, { headers: getAuthHeaders() });
      setArticles(prev => prev.filter(a => a.slug !== slug));
    } catch (e) { alert('Erreur suppression : ' + (e.response?.data?.detail || e.message)); }
  };

  const saveArticle = async () => {
    if (!editingArticle) return;
    setArticleSaving(true);
    const originalSlug = editingArticle._originalSlug;
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/articles/${originalSlug}`,
        editingArticle,
        { headers: getAuthHeaders() }
      );
      const res = await axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() });
      setArticles(res.data);
      setEditingArticle(null);
    } catch (e) {
      alert(e.response?.data?.detail || e.message);
    }
    setArticleSaving(false);
  };

  const generateArticleImage = async (slug) => {
    setGeneratingImage(slug);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/${slug}/generate-image`,
        {},
        { headers: getAuthHeaders(), timeout: 90000 }
      );
      const imageUrl = res.data.image_url;
      setArticles(prev => prev.map(a => a.slug === slug ? { ...a, image_url: imageUrl } : a));
      if (editingArticle?._originalSlug === slug) setEditingArticle(prev => ({ ...prev, image_url: imageUrl }));
    } catch (e) {
      alert(e.response?.data?.detail || 'Erreur lors de la génération d\'image. Réessayez.');
    }
    setGeneratingImage(null);
  };

  const generateArticleMeta = async (slug) => {
    setGeneratingMeta(slug);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/${slug}/generate-meta`,
        {},
        { headers: getAuthHeaders(), timeout: 60000 }
      );
      const meta = res.data.meta_description;
      setArticles(prev => prev.map(a => a.slug === slug ? { ...a, meta_description: meta } : a));
      if (editingArticle?._originalSlug === slug) setEditingArticle(prev => ({ ...prev, meta_description: meta }));
    } catch (e) {
      alert(e.response?.data?.detail || 'Erreur lors de la génération de la meta. Réessayez.');
    }
    setGeneratingMeta(null);
  };

  const regenerateArticle = async (slug) => {
    if (!window.confirm('Retravail SEO de cet article avec Claude et le prompt maître ? Le contenu actuel sera remplacé par une nouvelle version optimisée (30 à 90 secondes).')) return;
    setRegeneratingArticle(slug);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/${slug}/regenerate`,
        {},
        { headers: getAuthHeaders(), timeout: 30000 }
      );
      if (res.data.background) {
        // Background task launched — poll for completion
        alert(res.data.message);
        // Poll every 8s for up to 2 minutes
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await axios.get(
              `${BACKEND_URL}/api/admin/articles/${slug}/regeneration-status`,
              { headers: getAuthHeaders() }
            );
            if (statusRes.data.done && statusRes.data.article) {
              clearInterval(poll);
              const updated = statusRes.data.article;
              setArticles(prev => prev.map(a => a.slug === slug ? { ...a, ...updated } : a));
              if (editingArticle?._originalSlug === slug) setEditingArticle(prev => ({ ...prev, ...updated }));
              if (previewArticle?.slug === slug) setPreviewArticle(updated);
              setRegeneratingArticle(null);
            } else if (statusRes.data.error || attempts >= 15) {
              clearInterval(poll);
              if (statusRes.data.error) alert(`Erreur régénération : ${statusRes.data.regeneration_status}`);
              setRegeneratingArticle(null);
              loadAllData();
            }
          } catch(pollErr) { console.error('Poll regeneration error:', pollErr); }
        }, 8000);
      } else {
        const updated = res.data.article;
        setArticles(prev => prev.map(a => a.slug === slug ? { ...a, ...updated } : a));
        if (editingArticle?._originalSlug === slug) setEditingArticle(prev => ({ ...prev, ...updated }));
        if (previewArticle?.slug === slug) setPreviewArticle(updated);
        setRegeneratingArticle(null);
      }
    } catch (e) {
      if (e.code === 'ECONNABORTED' || e.response?.status === 502 || !e.response) {
        alert('La régénération est en cours sur le serveur. Rechargez la liste dans quelques instants.');
      } else {
        alert(e.response?.data?.detail || e.message);
      }
      setRegeneratingArticle(null);
    }
  };

  const updateArticleYears = async () => {
    const count = articles.filter(a => /\b(2023|2024|2025)\b/.test(a.title || '')).length;
    if (!window.confirm(`Remplacer automatiquement toutes les occurrences de 2023/2024/2025 par 2026 dans les titres et contenus des ${articles.length} articles ?\n\n~${count} titre(s) concerné(s) détecté(s). Cette action est irréversible.`)) return;
    setUpdatingYears(true);
    setYearUpdateResult(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/update-years`,
        {},
        { headers: getAuthHeaders(), timeout: 60000 }
      );
      setYearUpdateResult({ success: true, message: res.data.message });
      // Reload articles to reflect updated titles
      const refreshed = await axios.get(`${BACKEND_URL}/api/admin/articles`, { headers: getAuthHeaders() });
      setArticles(refreshed.data);
    } catch (e) {
      setYearUpdateResult({ success: false, message: e.response?.data?.detail || e.message });
    }
    setUpdatingYears(false);
    setTimeout(() => setYearUpdateResult(null), 8000);
  };

  const fixBrokenLinks = async () => {
    if (!window.confirm(`Scanner les ${articles.length} articles et corriger/supprimer automatiquement les liens internes cassés ?\n\nLes liens valides seront préservés. Les liens vers des articles inexistants seront remplacés par l'article le plus proche ou supprimés.`)) return;
    setFixingLinks(true);
    setFixLinksResult(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/fix-broken-links`,
        {},
        { headers: getAuthHeaders(), timeout: 120000 }
      );
      setFixLinksResult({ success: true, message: res.data.message, data: res.data });
    } catch (e) {
      setFixLinksResult({ success: false, message: e.response?.data?.detail || e.message });
    }
    setFixingLinks(false);
    setTimeout(() => setFixLinksResult(null), 12000);
  };

  const fixPlanningLinks = async () => {
    if (!window.confirm(`Corriger les slugs de liens internes dans le planning ?\n\nLes liens vers des articles inexistants seront remplacés par l'article le plus similaire, ou supprimés si aucune correspondance n'est trouvée.`)) return;
    setFixingPlanningLinks(true);
    setFixPlanningLinksResult(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/planning/fix-link-slugs`,
        {},
        { headers: getAuthHeaders(), timeout: 60000 }
      );
      setFixPlanningLinksResult({ success: true, message: res.data.message, data: res.data });
    } catch (e) {
      setFixPlanningLinksResult({ success: false, message: e.response?.data?.detail || e.message });
    }
    setFixingPlanningLinks(false);
    setTimeout(() => setFixPlanningLinksResult(null), 12000);
  };

  const saveCityPage = async (page) => {
    const isNew = !cityPages.find(p => p.slug === page.slug);
    const method = isNew ? 'post' : 'put';
    const url = isNew
      ? `${BACKEND_URL}/api/admin/city-pages`
      : `${BACKEND_URL}/api/admin/city-pages/${page.slug}`;
    try {
      await axios[method](url, page, { headers: getAuthHeaders() });
      const res = await axios.get(`${BACKEND_URL}/api/admin/city-pages`, { headers: getAuthHeaders() });
      setCityPages(res.data);
      setEditingCityPage(null);
    } catch (e) { alert('Erreur sauvegarde ville : ' + (e.response?.data?.detail || e.message)); }
  };

  const deleteCityPage = async (slug) => {
    if (!window.confirm('Supprimer cette page de ville ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/city-pages/${slug}`, { headers: getAuthHeaders() });
      setCityPages(prev => prev.filter(p => p.slug !== slug));
    } catch (e) { alert('Erreur suppression : ' + (e.response?.data?.detail || e.message)); }
  };

  const generateCityImage = async (slug) => {
    setCityPageGenerating(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/city-pages/${slug}/generate-image`,
        {},
        { headers: getAuthHeaders(), timeout: 120000 }
      );
      setEditingCityPage(prev => prev ? { ...prev, image_url: res.data.url } : prev);
      const pagesRes = await axios.get(`${BACKEND_URL}/api/admin/city-pages`, { headers: getAuthHeaders() });
      setCityPages(pagesRes.data);
    } catch (e) {
      if (e.response?.status === 502 || !e.response) {
        alert("Génération image en cours (peut prendre 30-60s), rechargez pour voir le résultat.");
      } else {
        alert(e.response?.data?.detail || e.message);
      }
    }
    setCityPageGenerating(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/login`, { password });
      sessionStorage.setItem('adminToken', res.data.token);
      setIsAuthenticated(true);
      setError('');
      loadAllData();
    } catch {
      setError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminToken');
  };

  const showStatus = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // ============ CONTENT HANDLERS ============
  const handleContentChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const saveContent = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/content`, content, {
        headers: getAuthHeaders()
      });
      showStatus('success', 'Contenu enregistré !');
    } catch (err) {
      showStatus('error', 'Erreur lors de l\'enregistrement');
    }
  };

  // ============ SERVICES HANDLERS ============
  const saveService = async (service) => {
    try {
      if (service.id && !service.id.startsWith('new-')) {
        await axios.put(`${BACKEND_URL}/api/admin/services/${service.id}`, service, {
          headers: getAuthHeaders()
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/admin/services`, service, {
          headers: getAuthHeaders()
        });
      }
      showStatus('success', 'Service enregistré !');
      loadAllData();
      setEditingService(null);
    } catch (err) {
      showStatus('error', 'Erreur lors de l\'enregistrement');
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/services/${serviceId}`, {
        headers: getAuthHeaders()
      });
      showStatus('success', 'Service supprimé !');
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur lors de la suppression');
    }
  };

  // ============ CITIES HANDLERS ============
  const addCity = async () => {
    if (!newCity.trim()) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/cities`, { name: newCity.trim(), is_primary: false }, {
        headers: getAuthHeaders()
      });
      showStatus('success', `Ville "${newCity}" ajoutée !`);
      setNewCity('');
      loadAllData();
    } catch (err) {
      showStatus('error', err.response?.data?.detail || 'Erreur');
    }
  };

  const deleteCity = async (cityName) => {
    if (!window.confirm(`Supprimer "${cityName}" ?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/cities/${encodeURIComponent(cityName)}`, {
        headers: getAuthHeaders()
      });
      showStatus('success', 'Ville supprimée !');
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur lors de la suppression');
    }
  };

  const toggleCityPrimary = async (cityName, currentPrimary) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/cities/${encodeURIComponent(cityName)}`, 
        { is_primary: !currentPrimary },
        { headers: getAuthHeaders() }
      );
      showStatus('success', `"${cityName}" ${!currentPrimary ? 'principale' : 'secondaire'}`);
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur');
    }
  };

  // ============ PARTNERS HANDLERS ============
  const savePartner = async (partner) => {
    try {
      if (partner.id && !partner.id.startsWith('new-')) {
        await axios.put(`${BACKEND_URL}/api/admin/partners/${partner.id}`, partner, {
          headers: getAuthHeaders()
        });
      } else {
        const newPartner = { ...partner };
        delete newPartner.id;
        await axios.post(`${BACKEND_URL}/api/admin/partners`, newPartner, {
          headers: getAuthHeaders()
        });
      }
      showStatus('success', 'Partenaire enregistré !');
      loadAllData();
      setEditingPartner(null);
    } catch (err) {
      showStatus('error', 'Erreur lors de l\'enregistrement');
    }
  };

  const deletePartner = async (partnerId) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/partners/${partnerId}`, {
        headers: getAuthHeaders()
      });
      showStatus('success', 'Partenaire supprimé !');
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur lors de la suppression');
    }
  };

  const addSocialLink = () => {
    setEditingPartner(prev => ({
      ...prev,
      social_links: [...(prev.social_links || []), { platform: 'facebook', url: '' }]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setEditingPartner(prev => {
      const newLinks = [...(prev.social_links || [])];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, social_links: newLinks };
    });
  };

  const removeSocialLink = (index) => {
    setEditingPartner(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }));
  };

  // ============ PARTNER CATEGORIES HANDLERS ============
  const addPartnerCategory = async () => {
    if (!newPartnerCategory.trim()) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/partner-categories`, { name: newPartnerCategory.trim() }, {
        headers: getAuthHeaders()
      });
      showStatus('success', `Catégorie "${newPartnerCategory}" ajoutée !`);
      setNewPartnerCategory('');
      loadAllData();
    } catch (err) {
      showStatus('error', err.response?.data?.detail || 'Erreur');
    }
  };

  const deletePartnerCategory = async (catName) => {
    if (!window.confirm(`Supprimer la catégorie "${catName}" ?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/partner-categories/${encodeURIComponent(catName)}`, {
        headers: getAuthHeaders()
      });
      showStatus('success', 'Catégorie supprimée !');
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur lors de la suppression');
    }
  };

  // ============ ARTICLES HANDLERS ============
  const syncArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sync-wordpress`, {}, {
        headers: getAuthHeaders()
      });
      showStatus('success', res.data.message);
      loadAllData();
    } catch (err) {
      showStatus('error', 'Erreur lors de la synchronisation');
    } finally {
      setLoading(false);
    }
  };

  // ============ LOGIN SCREEN ============
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Admin | Aide Numérique 37</title>
        </Helmet>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-french-blue rounded-xl flex items-center justify-center mx-auto mb-4">
              <Settings className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl">Administration</CardTitle>
            <p className="text-gray-600 text-sm mt-2">Aide Numérique 37</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Mot de passe administrateur"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full bg-french-blue hover:bg-french-blue/90">
                Connexion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ MAIN ADMIN PANEL ============
  const sections = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'content', label: 'Contenu Textes', icon: Type },
    { id: 'layout', label: 'Mise en page', icon: LayoutGrid },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'portfolio', label: 'Réalisations Web', icon: Globe },
    { id: 'cities', label: 'Villes', icon: MapPin },
    { id: 'partners', label: 'Partenaires', icon: Users },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'media', label: 'Médiathèque', icon: ImageIcon },
    { id: 'generator', label: 'Générateur IA', icon: Sparkles },
    { id: 'seo', label: 'SEO', icon: BarChart2 },
    { id: 'legal', label: 'Juridique', icon: Scale },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F5EFE6' }}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin | Aide Numérique 37</title>
      </Helmet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: '#0D2E5C' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#D4AF37' }}>
              <Settings className="text-white" size={18} />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">Administration</h1>
              <p className="text-xs leading-tight" style={{ color: '#D4AF37' }}>Aide Numérique 37</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"
              className="text-white hover:text-white border border-white/20 hover:bg-white/10 gap-1.5 text-xs"
              onClick={() => window.open('/', '_blank')}>
              <Eye size={14} />
              Voir le site
            </Button>
            <button onClick={handleLogout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Toast ── */}
      {saveStatus && (
        <div className={`fixed top-20 right-4 p-4 rounded-xl shadow-xl flex items-center gap-2 z-50 text-sm font-medium ${
          saveStatus.type === 'success'
            ? 'text-white'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`} style={saveStatus.type === 'success' ? { background: '#0D2E5C' } : {}}>
          {saveStatus.type === 'success'
            ? <CheckCircle size={18} style={{ color: '#D4AF37' }} />
            : <AlertCircle size={18} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-lg sticky top-20" style={{ background: '#0D2E5C' }}>
              {/* Sidebar header */}
              <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Navigation</p>
              </div>
              <nav className="p-2 space-y-0.5">
                {sections.map((section, idx) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  // Separators between groups
                  const showSep = idx === 1 || idx === 7 || idx === 9 || idx === 11;
                  return (
                    <React.Fragment key={section.id}>
                      {showSep && <div className="my-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                        style={isActive
                          ? { background: '#D4AF37', color: '#0D2E5C' }
                          : { color: 'rgba(255,255,255,0.65)' }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
                        data-testid={`nav-${section.id}`}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span className="font-medium text-sm">{section.label}</span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>

              {/* Sidebar footer */}
              <div className="p-4 mt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>v2.0 · Aide Numérique 37</p>
              </div>
            </div>
          </div>

          {/* ── Content Area ── */}
          <div className="lg:col-span-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-french-blue" size={32} />
              </div>
            )}

            {/* DASHBOARD SECTION */}
            {!loading && activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Tableau de bord</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de votre site</p>
                  </div>
                  <Button onClick={loadDashboardStats} variant="outline" size="sm" disabled={dashboardLoading} className="gap-1.5">
                    <RefreshCw size={14} className={dashboardLoading ? 'animate-spin' : ''} />Actualiser
                  </Button>
                </div>

                {dashboardLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="animate-spin text-french-blue" size={32} />
                  </div>
                ) : dashboardStats ? (
                  <>
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Articles internes', value: (dashboardStats.articles.wordpress ?? 0) + (dashboardStats.articles.ai_published ?? 0), icon: BookOpen, color: '#0D2E5C', bg: '#EBF2FB' },
                        { label: 'Articles IA publiés', value: dashboardStats.articles.ai_published, icon: Sparkles, color: '#059669', bg: '#ECFDF5' },
                        { label: 'Articles planifiés', value: dashboardStats.articles.ai_scheduled, icon: FileText, color: '#D97706', bg: '#FFFBEB' },
                        { label: 'En file d\'attente', value: dashboardStats.planning.pending, icon: Zap, color: '#7C3AED', bg: '#F5F3FF' },
                      ].map((stat) => (
                        <Card key={stat.label} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-medium text-gray-500 leading-tight">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value ?? '—'}</p>
                              </div>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Secondary stats row */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Services', value: dashboardStats.services, icon: Settings, nav: 'services' },
                        { label: 'Partenaires', value: dashboardStats.partners, icon: Users, nav: 'partners' },
                        { label: 'Pages villes', value: dashboardStats.cities, icon: MapPin, nav: 'cities' },
                      ].map((s) => (
                        <Card key={s.label} className="border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection(s.nav)}>
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <s.icon size={18} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">{s.label}</p>
                              <p className="text-xl font-bold text-gray-800">{s.value ?? '—'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Next scheduled article */}
                    {dashboardStats.next_article && (
                      <Card className="border border-amber-200 bg-amber-50/50 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Zap size={20} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Prochain article planifié</p>
                            <p className="font-semibold text-gray-800 truncate mt-0.5">{dashboardStats.next_article.subject}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(dashboardStats.next_article.scheduled_at).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setActiveSection('generator')} className="flex-shrink-0 text-xs">
                            Voir le planning
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent AI articles */}
                    {dashboardStats.recent_ai?.length > 0 && (
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-purple-500" />Derniers articles IA</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setActiveSection('articles')} className="text-xs gap-1 text-french-blue">
                              Tous les articles <ExternalLink size={12} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {dashboardStats.recent_ai.map((a) => (
                              <div key={a.slug} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {a.image_url ? <img src={a.image_url.startsWith('/api') ? `${BACKEND_URL}${a.image_url}` : a.image_url} alt="" className="w-full h-full object-cover" /> : <Sparkles size={14} className="m-auto mt-1.5 text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                                  <p className="text-xs text-gray-400 truncate">{a.category} · {new Date(a.date_published).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <SeoBadge article={a} />
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {a.status === 'published' ? 'Publié' : 'Planifié'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick actions */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Actions rapides</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Créer un article IA', icon: Sparkles, nav: 'generator', color: 'bg-purple-600 hover:bg-purple-700' },
                            { label: 'Voir les articles', icon: BookOpen, nav: 'articles', color: 'bg-french-blue hover:bg-french-blue/90' },
                            { label: 'Dashboard SEO', icon: BarChart2, nav: 'seo', color: 'bg-green-600 hover:bg-green-700' },
                            { label: 'Médiathèque', icon: ImageIcon, nav: 'media', color: 'bg-gray-600 hover:bg-gray-700' },
                          ].map((a) => (
                            <button key={a.nav} onClick={() => setActiveSection(a.nav)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white text-xs font-semibold transition-colors ${a.color}`}>
                              <a.icon size={20} />
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <LayoutDashboard size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Impossible de charger les statistiques</p>
                  </div>
                )}
              </div>
            )}

            {/* CONTENT SECTION */}
            {!loading && activeSection === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Modifier les textes</h2>
                  <Button onClick={saveContent} className="bg-french-blue hover:bg-french-blue/90">
                    <Save size={16} className="mr-2" />
                    Enregistrer tout
                  </Button>
                </div>

                {/* Hero Section */}
                <Card>
                  <CardHeader><CardTitle>Section Accueil (Hero)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre ligne 1</label>
                        <Input value={content.hero?.title || ''} onChange={(e) => handleContentChange('hero', 'title', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre surligné</label>
                        <Input value={content.hero?.title_highlight || ''} onChange={(e) => handleContentChange('hero', 'title_highlight', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre ligne 3</label>
                        <Input value={content.hero?.title_suffix || ''} onChange={(e) => handleContentChange('hero', 'title_suffix', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <Textarea value={content.hero?.subtitle || ''} onChange={(e) => handleContentChange('hero', 'subtitle', e.target.value)} rows={2} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <label className="block text-sm font-medium mb-1">Police du titre</label>
                        <select
                          value={content.hero?.font_family || 'Montserrat'}
                          onChange={(e) => handleContentChange('hero', 'font_family', e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          data-testid="hero-font-family-select"
                        >
                          <option value="Montserrat">Montserrat (par défaut)</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Roboto Slab">Roboto Slab</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Taille du titre</label>
                        <select
                          value={content.hero?.font_size || 'normal'}
                          onChange={(e) => handleContentChange('hero', 'font_size', e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          data-testid="hero-font-size-select"
                        >
                          <option value="small">Petit</option>
                          <option value="normal">Normal (par défaut)</option>
                          <option value="large">Grand</option>
                          <option value="xlarge">Très grand</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Taille ligne 3 (sous-titre)</label>
                        <select
                          value={content.hero?.font_size_suffix || 'small'}
                          onChange={(e) => handleContentChange('hero', 'font_size_suffix', e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          data-testid="hero-font-size-suffix-select"
                        >
                          <option value="small">Petit</option>
                          <option value="normal">Normal</option>
                          <option value="large">Grand</option>
                          <option value="xlarge">Très grand</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 p-3 bg-white rounded border">
                        <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
                        <p
                          className="text-2xl font-bold text-gray-900"
                          style={{ fontFamily: `'${content.hero?.font_family || 'Montserrat'}', sans-serif` }}
                        >
                          {content.hero?.title || 'Votre Titre'}{' '}
                          <span className="text-french-blue">{content.hero?.title_highlight || 'Surligné'}</span>
                        </p>
                        <p className="text-lg text-gray-500 mt-1" style={{ fontFamily: `'${content.hero?.font_family || 'Montserrat'}', sans-serif` }}>
                          {content.hero?.title_suffix || 'Ligne 3'}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <ImageInputField
                        label="Image Hero (illustration à droite du titre)"
                        value={content.hero?.image_url || ''}
                        onChange={(val) => handleContentChange('hero', 'image_url', val)}
                        altValue={content.hero?.image_alt || ''}
                        onAltChange={(val) => handleContentChange('hero', 'image_alt', val)}
                        testId="hero-image-url"
                        context="hero"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <ImageInputField
                        label="Photo — Page À Propos (portrait en haut)"
                        value={content.about?.photo_url || ''}
                        onChange={(val) => handleContentChange('about', 'photo_url', val)}
                        altValue={content.about?.photo_alt || ''}
                        onAltChange={(val) => handleContentChange('about', 'photo_alt', val)}
                        testId="about-photo-url"
                        context="card"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Services Title */}
                <Card>
                  <CardHeader><CardTitle>Section Services</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <Input value={content.services?.title || ''} onChange={(e) => handleContentChange('services', 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <Textarea value={content.services?.subtitle || ''} onChange={(e) => handleContentChange('services', 'subtitle', e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader><CardTitle>Section Contact</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <Input value={content.contact?.title || ''} onChange={(e) => handleContentChange('contact', 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sous-titre</label>
                      <Textarea value={content.contact?.subtitle || ''} onChange={(e) => handleContentChange('contact', 'subtitle', e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                {/* Google Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Google Analytics</span>
                      <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">RGPD</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Renseignez votre identifiant de suivi Google Analytics (ex. <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">G-XXXXXXXXXX</code>).
                      Le script ne sera chargé qu'après consentement explicite du visiteur (bandeau RGPD).
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-1">Identifiant de suivi (Measurement ID)</label>
                      <Input
                        value={content.ga_tracking_id || ''}
                        onChange={(e) => setContent(prev => ({ ...prev, ga_tracking_id: e.target.value }))}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    {content.ga_tracking_id && (
                      <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                        <CheckCircle size={13} />
                        Identifiant configuré — GA sera activé après consentement du visiteur.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* LAYOUT SECTION */}
            {!loading && activeSection === 'layout' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Ordre des sections de la page d'accueil</h2>
                  <Button onClick={() => saveContent()} className="bg-french-blue hover:bg-french-blue/90">
                    <Save size={16} className="mr-2" /> Enregistrer l'ordre
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Réorganisez les sections de votre page d'accueil. Le Hero reste toujours en première position.</p>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-french-blue/10 border border-french-blue/20 rounded-lg">
                        <GripVertical size={16} className="text-french-blue/40" />
                        <span className="font-semibold text-french-blue text-sm flex-1">Hero (toujours en premier)</span>
                        <span className="text-xs text-french-blue/60 px-2 py-0.5 bg-french-blue/10 rounded">Fixe</span>
                      </div>
                      {(content.section_order || ['reviews', 'services', 'howItWorks', 'urssafInfo', 'press', 'contact', 'partners']).map((sectionId, idx) => {
                        const SECTION_LABELS = {
                          reviews: 'Avis Clients',
                          services: 'Services',
                          howItWorks: 'Comment ça marche',
                          urssafInfo: 'Avantages Fiscaux (URSSAF)',
                          press: 'On parle de moi',
                          contact: 'Contact',
                          partners: 'Partenaires',
                        };
                        const order = content.section_order || ['reviews', 'services', 'howItWorks', 'urssafInfo', 'press', 'contact', 'partners'];
                        const moveSection = (fromIdx, toIdx) => {
                          if (toIdx < 0 || toIdx >= order.length) return;
                          const newOrder = [...order];
                          const [moved] = newOrder.splice(fromIdx, 1);
                          newOrder.splice(toIdx, 0, moved);
                          setContent({ ...content, section_order: newOrder });
                        };
                        return (
                          <div key={sectionId} className="flex items-center gap-3 px-4 py-3 bg-white border rounded-lg hover:shadow-sm transition-shadow" data-testid={`section-order-${sectionId}`}>
                            <GripVertical size={16} className="text-gray-300" />
                            <span className="font-medium text-sm flex-1 text-gray-800">{SECTION_LABELS[sectionId] || sectionId}</span>
                            <span className="text-xs text-gray-400 mr-2">#{idx + 2}</span>
                            <button onClick={() => moveSection(idx, idx - 1)} disabled={idx === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" data-testid={`section-up-${sectionId}`}>
                              <ArrowUp size={14} className="text-gray-600" />
                            </button>
                            <button onClick={() => moveSection(idx, idx + 1)} disabled={idx === order.length - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" data-testid={`section-down-${sectionId}`}>
                              <ArrowDown size={14} className="text-gray-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SERVICES SECTION */}
            {!loading && activeSection === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Gérer les services ({services.length})</h2>
                  <Button onClick={() => setEditingService({ id: 'new-' + Date.now(), title: '', description: '', icon: 'monitor', is_new: false, order: services.length + 1, detailed_description: '', features: [], slug: '', image_card: '', image_hero: '', image_context: '' })} className="bg-french-blue hover:bg-french-blue/90">
                    <Plus size={16} className="mr-2" />
                    Ajouter un service
                  </Button>
                </div>

                {/* Edit Modal */}
                {editingService && (
                  <Card className="border-2 border-french-blue">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{editingService.id?.startsWith('new-') ? 'Nouveau service' : 'Modifier le service'}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingService(null)}><X size={20} /></Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre du service</label>
                        <Input value={editingService.title} onChange={(e) => setEditingService({...editingService, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description courte (carte)</label>
                        <Textarea value={editingService.description} onChange={(e) => setEditingService({...editingService, description: e.target.value})} rows={3} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description detaillee (page service)</label>
                        <Textarea 
                          value={editingService.detailed_description || ''} 
                          onChange={(e) => setEditingService({...editingService, detailed_description: e.target.value})} 
                          rows={5}
                          placeholder="Description complete affichee sur la page dediee du service..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Points cles (un par ligne)</label>
                        <Textarea 
                          value={(editingService.features || []).join('\n')} 
                          onChange={(e) => setEditingService({...editingService, features: e.target.value.split('\n').filter(f => f.trim())})} 
                          rows={4}
                          placeholder="Diagnostic complet&#10;Resolution de pannes&#10;Nettoyage systeme..."
                        />
                      </div>
                      {/* Images */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold text-sm text-gray-700">Images du service</h4>
                        <p className="text-xs text-gray-500">Uploadez une image ou collez une URL. Le texte alt est utilisé pour le référencement (SEO).</p>
                        <ImageInputField
                          label="Image carte (page d'accueil)"
                          value={editingService.image_card || ''}
                          onChange={(val) => setEditingService({...editingService, image_card: val})}
                          altValue={editingService.image_alt_card || ''}
                          onAltChange={(val) => setEditingService({...editingService, image_alt_card: val})}
                          testId="service-image-card-input"
                          context="card"
                        />
                        <ImageInputField
                          label="Image titre (page individuelle - hero)"
                          value={editingService.image_hero || ''}
                          onChange={(val) => setEditingService({...editingService, image_hero: val})}
                          altValue={editingService.image_alt_hero || ''}
                          onAltChange={(val) => setEditingService({...editingService, image_alt_hero: val})}
                          testId="service-image-hero-input"
                          context="hero"
                        />
                        <ImageInputField
                          label="Image contenu (page individuelle - corps)"
                          value={editingService.image_context || ''}
                          onChange={(val) => setEditingService({...editingService, image_context: val})}
                          altValue={editingService.image_alt_context || ''}
                          onAltChange={(val) => setEditingService({...editingService, image_alt_context: val})}
                          testId="service-image-context-input"
                          context="content"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Icône</label>
                          <select 
                            value={editingService.icon} 
                            onChange={(e) => setEditingService({...editingService, icon: e.target.value})}
                            className="w-full border rounded-md px-3 py-2"
                          >
                            {ICON_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox" 
                            checked={editingService.is_new} 
                            onChange={(e) => setEditingService({...editingService, is_new: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">Afficher badge "Nouveau"</label>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={() => saveService(editingService)} className="bg-french-blue hover:bg-french-blue/90">
                          <Save size={16} className="mr-2" />
                          Enregistrer
                        </Button>
                        <Button variant="outline" onClick={() => setEditingService(null)}>Annuler</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Services List */}
                <div className="space-y-3">
                  {services.map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-gray-400"><GripVertical size={20} /></div>
                          <div className="w-10 h-10 bg-french-blue/10 rounded-lg flex items-center justify-center">
                            <Globe className="text-french-blue" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {service.title}
                              {service.is_new && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                            {service.slug && (
                              <a href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-french-blue hover:underline">
                                /services/{service.slug}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingService(service)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteService(service.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CITIES SECTION */}
            {!loading && activeSection === 'cities' && (
              <CitiesSection ctx={{
                cities, primaryCitiesList, secondaryCitiesList,
                cityPages, editingCityPage, setEditingCityPage,
                citiesSubTab, setCitiesSubTab,
                newCity, setNewCity,
                addCity, deleteCity, toggleCityPrimary,
                saveCityPage, deleteCityPage, generateCityImage, cityPageGenerating,
                content, setContent, saveContent,
              }} />
            )}

            {/* PORTFOLIO SECTION */}
            {!loading && activeSection === 'portfolio' && (
              <PortfolioSection ctx={{
                projects: portfolioProjects,
                editingProject, setEditingProject,
                saveProject, deleteProject,
              }} />
            )}

            {/* PARTNERS SECTION */}
            {!loading && activeSection === 'partners' && (
              <PartnersSection ctx={{
                partners, editingPartner, setEditingPartner,
                partnerCategories, newPartnerCategory, setNewPartnerCategory,
                savePartner, deletePartner,
                addSocialLink, updateSocialLink, removeSocialLink,
                addPartnerCategory, deletePartnerCategory,
              }} />
            )}

            {/* ARTICLES SECTION */}
            {!loading && activeSection === 'articles' && (
              <ArticlesSection ctx={{
                articles, filteredArticles,
                articleFilter, setArticleFilter, articleSort, setArticleSort, articleSearch, setArticleSearch,
                editingArticle, setEditingArticle,
                articleSaving, saveArticle, deleteArticle,
                regenerateArticle, regeneratingArticle,
                generateArticleImage, generatingImage,
                generateArticleMeta, generatingMeta,
                backfilling, backfillResult, runBackfillSeo,
                updatingYears, yearUpdateResult, updateArticleYears,
                fixingLinks, fixLinksResult, fixBrokenLinks,
                fixingPlanningLinks, fixPlanningLinksResult, fixPlanningLinks,
                sitemapRegen, sitemapResult, runSitemapRegen,
                autoEnrichRun, autoEnrichLaunching, launchAutoEnrich, cancelAutoEnrich,
                importingCsv, importResult, importCsv, csvInputRef,
                setPreviewArticle, loadAllData,
              }} />
            )}

            {/* MEDIA SECTION */}
            {!loading && activeSection === 'media' && (
              <MediaLibrary />
            )}

            {/* GENERATOR SECTION */}
            {!loading && activeSection === 'generator' && (
              <ArticleGenerator
                setPreviewArticle={setPreviewArticle}
                setActiveSection={setActiveSection}
                setEditingArticle={setEditingArticle}
              />
            )}

            {/* SEO DASHBOARD SECTION */}
            {!loading && activeSection === 'seo' && (
              <SeoDashboard />
            )}

            {/* LEGAL PAGES SECTION */}
            {!loading && activeSection === 'legal' && (
              <LegalPagesSection showStatus={showStatus} />
            )}
          </div>
        </div>
      </div>

      {/* Article Preview overlay */}
      {previewArticle && (
        <ArticlePreview
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          onSave={(updated) => {
            setArticles(prev => prev.map(a => a.slug === updated.slug ? { ...a, ...updated } : a));
            if (editingArticle?._originalSlug === updated.slug) {
              setEditingArticle(prev => ({ ...prev, ...updated }));
            }
            setPreviewArticle(updated);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
