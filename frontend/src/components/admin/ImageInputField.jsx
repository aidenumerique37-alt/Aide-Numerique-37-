import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, RefreshCw, X, Search } from 'lucide-react';
import { Input } from '../ui/input';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';
import AIGeneratorModal from './AIGeneratorModal';

/** Resolve any URL (Cloudinary absolute or Railway-relative) to a displayable src */
const resolveImgSrc = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
};

const CATEGORIES = ['Toutes', 'Articles IA', 'Services', 'Landing Page', 'Partenaires', 'Villes', 'Général'];

const GalleryModal = ({ gallery, galleryLoading, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Toutes');

  const filtered = gallery.filter(img => {
    const matchCat = filter === 'Toutes' || img.category === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (img.label || '').toLowerCase().includes(q)
      || (img.filename || '').toLowerCase().includes(q)
      || (img.original_name || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Galerie Médias</h3>
            <p className="text-xs text-gray-400 mt-0.5">{gallery.length} fichier{gallery.length !== 1 ? 's' : ''} — cliquez pour sélectionner</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        {/* Search + filter bar */}
        <div className="px-5 py-3 border-b flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-french-blue/30"
              autoFocus
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === cat ? 'bg-french-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {galleryLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-french-blue" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <ImageIcon size={36} />
              <p className="text-sm">{search || filter !== 'Toutes' ? 'Aucun résultat' : 'Aucune image uploadée'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((img) => {
                const name = img.label || img.original_name || img.filename || '';
                const shortName = name.length > 20 ? name.slice(0, 18) + '…' : name;
                const src = resolveImgSrc(img.url);
                return (
                  <button
                    key={img.filename}
                    onClick={() => onSelect(img)}
                    className="group flex flex-col rounded-xl overflow-hidden border-2 border-transparent hover:border-french-blue focus:border-french-blue transition-all bg-gray-50 text-left"
                    title={name}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 relative">
                      <img
                        src={src}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                      {/* Fallback when image fails */}
                      <div style={{display:'none'}} className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <ImageIcon size={24} className="text-gray-300" />
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-french-blue/0 group-hover:bg-french-blue/10 transition-colors flex items-end justify-center pb-1.5">
                        <span className="opacity-0 group-hover:opacity-100 bg-french-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-opacity">
                          Choisir
                        </span>
                      </div>
                    </div>
                    <div className="px-1.5 py-1 min-h-[28px] flex items-center">
                      <span className="text-[10px] text-gray-500 truncate w-full leading-tight">{shortName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ImageInputField = ({ label, value, onChange, altValue, onAltChange, testId, context = "default" }) => {
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/upload?context=${context}`,
        formData,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
      );
      onChange(res.data.url);
    } catch (err) {
      alert('Erreur upload : ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openGallery = async () => {
    setShowGallery(true);
    setGalleryLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/upload/gallery`, {
        headers: getAuthHeaders()
      });
      setGallery(res.data);
    } catch {
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const previewUrl = value ? resolveImgSrc(value) : null;

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemple.com/image.jpg ou uploader →"
          data-testid={testId}
          className="flex-1 text-sm"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors disabled:opacity-60 shrink-0"
          data-testid={testId ? `${testId}-upload-btn` : undefined}
          title="Uploader depuis votre appareil"
        >
          {uploading
            ? <RefreshCw size={15} className="animate-spin text-french-blue" />
            : <Upload size={15} className="text-french-blue" />}
          <span className="hidden sm:inline text-xs">{uploading ? '...' : 'Fichier'}</span>
        </button>
        <button
          type="button"
          onClick={openGallery}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors shrink-0"
          title="Choisir depuis la galerie"
          data-testid={testId ? `${testId}-gallery-btn` : undefined}
        >
          <ImageIcon size={15} className="text-purple-500" />
          <span className="hidden sm:inline text-xs">Galerie</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAI(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-transparent bg-gradient-to-r from-french-blue/90 to-purple-600/90 hover:from-french-blue hover:to-purple-600 text-white text-sm font-medium transition-all shrink-0"
          title="Générer avec l'IA"
          data-testid={testId ? `${testId}-ai-btn` : undefined}
        >
          <Sparkles size={15} />
          <span className="hidden sm:inline text-xs">IA</span>
        </button>
      </div>

      {onAltChange !== undefined && (
        <Input
          value={altValue || ''}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Texte alternatif SEO (description de l'image)..."
          className="text-xs text-gray-500"
          data-testid={testId ? `${testId}-alt` : undefined}
        />
      )}

      {previewUrl && (
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-white rounded border inline-flex items-center gap-2">
            <img src={previewUrl} alt="Aperçu" className="h-14 object-contain rounded" />
            <button
              type="button"
              onClick={() => { onChange(''); if (onAltChange) onAltChange(''); }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Retirer l'image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {showGallery && (
        <GalleryModal
          gallery={gallery}
          galleryLoading={galleryLoading}
          onSelect={(img) => { onChange(img.url); setShowGallery(false); }}
          onClose={() => setShowGallery(false)}
        />
      )}

      {showAI && (
        <AIGeneratorModal
          context={context}
          onClose={() => setShowAI(false)}
          onGenerated={(url) => { onChange(url); }}
        />
      )}
    </div>
  );
};

export default ImageInputField;
