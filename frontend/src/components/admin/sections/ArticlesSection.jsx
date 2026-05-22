import React from 'react';
import {
  FileText, Edit2, Trash2, X, Save, RefreshCw, Sparkles,
  ExternalLink, CheckCircle, AlertCircle, BarChart2, Globe, Link as LinkIcon, Eye, Wand2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { SeoBadge, computeSeoScore } from '../SeoBadge';
import RichEditor from '../RichEditor';
import VideoUploader from '../VideoUploader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ArticlesSection = ({ ctx }) => {
  const {
    articles, filteredArticles,
    articleFilter, setArticleFilter, articleSearch, setArticleSearch,
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
    articleSort, setArticleSort,
    setPreviewArticle, loadAllData,
  } = ctx;

  // ─── ARTICLE LIST VIEW ───
  if (!editingArticle) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold">Articles ({articles.length})</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={loadAllData} variant="outline" size="sm">
              <RefreshCw size={14} className="mr-1.5" />Rafraîchir
            </Button>
            <Button onClick={runBackfillSeo} disabled={backfilling} variant="outline" size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50 gap-1.5" data-testid="backfill-seo-btn"
              title="Remplir les champs SEO des articles qui n'en ont pas">
              {backfilling ? <RefreshCw size={13} className="animate-spin" /> : <BarChart2 size={13} />}
              Compléter SEO
            </Button>
            <Button onClick={updateArticleYears} disabled={updatingYears} variant="outline" size="sm"
              className="border-amber-200 text-amber-700 hover:bg-amber-50 gap-1.5" data-testid="update-years-btn">
              {updatingYears ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Années → 2026
            </Button>
            <Button onClick={fixBrokenLinks} disabled={fixingLinks} variant="outline" size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5" data-testid="fix-broken-links-btn">
              {fixingLinks ? <RefreshCw size={13} className="animate-spin" /> : <LinkIcon size={13} />}
              Réparer les liens
            </Button>
            <Button onClick={fixPlanningLinks} disabled={fixingPlanningLinks} variant="outline" size="sm"
              className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-1.5" data-testid="fix-planning-links-btn">
              {fixingPlanningLinks ? <RefreshCw size={13} className="animate-spin" /> : <LinkIcon size={13} />}
              Réparer planning
            </Button>
            <Button onClick={runSitemapRegen} disabled={sitemapRegen} variant="outline" size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5" data-testid="regen-sitemap-btn">
              {sitemapRegen ? <RefreshCw size={13} className="animate-spin" /> : <Globe size={13} />}
              Regénérer sitemap
            </Button>
            {(() => {
              const emptyCount = articles.filter(a => !a.content || a.content.length < 50).length;
              const running = autoEnrichRun && autoEnrichRun.status === 'running';
              return (
                <Button
                  onClick={() => launchAutoEnrich({ threshold: 3, max_articles: 10, regenerate_images: false })}
                  disabled={autoEnrichLaunching || running}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-1.5"
                  data-testid="auto-enrich-btn"
                  title={`${emptyCount} articles sans contenu — génère contenu + meta pour 10 à la fois`}
                >
                  {(autoEnrichLaunching || running)
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Wand2 size={13} />}
                  Enrichir {emptyCount > 0 ? `(${emptyCount} sans contenu)` : '✓ tout enrichi'}
                </Button>
              );
            })()}
          </div>
        </div>

        {/* Status notifications */}
        {yearUpdateResult && (
          <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${yearUpdateResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {yearUpdateResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{yearUpdateResult.message}</span>
          </div>
        )}
        {backfillResult && (
          <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${backfillResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {backfillResult.error ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            <span>{backfillResult.error || backfillResult.message}</span>
          </div>
        )}
        {sitemapResult && (
          <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${sitemapResult.success ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {sitemapResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{sitemapResult.error || sitemapResult.message}</span>
            {sitemapResult.success && <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600 text-xs">Voir sitemap.xml</a>}
          </div>
        )}
        {fixLinksResult && (
          <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${fixLinksResult.success ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {fixLinksResult.success ? <CheckCircle size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
            <div>
              <p className="font-medium">{fixLinksResult.message}</p>
              {fixLinksResult.data && <p className="text-xs mt-1 opacity-75">{fixLinksResult.data.articles_scanned} articles scannés · {fixLinksResult.data.articles_updated} mis à jour</p>}
            </div>
          </div>
        )}
        {fixPlanningLinksResult && (
          <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${fixPlanningLinksResult.success ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {fixPlanningLinksResult.success ? <CheckCircle size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
            <div>
              <p className="font-medium">{fixPlanningLinksResult.message}</p>
              {fixPlanningLinksResult.data && <p className="text-xs mt-1 opacity-75">{fixPlanningLinksResult.data.total_items_processed} entrées de planning traitées</p>}
            </div>
          </div>
        )}

        {/* Auto-enrich progress card */}
        {autoEnrichRun && (
          <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4" data-testid="auto-enrich-status">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Wand2 size={16} className="text-purple-600" />
                <p className="text-sm font-semibold text-purple-900">
                  Enrichissement SEO automatique
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  autoEnrichRun.status === 'done' ? 'bg-green-100 text-green-700'
                  : autoEnrichRun.status === 'running' ? 'bg-amber-100 text-amber-700'
                  : autoEnrichRun.status === 'cancelled' ? 'bg-red-100 text-red-600'
                  : typeof autoEnrichRun.status === 'string' && autoEnrichRun.status.startsWith('error') ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {autoEnrichRun.status === 'done' ? 'Terminé'
                   : autoEnrichRun.status === 'running' ? 'En cours...'
                   : autoEnrichRun.status === 'cancelled' ? 'Annulé'
                   : autoEnrichRun.status === 'queued' ? 'En file'
                   : autoEnrichRun.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-purple-700">
                  {autoEnrichRun.processed || 0} / {autoEnrichRun.total || 0}
                </span>
                {autoEnrichRun.status === 'running' && (
                  <button
                    onClick={cancelAutoEnrich}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-1"
                    title="Arrêter l'enrichissement"
                  >
                    <X size={10} /> Arrêter
                  </button>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-white rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${autoEnrichRun.total ? (autoEnrichRun.processed / autoEnrichRun.total * 100) : 0}%` }}
              />
            </div>
            {/* Recent items */}
            {Array.isArray(autoEnrichRun.report) && autoEnrichRun.report.length > 0 && (
              <div className="max-h-40 overflow-y-auto text-xs space-y-1 mt-2 pr-1">
                {autoEnrichRun.report.slice(-8).reverse().map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/60 rounded px-2 py-1">
                    {r.error
                      ? <AlertCircle size={11} className="text-red-500 shrink-0" />
                      : <CheckCircle size={11} className="text-green-500 shrink-0" />}
                    <span className="truncate flex-1 text-gray-700">{r.title}</span>
                    <span className="text-[10px] text-purple-600 font-medium">
                      {r.error ? 'Erreur' : (r.actions || []).join(', ') || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-purple-600 mt-2 italic">
              {autoEnrichRun.status === 'running'
                ? 'Les articles sont traités en arrière-plan par Claude. Vous pouvez fermer cette fenêtre.'
                : autoEnrichRun.status === 'done'
                ? 'Terminé ! Vous pouvez relancer un nouveau batch pour continuer si besoin.'
                : autoEnrichRun.status === 'cancelled'
                ? 'Enrichissement arrêté. Vous pouvez relancer un nouveau batch.'
                : ''}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
            {[
              ['all',        'Tous'],
              ['no-content', '⚠ Sans contenu'],
              ['low-seo',    '📉 SEO faible'],
              ['ai',         '✦ IA générés'],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setArticleFilter(val)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  articleFilter === val ? 'bg-white shadow text-french-blue' : 'text-gray-500 hover:text-gray-700'
                }`}
              >{label}</button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
            {[
              ['date',    '📅 Date'],
              ['seo-asc', '📊 SEO ↑'],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setArticleSort(val)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  articleSort === val ? 'bg-white shadow text-french-blue' : 'text-gray-500 hover:text-gray-700'
                }`}
              >{label}</button>
            ))}
          </div>

          <input value={articleSearch} onChange={e => setArticleSearch(e.target.value)}
            placeholder="Rechercher..." className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px] max-w-xs" data-testid="article-search-input" />
          <span className="text-xs text-gray-400 flex-shrink-0">{filteredArticles.length} résultat(s)</span>
        </div>

        {/* Article list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredArticles.map((article, idx) => (
            <div key={article.slug || idx} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors" data-testid={`article-item-${article.slug}`}>
              <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {(article.image_url || article.featured_image)
                  ? <img src={article.image_url?.startsWith('/api') ? `${BACKEND_URL}${article.image_url}` : (article.image_url || article.featured_image)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full flex items-center justify-center"><FileText size={16} className="text-gray-400" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{article.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{new Date(article.date_published || article.date).toLocaleDateString('fr-FR')}</span>
                  {article.category && <span className="text-xs bg-french-blue/10 text-french-blue px-1.5 py-0.5 rounded-full">{article.category}</span>}
                  {article.source === 'ai_generated' && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={9} />IA</span>}
                  {article.status === 'scheduled' && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Planifié</span>}
                  {(!article.content || article.content.length < 100) && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Sans contenu</span>}
                  <SeoBadge article={article} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a href={`/articles/${article.slug}`} target="_blank" rel="noreferrer"
                  className="p-1.5 text-gray-400 hover:text-french-blue rounded-md hover:bg-white transition-colors" title="Voir"><ExternalLink size={14} /></a>
                <button onClick={() => regenerateArticle(article.slug)} disabled={regeneratingArticle === article.slug}
                  className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-colors disabled:opacity-50" title="Retravail SEO"
                  data-testid={`regenerate-article-${article.slug}`}>
                  {regeneratingArticle === article.slug ? <RefreshCw size={14} className="animate-spin text-purple-500" /> : <Sparkles size={14} />}
                </button>
                <Button variant="outline" size="sm" onClick={() => setEditingArticle({ ...article, _originalSlug: article.slug })} data-testid={`edit-article-${article.slug}`}>
                  <Edit2 size={13} className="mr-1" />Éditer
                </Button>
                <button onClick={() => deleteArticle(article.slug)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" title="Supprimer" data-testid={`delete-article-${article.slug}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── ARTICLE EDIT FORM ───
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><Edit2 size={18} />Éditer l'article</h2>
        <button onClick={() => setEditingArticle(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <Input value={editingArticle.title || ''} onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value }))} data-testid="edit-article-title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug URL</label>
              <Input value={editingArticle.slug || ''} onChange={e => setEditingArticle(p => ({ ...p, slug: e.target.value }))} data-testid="edit-article-slug" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <Input value={editingArticle.category || ''} onChange={e => setEditingArticle(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select value={editingArticle.status || 'published'} onChange={e => setEditingArticle(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" data-testid="edit-article-status">
                <option value="published">Publié</option>
                <option value="scheduled">Planifié (non visible)</option>
                <option value="draft">Brouillon (non visible)</option>
              </select>
            </div>
          </div>

          {/* SEO fields */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <p className="text-xs font-semibold text-french-blue uppercase tracking-wide flex items-center gap-1.5"><BarChart2 size={13} /> Champs SEO</p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Titre SEO (balise &lt;title&gt;)
                <span className={`ml-2 text-xs ${(editingArticle.meta_title || '').length > 60 ? 'text-red-500' : (editingArticle.meta_title || '').length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  {(editingArticle.meta_title || '').length}/60
                </span>
              </label>
              <Input value={editingArticle.meta_title || ''} onChange={e => setEditingArticle(p => ({ ...p, meta_title: e.target.value }))} placeholder="Titre SEO optimisé (50-60 caractères idéal)" data-testid="edit-article-meta-title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Méta-description
                <span className={`ml-2 text-xs ${(editingArticle.meta_description || '').length > 160 ? 'text-red-500' : (editingArticle.meta_description || '').length >= 140 ? 'text-green-600' : 'text-gray-400'}`}>
                  {(editingArticle.meta_description || '').length}/160
                </span>
              </label>
              <div className="flex gap-2 mb-1.5">
                <Button size="sm" variant="outline" onClick={() => generateArticleMeta(editingArticle._originalSlug)} disabled={generatingMeta === editingArticle._originalSlug}
                  className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-7 px-2" data-testid="generate-meta-btn">
                  {generatingMeta === editingArticle._originalSlug ? <><RefreshCw size={11} className="animate-spin mr-1" />Génération IA...</> : <><Sparkles size={11} className="mr-1" />Générer avec IA</>}
                </Button>
              </div>
              <Textarea value={editingArticle.meta_description || ''} onChange={e => setEditingArticle(p => ({ ...p, meta_description: e.target.value }))} rows={2} placeholder="Méta-description (140-160 caractères idéal)" data-testid="edit-article-meta-desc" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <p className="text-xs text-gray-500 flex-1">Score actuel :</p>
              <SeoBadge article={editingArticle} />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Image principale</label>
            <div className="space-y-2">
              {editingArticle.image_url && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={editingArticle.image_url.startsWith('/api') ? `${BACKEND_URL}${editingArticle.image_url}` : editingArticle.image_url} alt="Aperçu" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => generateArticleImage(editingArticle._originalSlug)} disabled={generatingImage === editingArticle._originalSlug}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 h-8" data-testid="generate-image-btn">
                {generatingImage === editingArticle._originalSlug
                  ? <><RefreshCw size={13} className="animate-spin mr-2" />Génération en cours (~20s)...</>
                  : editingArticle.image_url
                    ? <><RefreshCw size={13} className="mr-2" />Régénérer l'image IA</>
                    : <><Sparkles size={13} className="mr-2" />Générer une image IA</>}
              </Button>
              <Input value={editingArticle.image_url || ''} onChange={e => setEditingArticle(p => ({ ...p, image_url: e.target.value }))} placeholder="Ou coller une URL : https://... ou /api/uploads/..." data-testid="article-image-url-input" />
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/30 p-4">
            <VideoUploader videoUrl={editingArticle.video_url || ''} onVideoChange={url => setEditingArticle(p => ({ ...p, video_url: url }))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Extrait / Méta-description
              <span className={`ml-2 text-xs ${(editingArticle.excerpt || '').length > 155 ? 'text-red-500' : 'text-gray-400'}`}>{(editingArticle.excerpt || '').length}/155</span>
            </label>
            <Textarea value={editingArticle.excerpt || ''} onChange={e => setEditingArticle(p => ({ ...p, excerpt: e.target.value }))} rows={2} data-testid="edit-article-excerpt" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              Contenu de l'article
              {(!editingArticle.content || editingArticle.content.length < 100) && <span className="text-red-500 text-xs font-normal">— vide !</span>}
            </label>
            <RichEditor articleKey={editingArticle._originalSlug} value={editingArticle.content || ''} onChange={(html) => setEditingArticle(p => ({ ...p, content: html }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={saveArticle} disabled={articleSaving} className="bg-french-blue hover:bg-french-blue/90 flex-1" data-testid="save-article-btn">
          {articleSaving ? <><RefreshCw size={16} className="animate-spin mr-2" />Sauvegarde...</> : <><Save size={16} className="mr-2" />Enregistrer</>}
        </Button>
        <Button variant="outline" onClick={() => regenerateArticle(editingArticle._originalSlug)} disabled={regeneratingArticle === editingArticle._originalSlug}
          className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50" data-testid="regenerate-article-form-btn">
          {regeneratingArticle === editingArticle._originalSlug ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Retravail SEO
        </Button>
        <Button variant="outline" onClick={() => setPreviewArticle(editingArticle)} className="gap-2 border-green-200 text-green-700 hover:bg-green-50" data-testid="preview-article-btn">
          <Eye size={16} />Prévisualiser
        </Button>
        <Button variant="outline" onClick={() => setEditingArticle(null)}>Annuler</Button>
        <Button variant="outline" onClick={() => { deleteArticle(editingArticle._originalSlug); setEditingArticle(null); }} className="text-red-500 hover:text-red-700 hover:border-red-300">
          <Trash2 size={16} className="mr-1.5" />Supprimer
        </Button>
      </div>
    </div>
  );
};

export default ArticlesSection;
