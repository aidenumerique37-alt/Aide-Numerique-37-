import React, { useState, useEffect } from 'react';
import { X, Eye, RefreshCw, CheckCircle, Save, Sparkles, Edit2, BarChart2, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';
import { SeoBadge, computeSeoScore } from './SeoBadge';
import RichEditor from './RichEditor';
import VideoUploader from './VideoUploader';
import { sanitizeHtml } from '../../utils/sanitize';

const ArticlePreview = ({ article, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localArticle, setLocalArticle] = useState(article);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { setLocalArticle(article); }, [article]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/articles/${localArticle.slug}`,
        localArticle,
        { headers: getAuthHeaders() }
      );
      onSave && onSave(localArticle);
      setIsEditing(false);
    } catch (e) {
      alert(e.response?.data?.detail || e.message);
    }
    setSaving(false);
  };

  const regenerate = async () => {
    if (!window.confirm('Régénérer le contenu avec Claude ? Le texte actuel sera remplacé.')) return;
    setRegenerating(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/articles/${localArticle.slug}/regenerate`,
        {},
        { headers: getAuthHeaders(), timeout: 120000 }
      );
      setLocalArticle(res.data.article);
      onSave && onSave(res.data.article);
      setIsEditing(false);
    } catch (e) {
      if (e.code === 'ECONNABORTED' || e.response?.status === 502 || !e.response) {
        alert('La régénération est en cours. Fermez et rouvrez cet article dans quelques instants.');
      } else {
        alert(e.response?.data?.detail || e.message);
      }
    }
    setRegenerating(false);
  };

  if (!localArticle) return null;

  const imgSrc = localArticle.image_url
    ? (localArticle.image_url.startsWith('/api') ? `${BACKEND_URL}${localArticle.image_url}` : localArticle.image_url)
    : null;
  const metaTitle = localArticle.meta_title || localArticle.title || '';
  const metaDesc = localArticle.meta_description || localArticle.excerpt || '';

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-french-blue">Prévisualisation</span>
          <SeoBadge article={localArticle} />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${localArticle.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {localArticle.status === 'published' ? 'Publié' : 'Planifié'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEditing ? 'bg-french-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid="preview-toggle-edit"
          >
            {isEditing ? <Eye size={14} /> : <Edit2 size={14} />}
            {isEditing ? 'Voir' : 'Modifier'}
          </button>
          {isEditing && (
            <>
              <Button
                onClick={save}
                disabled={saving}
                size="sm"
                className="bg-french-blue hover:bg-french-blue/90 gap-1.5"
                data-testid="preview-save-btn"
              >
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                Enregistrer
              </Button>
              <Button
                onClick={regenerate}
                disabled={regenerating}
                size="sm"
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-1.5"
                data-testid="preview-regenerate-btn"
              >
                {regenerating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Régénérer
              </Button>
            </>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" data-testid="close-preview-btn">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {isEditing ? (
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre H1</label>
              <Input
                value={localArticle.title || ''}
                onChange={e => setLocalArticle(p => ({ ...p, title: e.target.value }))}
                data-testid="preview-edit-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug URL</label>
              <Input
                value={localArticle.slug || ''}
                onChange={e => setLocalArticle(p => ({ ...p, slug: e.target.value }))}
                data-testid="preview-edit-slug"
              />
            </div>
          </div>

          {/* SEO fields */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <p className="text-xs font-semibold text-french-blue uppercase tracking-wide flex items-center gap-1.5">
              <BarChart2 size={13} /> Champs SEO
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Titre SEO
                <span className={`ml-2 text-xs ${(localArticle.meta_title || '').length > 60 ? 'text-red-500' : (localArticle.meta_title || '').length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  {(localArticle.meta_title || '').length}/60
                </span>
              </label>
              <Input
                value={localArticle.meta_title || ''}
                onChange={e => setLocalArticle(p => ({ ...p, meta_title: e.target.value }))}
                placeholder="50-60 caractères idéal"
                data-testid="preview-meta-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Méta-description
                <span className={`ml-2 text-xs ${(localArticle.meta_description || '').length > 160 ? 'text-red-500' : (localArticle.meta_description || '').length >= 140 ? 'text-green-600' : 'text-gray-400'}`}>
                  {(localArticle.meta_description || '').length}/160
                </span>
              </label>
              <Textarea
                value={localArticle.meta_description || ''}
                onChange={e => setLocalArticle(p => ({ ...p, meta_description: e.target.value }))}
                rows={2}
                placeholder="140-160 caractères idéal"
                data-testid="preview-meta-desc"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <p className="text-xs text-gray-500 flex-1">Score actuel :</p>
              <SeoBadge article={localArticle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image principale (URL)</label>
            <Input
              value={localArticle.image_url || ''}
              onChange={e => setLocalArticle(p => ({ ...p, image_url: e.target.value }))}
              placeholder="https://... ou /api/uploads/..."
            />
          </div>

          {/* Video upload */}
          <div className="rounded-xl border border-red-100 bg-red-50/30 p-4">
            <VideoUploader
              videoUrl={localArticle.video_url || ''}
              onVideoChange={url => setLocalArticle(p => ({ ...p, video_url: url }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Extrait
            </label>
            <Textarea
              value={localArticle.excerpt || ''}
              onChange={e => setLocalArticle(p => ({ ...p, excerpt: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contenu de l'article
              {(!localArticle.content_html || localArticle.content_html.length < 100) && (
                <span className="ml-2 text-red-500 text-xs font-normal">— vide !</span>
              )}
            </label>
            <RichEditor
              articleKey={localArticle.slug}
              value={localArticle.content_html || ''}
              onChange={html => setLocalArticle(p => ({ ...p, content_html: html }))}
            />
          </div>
        </div>
      ) : (
        <>
          {/* SEO meta summary bar */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wide">Titre SEO : </span>
                <span className={metaTitle.length > 60 ? 'text-red-600' : metaTitle.length >= 50 ? 'text-green-700 font-medium' : 'text-gray-700'}>
                  {metaTitle || '—'} <span className="text-gray-400">({metaTitle.length}/60)</span>
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wide">Meta description : </span>
                <span className={metaDesc.length > 160 ? 'text-red-600' : metaDesc.length >= 140 ? 'text-green-700' : 'text-gray-500'}>
                  {metaDesc.slice(0, 120)}{metaDesc.length > 120 ? '…' : ''} <span className="text-gray-400">({metaDesc.length}/160)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="flex items-center gap-2 mb-4">
              {localArticle.category && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#EBF2FB', color: '#0D2E5C' }}>
                  {localArticle.category}
                </span>
              )}
              {localArticle.date_published && (
                <span className="text-xs text-gray-400">
                  {new Date(localArticle.date_published).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{localArticle.title}</h1>

            {imgSrc && (
              <img src={imgSrc} alt={localArticle.title} className="w-full rounded-2xl mb-8 object-cover shadow-md" style={{ maxHeight: '400px' }} />
            )}

            {localArticle.excerpt && (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 pl-4" style={{ borderColor: '#D4AF37' }}>
                {localArticle.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg max-w-none text-gray-800"
              style={{ lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(localArticle.content_html || '<p class="text-gray-400 italic">Aucun contenu</p>') }}
            />

            {/* Video section */}
            {localArticle.video_url && (
              <div className="mt-10 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Video size={18} className="text-french-blue" />
                  <p className="font-semibold text-gray-800">Le résumé de votre article en vidéo en 1 minute par mon clone IA</p>
                </div>
                <video
                  src={localArticle.video_url.startsWith('/api') ? `${BACKEND_URL}${localArticle.video_url}` : localArticle.video_url}
                  controls
                  poster={localArticle.image_url || localArticle.featured_image || undefined}
                  className="w-full rounded-xl"
                  preload="metadata"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ArticlePreview;
