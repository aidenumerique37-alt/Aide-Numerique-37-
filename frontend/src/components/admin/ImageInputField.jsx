import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, RefreshCw, X } from 'lucide-react';
import { Input } from '../ui/input';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';
import AIGeneratorModal from './AIGeneratorModal';

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

  const resolvePreview = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const previewUrl = resolvePreview(value);

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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Galerie Médias</h3>
              <button onClick={() => setShowGallery(false)} className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-french-blue" size={24} />
                </div>
              ) : gallery.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune image uploadée</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {gallery.map((img) => (
                    <button
                      key={img.filename}
                      onClick={() => { onChange(img.url); setShowGallery(false); }}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-french-blue transition-all bg-gray-50"
                      title={img.filename}
                    >
                      <img
                        src={`${BACKEND_URL}${img.url}`}
                        alt={img.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold">Utiliser</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
