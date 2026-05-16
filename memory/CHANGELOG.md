# Changelog - Aide Numérique 37

## 2026-03-25 - Session actuelle

### SEO P0 - Corrections accent "Numérique"
- Corrigé "Aide Numerique 37" → "Aide Numérique 37" dans TOUS les fichiers
  - `Header.jsx`, `Hero.jsx`, `CityPage.jsx`, `ServiceDetail.jsx`, `About.jsx`, `MentionsLegales.jsx`, `NotFound.jsx`
  - `public/index.html` (title et og:title)
  - Tous les JSON-LD schemas
  - Tous les alt texts

### SEO P0 - Meta descriptions uniques
- Amélioré les meta descriptions de toutes les pages avec accents corrects
- `CityPage.jsx` : description dynamique avec nom de ville
- `ServiceDetail.jsx` : description dynamique avec titre de service
- `About.jsx`, `MentionsLegales.jsx`, `NotFound.jsx` : descriptions uniques

### SEO P1 - Canonical tags pour articles dupliqués
- Ajouté `detect_and_set_canonical_articles()` dans `article_sync.py`
- 5 articles dupliqués (suffix -2) marqués avec `canonical_url`
- Déclenché automatiquement à chaque sync WordPress
- Endpoint admin : `POST /api/admin/articles/detect-canonical`
- `BlogDetail.jsx` : canonical dynamique, `noindex, follow` sur doublons
- Sitemap exclut les articles dupliqués (5 articles exclus)

### SEO P2 - Blocage des URLs parasites WordPress
- `robots.txt` frontend mis à jour : bloque `?wptouch_switch=`, `?taxonomy=`, et 10+ paramètres WordPress parasites
- `robots.txt` backend synchronisé
- `App.js` : `ParasiteParamGuard` composant qui détecte les paramètres parasites et ajoute `noindex + canonical` propre
- Sitemap backend : 159 URLs propres (sans doublons)

### Nettoyage code
- Supprimé `HeroPreview.jsx` (feature abandonnée)
- Retiré ~160 lignes CSS orb/blob/btn-ghost-orb de `App.css`
- Retiré `/preview-hero` des références robots.txt

## 2026-03-24 - Session précédente

### Features majeures
- Upload d'images depuis l'appareil (backend endpoint `/api/upload`)
- Bibliothèque médias centrale dans l'admin
- Génération d'images IA (OpenAI GPT Image 1 via Emergent LLM Key)
- Optimisation automatique des images (resize + WebP via Pillow)
- Champs alt text SEO pour toutes les images
- Correction sitemap.xml (Allow dans robots.txt)
- Résolution des bugs iOS/WebKit (effets blur retirés)
- Animation menu plus rapide et opaque
