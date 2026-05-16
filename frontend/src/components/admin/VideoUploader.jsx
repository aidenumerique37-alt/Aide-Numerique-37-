import React, { useState, useRef } from 'react';
import { Video, Upload, X, RefreshCw, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk

const VideoUploader = ({ videoUrl, onVideoChange }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(videoUrl ? 'url' : 'upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(videoUrl || '');
  const fileRef = useRef(null);

  const uploadChunked = async (file) => {
    setUploading(true);
    setProgress(0);
    const uploadId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      let lastUrl = null;
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);

        const form = new FormData();
        form.append('upload_id', uploadId);
        form.append('chunk_index', String(i));
        form.append('total_chunks', String(totalChunks));
        form.append('original_filename', file.name);
        form.append('category', 'Vidéos');
        form.append('chunk', chunkBlob, `chunk_${i}`);

        const res = await axios.post(
          `${BACKEND_URL}/api/upload/video/chunk`,
          form,
          { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
        );

        setProgress(Math.round(((i + 1) / totalChunks) * 100));

        if (res.data.done) {
          lastUrl = res.data.url;
        }
      }
      if (lastUrl) {
        onVideoChange(lastUrl);
        setUrlInput(lastUrl);
      }
    } catch (e) {
      alert('Erreur upload vidéo : ' + (e.response?.data?.detail || e.message));
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      alert('Format non supporté. Utilisez MP4, WebM ou MOV.');
      return;
    }
    uploadChunked(file);
  };

  const removeVideo = () => {
    onVideoChange('');
    setUrlInput('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const resolvedUrl = videoUrl
    ? (videoUrl.startsWith('/api') ? `${BACKEND_URL}${videoUrl}` : videoUrl)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Vidéo résumé (clone IA)
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('upload')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${mode === 'upload' ? 'bg-french-blue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Fichier
          </button>
          <button
            onClick={() => setMode('url')}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${mode === 'url' ? 'bg-french-blue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://... ou /api/uploads/video_..."
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={() => onVideoChange(urlInput)} className="shrink-0">
            <CheckCircle size={14} />
          </Button>
          {videoUrl && (
            <Button size="sm" variant="outline" onClick={removeVideo} className="shrink-0 text-red-500 border-red-200 hover:bg-red-50">
              <X size={14} />
            </Button>
          )}
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" className="hidden" onChange={handleFileChange} />
          {uploading ? (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <RefreshCw size={14} className="animate-spin" />
                Upload en cours... {progress}%
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-french-blue h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-french-blue rounded-xl p-4 text-center transition-colors group"
            >
              <Video size={24} className="mx-auto mb-2 text-gray-300 group-hover:text-french-blue transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-french-blue">
                Cliquez pour sélectionner une vidéo MP4, WebM ou MOV
              </p>
              <p className="text-xs text-gray-400 mt-1">Upload par morceaux — taille illimitée</p>
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {resolvedUrl && !uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle size={12} /> Vidéo enregistrée
            </p>
            <button onClick={removeVideo} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
              <X size={12} /> Supprimer
            </button>
          </div>
          <video
            src={resolvedUrl}
            controls
            className="w-full rounded-lg border border-gray-200 max-h-48"
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
