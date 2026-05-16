import React, { useState } from 'react';
import { X, RefreshCw, Wand2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import axios from 'axios';
import { BACKEND_URL, getAuthHeaders } from './constants';

const AI_PROMPT_SUGGESTIONS = {
  card: [
    "Technicien informatique souriant aidant une personne âgée devant un ordinateur à domicile, lumière naturelle",
    "Vue de dessus d'un bureau avec laptop, smartphone et tablette, ambiance professionnelle chaleureuse",
    "Mains tapant sur un clavier d'ordinateur portable moderne, fond épuré net",
  ],
  hero: [
    "Technicien IT professionnel en déplacement à domicile en Touraine, dans un salon lumineux",
    "Portrait confiant d'un expert informatique avec laptop, décor maison française",
    "Assistance informatique à domicile, senior et technicien côte à côte devant un écran",
  ],
  content: [
    "Mise en situation dépannage ordinateur PC Windows, vue de profil, intérieur chaleureux",
    "Formation numérique : grand-parent apprenant à utiliser une tablette avec de l'aide",
    "Installation d'une box internet et configuration du WiFi dans un appartement",
  ],
  logo: [
    "Logo moderne minimaliste pour une entreprise informatique, fond blanc",
    "Icône technologie numérique, bleu et blanc, style professionnel",
  ],
  default: [
    "Assistance informatique à domicile, ambiance professionnelle et chaleureuse",
    "Sécurité informatique, bouclier numérique, tons bleus",
    "Formation numérique pour seniors, tablette et sourire",
  ],
};

const AIGeneratorModal = ({ onClose, onGenerated, context = "default" }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const suggestions = AI_PROMPT_SUGGESTIONS[context] || AI_PROMPT_SUGGESTIONS.default;

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    setGeneratedUrl(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/ai-generate`,
        { prompt: prompt.trim(), context },
        { headers: getAuthHeaders(), timeout: 90000 }
      );
      setGeneratedUrl(res.data.url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération. Réessayez.');
    } finally {
      setGenerating(false);
    }
  };

  const useImage = () => {
    onGenerated(generatedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" data-testid="ai-generator-modal">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-french-blue/5 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-french-blue to-purple-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Générer avec IA</h3>
              <p className="text-xs text-gray-500">GPT Image 1 · Qualité professionnelle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Décrivez l'image souhaitée</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: technicien informatique aidant un senior à domicile à Tours, lumière naturelle, style photo réaliste..."
              rows={3}
              className="text-sm resize-none"
              data-testid="ai-prompt-input"
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) generate(); }}
            />
            <p className="text-xs text-gray-400 mt-1">Conseil : soyez précis. Ctrl+Entrée pour générer.</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Suggestions rapides :</p>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-french-blue/5 hover:text-french-blue border border-gray-100 hover:border-french-blue/20 transition-all text-gray-600"
                  data-testid={`ai-suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {generatedUrl && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={`${BACKEND_URL}${generatedUrl}`}
                  alt="Image générée par IA"
                  className="w-full h-48 object-cover"
                  data-testid="ai-generated-preview"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={11} /> Générée
                </div>
              </div>
              <Button onClick={useImage} className="w-full bg-french-blue hover:bg-french-blue/90" data-testid="ai-use-image-btn">
                <CheckCircle size={16} className="mr-2" />Utiliser cette image
              </Button>
              <button
                onClick={() => setGeneratedUrl(null)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
              >
                Regénérer avec le même prompt
              </button>
            </div>
          )}
        </div>

        {!generatedUrl && (
          <div className="p-5 pt-0">
            <Button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-french-blue to-purple-600 hover:from-french-blue/90 hover:to-purple-700 text-white font-semibold"
              data-testid="ai-generate-btn"
            >
              {generating ? (
                <><RefreshCw size={16} className="animate-spin mr-2" />Génération en cours... (30-60s)</>
              ) : (
                <><Wand2 size={16} className="mr-2" />Générer l'image</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGeneratorModal;
