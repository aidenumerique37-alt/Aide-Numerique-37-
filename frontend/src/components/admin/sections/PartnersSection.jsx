import React from 'react';
import { Users, Plus, Edit2, Trash2, X, Save, Globe, Link as LinkIcon, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import ImageInputField from '../ImageInputField';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'X (Twitter)', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Globe },
];

const PartnersSection = ({ ctx }) => {
  const {
    partners, editingPartner, setEditingPartner,
    partnerCategories, newPartnerCategory, setNewPartnerCategory,
    savePartner, deletePartner,
    addSocialLink, updateSocialLink, removeSocialLink,
    addPartnerCategory, deletePartnerCategory,
  } = ctx;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gérer les partenaires ({partners.length})</h2>
        <Button
          onClick={() => setEditingPartner({ id: 'new-' + Date.now(), name: '', logo_url: '', activity: '', description: '', website: '', category: '', social_links: [], order: partners.length + 1 })}
          className="bg-french-blue hover:bg-french-blue/90">
          <Plus size={16} className="mr-2" />Ajouter un partenaire
        </Button>
      </div>

      {/* Edit Partner Form */}
      {editingPartner && (
        <Card className="border-2 border-french-blue">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingPartner.id?.startsWith('new-') ? 'Nouveau partenaire' : 'Modifier le partenaire'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditingPartner(null)}><X size={20} /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du partenaire *</label>
                <Input value={editingPartner.name} onChange={(e) => setEditingPartner({...editingPartner, name: e.target.value})} placeholder="Nom de l'entreprise" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domaine d'activité *</label>
                <Input value={editingPartner.activity} onChange={(e) => setEditingPartner({...editingPartner, activity: e.target.value})} placeholder="Ex: Électricien, Plombier, Web..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select value={editingPartner.category || ''} onChange={(e) => setEditingPartner({...editingPartner, category: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">-- Sans catégorie --</option>
                {partnerCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <ImageInputField label="Logo du partenaire" value={editingPartner.logo_url || ''} onChange={(val) => setEditingPartner({...editingPartner, logo_url: val})} testId="partner-logo-url-input" context="logo" />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={editingPartner.description} onChange={(e) => setEditingPartner({...editingPartner, description: e.target.value})} rows={2} placeholder="Courte description du partenaire..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site web</label>
              <Input value={editingPartner.website} onChange={(e) => setEditingPartner({...editingPartner, website: e.target.value})} placeholder="https://www.example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Réseaux sociaux</label>
                <Button variant="outline" size="sm" onClick={addSocialLink}><Plus size={14} className="mr-1" />Ajouter un réseau</Button>
              </div>
              {editingPartner.social_links?.length > 0 ? (
                <div className="space-y-2">
                  {editingPartner.social_links.map((social, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <select value={social.platform} onChange={(e) => updateSocialLink(index, 'platform', e.target.value)} className="border rounded-md px-2 py-1.5 text-sm">
                        {SOCIAL_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <Input value={social.url} onChange={(e) => updateSocialLink(index, 'url', e.target.value)} placeholder="URL du profil..." className="flex-1" />
                      <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)} className="text-red-500"><Trash2 size={16} /></Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Aucun réseau social ajouté</p>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => savePartner(editingPartner)} className="bg-french-blue hover:bg-french-blue/90">
                <Save size={16} className="mr-2" />Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setEditingPartner(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partner Categories */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Catégories de partenaires</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Input placeholder="Nouvelle catégorie..." value={newPartnerCategory} onChange={(e) => setNewPartnerCategory(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addPartnerCategory()} />
            <Button onClick={addPartnerCategory} className="bg-french-blue hover:bg-french-blue/90"><Plus size={16} className="mr-2" />Ajouter</Button>
          </div>
          {partnerCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {partnerCategories.map((cat) => (
                <div key={cat} className="flex items-center gap-2 px-3 py-2 rounded-full bg-french-blue/10 text-french-blue">
                  <span className="text-sm font-medium">{cat}</span>
                  <button onClick={() => deletePartnerCategory(cat)} className="hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucune catégorie. Ajoutez-en pour organiser vos partenaires.</p>
          )}
        </CardContent>
      </Card>

      {/* Partners List */}
      {partners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Aucun partenaire pour le moment</p>
            <p className="text-sm text-gray-400">Cliquez sur "Ajouter un partenaire" pour commencer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {partner.logo_url
                    ? <img src={partner.logo_url.startsWith('http') ? partner.logo_url : `${BACKEND_URL}${partner.logo_url}`} alt={partner.name} className="w-16 h-16 object-contain rounded" loading="lazy" />
                    : <div className="w-16 h-16 bg-french-blue/10 rounded flex items-center justify-center"><span className="text-lg font-bold text-french-blue">{partner.name.substring(0, 2).toUpperCase()}</span></div>
                  }
                  <div className="flex-1">
                    <h3 className="font-semibold">{partner.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{partner.activity}</span>
                      {partner.category && <span className="text-xs bg-french-blue/10 text-french-blue px-2 py-0.5 rounded-full">{partner.category}</span>}
                    </div>
                    {partner.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{partner.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {partner.website && <LinkIcon size={14} className="text-gray-400" />}
                      {partner.social_links?.map((s, i) => {
                        const platform = SOCIAL_PLATFORMS.find(p => p.value === s.platform);
                        const Icon = platform?.icon || Globe;
                        return <Icon key={i} size={14} className="text-gray-400" />;
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingPartner(partner)}><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deletePartner(partner.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnersSection;
