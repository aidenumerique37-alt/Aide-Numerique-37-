import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Eye, Code } from 'lucide-react';

export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean'],
  ],
};

export const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'link', 'blockquote', 'code-block'
];

const RichEditor = ({ value, onChange, articleKey }) => {
  const [mode, setMode] = useState('visual');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const wc = (value || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    setWordCount(wc);
  }, [articleKey]);

  const handleChange = (html) => {
    const wc = html
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    setWordCount(wc);
    onChange(html);
  };

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'visual' ? 'bg-french-blue text-white' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Eye size={12} />Éditeur visuel
          </button>
          <button
            onClick={() => setMode('source')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'source' ? 'bg-french-blue text-white' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            <Code size={12} />HTML source
          </button>
        </div>
        <span className="text-xs text-gray-400">~{wordCount} mots · {(value || '').length} car.</span>
      </div>
      {mode === 'visual' ? (
        <ReactQuill
          key={articleKey}
          theme="snow"
          value={value || ''}
          onChange={handleChange}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          style={{ minHeight: '400px' }}
          className="quill-admin"
        />
      ) : (
        <textarea
          value={value || ''}
          onChange={e => handleChange(e.target.value)}
          rows={22}
          className="w-full p-4 font-mono text-xs resize-y focus:outline-none"
          style={{ minHeight: '400px', background: '#1e293b', color: '#e2e8f0', border: 'none' }}
          placeholder="<h2>Titre de section</h2><p>Contenu...</p>"
          data-testid="edit-article-content-source"
          spellCheck={false}
        />
      )}
    </div>
  );
};

export default RichEditor;
