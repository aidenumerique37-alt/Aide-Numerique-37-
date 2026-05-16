import React from 'react';
import { Building2, MapPin, Plus, Edit2, Trash2, X, Save, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import ImageInputField from '../ImageInputField';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EMPTY_CITY_PAGE = {
  name: '', slug: '', code_postal: '', population: '',
  description: '', problematiques: [], quartiers: [],
  seo_title: '', seo_description: '', map_embed: '', image_url: ''
};

const cityPageSlugify = (name) => name.toLowerCase()
  .replace(/[éèêë]/g,'e').replace(/[àâä]/g,'a').replace(/[îï]/g,'i')
  .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim('-');

const CitiesSection = ({ ctx }) => {
  const {
    cities, primaryCitiesList, secondaryCitiesList,
    cityPages, editingCityPage, setEditingCityPage,
    citiesSubTab, setCitiesSubTab,
    newCity, setNewCity,
    addCity, deleteCity, toggleCityPrimary,
    saveCityPage, deleteCityPage, generateCityImage, cityPageGenerating,
    content, setContent, saveContent,
  } = ctx;

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setCitiesSubTab('pages')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${citiesSubTab === 'pages' ? 'bg-white shadow text-french-blue' : 'text-gray-600 hover:text-gray-900'}`}
          data-testid="subtab-city-pages">
          <Building2 size={14} className="inline mr-1.5" />
          Pages SEO ({cityPages.length})
        </button>
        <button onClick={() => setCitiesSubTab('zone')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${citiesSubTab === 'zone' ? 'bg-white shadow text-french-blue' : 'text-gray-600 hover:text-gray-900'}`}
          data-testid="subtab-zone">
          <MapPin size={14} className="inline mr-1.5" />
          Zone d'intervention ({cities.length})
        </button>
      </div>

      {/* === CITY SEO PAGES LIST === */}
      {citiesSubTab === 'pages' && !editingCityPage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pages SEO de ville</h2>
            <Button onClick={() => setEditingCityPage({ ...EMPTY_CITY_PAGE })}
              className="bg-french-blue hover:bg-french-blue/90" data-testid="new-city-page-btn">
              <Plus size={16} className="mr-2" />Nouvelle page de ville
            </Button>
          </div>
          {cityPages.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-gray-500">Aucune page de ville. Cliquez sur "Nouvelle page de ville" pour commencer.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {cityPages.map((page) => (
                <Card key={page.slug} className="hover:shadow-md transition-shadow" data-testid={`city-page-card-${page.slug}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {page.image_url
                        ? <img src={page.image_url.startsWith('/api') ? `${BACKEND_URL}${page.image_url}` : page.image_url} alt={page.name} className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><Building2 size={24} className="text-gray-400" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{page.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{page.code_postal}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">/intervention/{page.slug}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{page.description?.substring(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={`/intervention/${page.slug}`} target="_blank" rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-french-blue transition-colors rounded-md hover:bg-gray-50" title="Prévisualiser">
                        <ExternalLink size={16} />
                      </a>
                      <Button variant="outline" size="sm" onClick={() => setEditingCityPage({ ...page })} data-testid={`edit-city-page-${page.slug}`}>
                        <Edit2 size={14} className="mr-1" />Modifier
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteCityPage(page.slug)}
                        className="text-red-500 hover:text-red-700 hover:border-red-300" data-testid={`delete-city-page-${page.slug}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === CITY PAGE EDIT FORM === */}
      {citiesSubTab === 'pages' && editingCityPage && (
        <div className="space-y-5" data-testid="city-page-form">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editingCityPage.slug && cityPages.find(p => p.slug === editingCityPage.slug)
                ? `Modifier — ${editingCityPage.name}` : 'Nouvelle page de ville'}
            </h2>
            <button onClick={() => setEditingCityPage(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-start gap-5">
                <div className="w-32 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {editingCityPage.image_url
                    ? <img src={editingCityPage.image_url.startsWith('/api') ? `${BACKEND_URL}${editingCityPage.image_url}` : editingCityPage.image_url} alt={editingCityPage.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Building2 size={32} className="text-gray-300" /></div>
                  }
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL de l'image</label>
                    <Input value={editingCityPage.image_url || ''} onChange={e => setEditingCityPage(p => ({ ...p, image_url: e.target.value }))} placeholder="https://... ou /api/uploads/..." data-testid="city-image-url-input" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => editingCityPage.slug && generateCityImage(editingCityPage.slug)}
                      disabled={cityPageGenerating || !editingCityPage.slug} className="bg-purple-600 hover:bg-purple-700 text-white" data-testid="city-generate-image-btn">
                      {cityPageGenerating ? <><RefreshCw size={14} className="animate-spin mr-2" />Génération...</> : <><Sparkles size={14} className="mr-2" />Générer avec IA</>}
                    </Button>
                    {!editingCityPage.slug && <span className="text-xs text-amber-600">Sauvegardez d'abord pour activer la génération IA</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Informations de base</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de la ville *</label>
                  <Input value={editingCityPage.name} onChange={e => {
                    const name = e.target.value;
                    const isNew = !cityPages.find(p => p.slug === editingCityPage.slug);
                    setEditingCityPage(p => ({ ...p, name, slug: isNew ? cityPageSlugify(name) : p.slug }));
                  }} placeholder="Ex: Amboise" data-testid="city-name-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug URL *</label>
                  <Input value={editingCityPage.slug} onChange={e => setEditingCityPage(p => ({ ...p, slug: e.target.value }))} placeholder="amboise" data-testid="city-slug-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code postal</label>
                  <Input value={editingCityPage.code_postal || ''} onChange={e => setEditingCityPage(p => ({ ...p, code_postal: e.target.value }))} placeholder="37000" data-testid="city-cp-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Population</label>
                  <Input value={editingCityPage.population || ''} onChange={e => setEditingCityPage(p => ({ ...p, population: e.target.value }))} placeholder="15 000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea value={editingCityPage.description || ''} onChange={e => setEditingCityPage(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Présentez la ville et vos interventions..." data-testid="city-description-input" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contenu de la page</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Problématiques courantes <span className="text-gray-400 font-normal ml-2 text-xs">(une par ligne)</span></label>
                <Textarea value={(editingCityPage.problematiques || []).join('\n')} onChange={e => setEditingCityPage(p => ({ ...p, problematiques: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} rows={6} placeholder={"Ordinateur lent\nConfiguration WiFi\nFormation seniors..."} data-testid="city-problematiques-input" />
                <p className="text-xs text-gray-400 mt-1">{(editingCityPage.problematiques || []).length} entrée(s)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quartiers desservis <span className="text-gray-400 font-normal ml-2 text-xs">(un par ligne)</span></label>
                <Textarea value={(editingCityPage.quartiers || []).join('\n')} onChange={e => setEditingCityPage(p => ({ ...p, quartiers: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} rows={4} placeholder={"Centre-ville\nQuartier Nord\n..."} data-testid="city-quartiers-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Google Maps Embed</label>
                <Input value={editingCityPage.map_embed || ''} onChange={e => setEditingCityPage(p => ({ ...p, map_embed: e.target.value }))} placeholder="https://maps.google.com/maps?q=..." data-testid="city-map-input" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre SEO</label>
                <Input value={editingCityPage.seo_title || ''} onChange={e => setEditingCityPage(p => ({ ...p, seo_title: e.target.value }))} placeholder="Assistance Informatique à {ville} | Aide Numérique 37" data-testid="city-seo-title-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Méta-description
                  <span className={`ml-2 text-xs ${(editingCityPage.seo_description || '').length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{(editingCityPage.seo_description || '').length}/160</span>
                </label>
                <Textarea value={editingCityPage.seo_description || ''} onChange={e => setEditingCityPage(p => ({ ...p, seo_description: e.target.value }))} rows={2} placeholder="Dépannage informatique à domicile à {ville}. 50% crédit d'impôt..." data-testid="city-seo-desc-input" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-4">
            <Button onClick={() => saveCityPage(editingCityPage)} className="bg-french-blue hover:bg-french-blue/90 flex-1" disabled={!editingCityPage.name || !editingCityPage.slug} data-testid="save-city-page-btn">
              <Save size={16} className="mr-2" />Enregistrer la page
            </Button>
            <Button variant="outline" onClick={() => setEditingCityPage(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* === ZONE D'INTERVENTION === */}
      {citiesSubTab === 'zone' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Zone d'intervention ({cities.length} villes)</h2>

          <Card>
            <CardHeader><CardTitle className="text-lg">Texte de la zone d'intervention</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <Input value={content.zone_intervention?.title || ''} onChange={(e) => setContent({...content, zone_intervention: {...(content.zone_intervention || {}), title: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sous-titre (rayon, km, etc.)</label>
                <Input value={content.zone_intervention?.subtitle || ''} onChange={(e) => setContent({...content, zone_intervention: {...(content.zone_intervention || {}), subtitle: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texte de pied</label>
                <Input value={content.zone_intervention?.footer || ''} onChange={(e) => setContent({...content, zone_intervention: {...(content.zone_intervention || {}), footer: e.target.value}})} />
              </div>
              <Button onClick={saveContent} className="bg-french-blue hover:bg-french-blue/90">
                <Save size={16} className="mr-2" />Enregistrer les textes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input placeholder="Nom de la ville à ajouter..." value={newCity} onChange={(e) => setNewCity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCity()} />
                <Button onClick={addCity} className="bg-french-blue hover:bg-french-blue/90"><Plus size={16} className="mr-2" />Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-french-blue rounded-full"></span>
                Villes principales ({primaryCitiesList.length})
              </CardTitle>
              <p className="text-sm text-gray-500">Affichées directement sur le site. Cliquez pour basculer en secondaire.</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {primaryCitiesList.map((city) => (
                  <button key={city.name} onClick={() => toggleCityPrimary(city.name, city.is_primary)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-french-blue text-white hover:bg-french-blue/80 transition-colors" title="Cliquer pour basculer en secondaire">
                    <MapPin size={14} /><span>{city.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                Villes secondaires ({secondaryCitiesList.length})
              </CardTitle>
              <p className="text-sm text-gray-500">Dans le dépliant "Mais aussi..." avec frais de déplacement. Cliquez pour basculer en principale.</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                {secondaryCitiesList.map((city) => (
                  <button key={city.name} onClick={() => toggleCityPrimary(city.name, city.is_primary)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-800 transition-colors text-sm" title="Cliquer pour basculer en principale">
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CitiesSection;
