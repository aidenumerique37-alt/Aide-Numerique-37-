import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, ExternalLink, GripVertical, Star, StarOff, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import ImageInputField from '../ImageInputField';
import { BACKEND_URL, getAuthHeaders } from '../constants';

const CLIENT_TYPES = ['Particulier', 'TPE', 'PME', 'Association', 'Auto-entrepreneur', 'Collectivité'];
const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_PROJECT = {
  title: '',
  client_type: 'TPE',
  description: '',
  url: '',
  image_url: '',
  technologies: [],
  year: CURRENT_YEAR,
  featured: false,
  order: 0,
};

const PortfolioSection = ({ ctx }) => {
  const { projects, editingProject, setEditingProject, saveProject, deleteProject } = ctx;
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || editingProject.technologies.includes(tag)) return;
    setEditingProject(p => ({ ...p, technologies: [...p.technologies, tag] }));
    setTagInput('');
  };

  const removeTag = (tag) => {
    setEditingProject(p => ({ ...p, technologies: p.technologies.filter(t => t !== tag) }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Réalisations Web IA</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} projet{projects.length > 1 ? 's' : ''} · affiché sur <code className="text-xs bg-gray-100 px-1 rounded">/realisations</code> et sur <code className="text-xs bg-gray-100 px-1 rounded">/pro</code></p>
        </div>
        <Button
          onClick={() => setEditingProject({ ...EMPTY_PROJECT })}
          className="bg-french-blue hover:bg-french-blue/90 gap-2"
          data-testid="add-project-btn"
        >
          <Plus size={15} />
          Ajouter un projet
        </Button>
      </div>

      {/* Edit / Create Form */}
      {editingProject && (
        <Card className="border-2 border-french-blue/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{editingProject.id ? 'Modifier le projet' : 'Nouveau projet'}</span>
              <button onClick={() => setEditingProject(null)} className="p-1.5 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Titre du projet *</label>
                <Input
                  value={editingProject.title}
                  onChange={e => setEditingProject(p => ({ ...p, title: e.target.value }))}
                  placeholder="Site vitrine Cabinet Martin"
                  data-testid="project-title-input"
                />
              </div>
              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-1">URL du site live</label>
                <Input
                  value={editingProject.url}
                  onChange={e => setEditingProject(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://www.exemple-client.fr"
                  data-testid="project-url-input"
                />
              </div>
              {/* Client type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type de client</label>
                <select
                  value={editingProject.client_type}
                  onChange={e => setEditingProject(p => ({ ...p, client_type: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  data-testid="project-client-type"
                >
                  {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Year */}
              <div>
                <label className="block text-sm font-medium mb-1">Année</label>
                <Input
                  type="number"
                  value={editingProject.year}
                  onChange={e => setEditingProject(p => ({ ...p, year: parseInt(e.target.value) || CURRENT_YEAR }))}
                  min={2020}
                  max={CURRENT_YEAR + 1}
                  data-testid="project-year-input"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description courte</label>
              <textarea
                value={editingProject.description}
                onChange={e => setEditingProject(p => ({ ...p, description: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none"
                rows={2}
                placeholder="Site vitrine responsive avec système de prise de rendez-vous en ligne..."
                data-testid="project-description-input"
              />
            </div>

            {/* Image */}
            <ImageInputField
              label="Screenshot / Image du projet"
              value={editingProject.image_url}
              onChange={v => setEditingProject(p => ({ ...p, image_url: v }))}
              testId="project-image"
              context="card"
            />

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium mb-1">Technologies / Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Ex : WordPress, React, Wix... (Entrée pour ajouter)"
                  className="flex-1 text-sm"
                  data-testid="project-tag-input"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus size={14} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {editingProject.technologies.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-french-blue/10 text-french-blue text-xs px-2.5 py-1 rounded-full">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProject.featured}
                  onChange={e => setEditingProject(p => ({ ...p, featured: e.target.checked }))}
                  className="rounded"
                  data-testid="project-featured-checkbox"
                />
                <span className="text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="text-amber-400" />
                  Mettre en avant (affiché sur /pro)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Ordre :</label>
                <Input
                  type="number"
                  value={editingProject.order}
                  onChange={e => setEditingProject(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  className="w-20 text-sm"
                  min={0}
                  data-testid="project-order-input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setEditingProject(null)}>Annuler</Button>
              <Button
                onClick={() => saveProject(editingProject)}
                className="bg-french-blue hover:bg-french-blue/90 gap-2"
                data-testid="save-project-btn"
              >
                <Check size={15} />
                {editingProject.id ? 'Enregistrer' : 'Créer le projet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Aucune réalisation pour l'instant</p>
            <p className="text-sm">Cliquez sur "Ajouter un projet" pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Screenshot preview */}
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-1.5 border-b">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="flex-1 bg-white rounded-full px-2 py-0.5 text-[10px] text-gray-400 truncate ml-1">
                  {p.url || 'https://...'}
                </div>
              </div>
              <div className="aspect-video bg-gray-50 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`}
                    alt={p.title} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    Pas d'image
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight">{p.title}</h3>
                  {p.featured && <Star size={13} className="text-amber-400 shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-gray-400 mb-2">{p.client_type} · {p.year}</p>
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.technologies.map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1"
                    onClick={() => setEditingProject({ ...p })}
                    data-testid={`edit-project-${p.id}`}>
                    <Edit2 size={12} />Modifier
                  </Button>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-french-blue transition-colors">
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="h-7 w-7 rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                    data-testid={`delete-project-${p.id}`}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;
