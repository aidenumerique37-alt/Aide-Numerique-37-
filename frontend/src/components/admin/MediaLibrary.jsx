import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Sparkles, RefreshCw, X,
  CheckCircle, Trash2, Edit2, Link as LinkIcon, Video, Tag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';
import AIGeneratorModal from './AIGeneratorModal';

const CATEGORIES = ['Toutes', 'Articles IA', 'Services', 'Landing Page', 'Partenaires', 'Villes', 'Vidéos', 'Général'];
const CAT_COLORS = {
  'Articles IA': 'bg-purple-100 text-purple-700',
  'Services': 'bg-blue-100 text-blue-700',
  'Landing Page': 'bg-green-100 text-green-700',
  'Partenaires': 'bg-orange-100 text-orange-700',
  'Villes': 'bg-teal-100 text-teal-700',
  'Vidéos': 'bg-red-100 text-red-700',
  'Général': 'bg-gray-100 text-gray-600',
};

const MediaLibrary = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelValue, setLabelValue] = useState('');
  const [filter, setFilter] = useState('Toutes');
  const [uploadCategory, setUploadCategory] = useState('Général');
  const [backfillingHash, setBackfillingHash] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState(null);
  const fileInputRef = useRef(null);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/upload/gallery`, {
        headers: getAuthHeaders()
      });
      setImages(res.data);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadImages(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(
        `${BACKEND_URL}/api/upload?context=default&category=${encodeURIComponent(uploadCategory)}`,
        formData,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      loadImages();
    } catch (err) {
      alert('Erreur upload : ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyUrl = (url) => {
    const full = `${BACKEND_URL}${url}`;
    navigator.clipboard.writeText(full).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteImage = async (img) => {
    if (!window.confirm(`Supprimer "${img.label || img.filename}" ?`)) return;
    setDeleting(img.filename);
    try {
      await axios.delete(`${BACKEND_URL}/api/uploads/${img.filename}`, {
        headers: getAuthHeaders()
      });
      loadImages();
    } catch (err) {
      alert('Erreur suppression : ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeleting(null);
    }
  };

  const saveLabel = async (img) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/upload/gallery/${img.filename}/label`,
        { label: labelValue },
        { headers: getAuthHeaders() }
      );
      setEditingLabel(null);
      loadImages();
    } catch (error) {
      console.error('Failed to save label:', error);
    }
  };

  const runBackfillHash = async () => {
    setBackfillingHash(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/media/backfill-hashes`,
        {},
        { headers: getAuthHeaders() }
      );
      setBackfillMsg(res.data.message);
      loadImages();
    } catch (e) {
      setBackfillMsg(e.response?.data?.detail || e.message);
    }
    setBackfillingHash(false);
    setTimeout(() => setBackfillMsg(null), 6000);
  };

  const filteredImages = images.filter(img => {
    if (filter === 'Toutes') return true;
    if (filter === 'Vidéos') return img.context === 'video';
    return img.category === filter;
  });

  const hashGroups = {};
  images.forEach(img => {
    if (img.hash) {
      if (!hashGroups[img.hash]) hashGroups[img.hash] = [];
      hashGroups[img.hash].push(img.filename);
    }
  });
  const duplicateFilenames = new Set(
    Object.values(hashGroups).filter(arr => arr.length > 1).flat()
  );
  const duplicateCount = Object.values(hashGroups)
    .filter(arr => arr.length > 1)
    .reduce((s, arr) => s + arr.length - 1, 0);

  return (
    <div className="space-y-6" data-testid="media-library">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Médiathèque ({images.length} fichiers)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fichiers persistants sauvegardés en base de données.
            {duplicateCount > 0 && (
              <span className="ml-2 text-orange-600 font-medium">{duplicateCount} doublon(s) détecté(s)</span>
            )}
          </p>
        </div>
        <Button
          onClick={runBackfillHash}
          disabled={backfillingHash}
          variant="outline"
          size="sm"
          className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-1.5"
          data-testid="backfill-hash-btn"
        >
          {backfillingHash ? <RefreshCw size={13} className="animate-spin" /> : <ImageIcon size={13} />}
          Analyser doublons
        </Button>
      </div>

      {backfillMsg && (
        <div className="rounded-lg p-3 text-sm flex items-center gap-2 bg-green-50 border border-green-200 text-green-700">
          <CheckCircle size={15} /><span>{backfillMsg}</span>
        </div>
      )}

      {/* Upload row with category selector */}
      <div className="flex gap-2 flex-wrap items-center">
        <Button variant="outline" size="sm" onClick={loadImages} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>

        {/* Category for upload */}
        <select
          value={uploadCategory}
          onChange={e => setUploadCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-french-blue/30 bg-white"
          title="Catégorie pour le prochain upload"
        >
          {CATEGORIES.filter(c => c !== 'Toutes').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleUpload} className="hidden" />
        <Button
          variant="outline"
          onClick={() => setShowAI(true)}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
          data-testid="medialib-ai-btn"
        >
          <Sparkles size={16} className="mr-2 text-purple-500" />Générer avec IA
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-french-blue hover:bg-french-blue/90">
          {uploading ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
          {uploading ? 'Upload...' : 'Ajouter une image'}
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap border-b pb-3">
        {CATEGORIES.map((cat) => {
          const count = cat === 'Toutes' ? images.length
            : cat === 'Vidéos' ? images.filter(i => i.context === 'video').length
            : images.filter(i => i.category === cat).length;
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-french-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              data-testid={`media-filter-${cat}`}
            >
              {cat} {count > 0 && <span className="ml-1 opacity-70 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-french-blue" size={32} />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Aucune image dans cette catégorie</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((img) => (
            <div key={img.id || img.filename} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all" data-testid={`media-item-${img.filename}`}>
              <div className="aspect-square overflow-hidden bg-gray-50 relative">
                {img.context === 'video' ? (
                  <video src={`${BACKEND_URL}${img.url}`} className="w-full h-full object-cover" preload="metadata" muted />
                ) : (
                  <img
                    src={`${BACKEND_URL}${img.url}`}
                    alt={img.label || img.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                )}
                {/* Source badge */}
                {img.source === 'ai_generated' && (
                  <span className="absolute top-1.5 left-1.5 bg-purple-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Sparkles size={8} />IA
                  </span>
                )}
                {img.context === 'video' && (
                  <span className="absolute top-1.5 left-1.5 bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Video size={8} />Vidéo
                  </span>
                )}
                {duplicateFilenames.has(img.filename) && (
                  <span className="absolute top-1.5 right-1.5 bg-orange-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Doublon
                  </span>
                )}
                {img.prompt && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-[10px] text-center line-clamp-4">{img.prompt}</p>
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1">
                {/* Category badge */}
                {img.category && (
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLORS[img.category] || 'bg-gray-100 text-gray-600'}`}>
                    <Tag size={7} />{img.category}
                  </span>
                )}
                {editingLabel === img.filename ? (
                  <div className="flex gap-1">
                    <input
                      value={labelValue}
                      onChange={e => setLabelValue(e.target.value)}
                      className="flex-1 text-xs border rounded px-1 py-0.5"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveLabel(img)}
                    />
                    <button onClick={() => saveLabel(img)} className="text-green-600 hover:text-green-700">
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => setEditingLabel(null)} className="text-gray-400">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group/label">
                    <p className="text-[10px] text-gray-700 truncate flex-1 font-medium" title={img.label || img.filename}>
                      {img.label || img.filename}
                    </p>
                    <button
                      onClick={() => { setEditingLabel(img.filename); setLabelValue(img.label || ''); }}
                      className="opacity-0 group-hover/label:opacity-100 text-gray-400 hover:text-french-blue transition-opacity flex-shrink-0"
                    >
                      <Edit2 size={10} />
                    </button>
                  </div>
                )}
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      copied === img.url ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-french-blue/10 hover:text-french-blue text-gray-600'
                    }`}
                    title="Copier l'URL"
                    data-testid={`media-copy-${img.filename}`}
                  >
                    {copied === img.url ? <CheckCircle size={12} /> : <LinkIcon size={12} />}
                    {copied === img.url ? 'Copié !' : 'URL'}
                  </button>
                  <button
                    onClick={() => deleteImage(img)}
                    disabled={deleting === img.filename}
                    className="px-2 py-1.5 rounded bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                    title="Supprimer"
                    data-testid={`media-delete-${img.filename}`}
                  >
                    {deleting === img.filename ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAI && (
        <AIGeneratorModal
          context="default"
          onClose={() => setShowAI(false)}
          onGenerated={() => { loadImages(); }}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
