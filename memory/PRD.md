# PRD — Aide Numérique 37 — Site Vitrine Professionnel

## Problème original
L'utilisateur gère une entreprise d'assistance informatique à domicile agréée SAP : **Aide Numérique 37**, basée à Joué-lès-Tours (37300). Il a besoin d'un site professionnel pour présenter ses services, attirer des clients et établir une présence en ligne.

---

## Personas / Public cible
- **Propriétaire / Gérant** : Pierrick, utilisateur du panneau admin pour gérer tout le contenu
- **Visiteurs** : Seniors, particuliers et TPE de Touraine cherchant de l'aide informatique

---

## Stack Technique
- **Frontend** : React + Tailwind CSS + Lucide-react + Shadcn/UI + react-helmet-async
- **Backend** : FastAPI + MongoDB + APScheduler
- **IA** : Claude Sonnet (via Emergent LLM Key) pour la génération d'articles
- **Image IA** : GPT Image 1 (via Emergent LLM Key)
- **Email** : Hostinger SMTP
- **SEO** : Google Search Console API, sitemap.xml dynamique, Schema.org

---

## Architecture du Code

```
/app
├── backend/
│   ├── routes/
│   │   ├── admin.py           # CRUD articles, content, services, cities, partners
│   │   ├── article_generator.py  # Génération IA (Claude) + queue auto + régénération
│   │   ├── seo_dashboard.py   # GSC integration
│   │   ├── upload.py          # Upload images + galerie médias (MD5 dedup)
│   │   └── contact.py         # SMTP email
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   ├── constants.js         # BACKEND_URL, ADMIN_PASSWORD
│       │   │   ├── SeoBadge.jsx         # computeSeoScore, SeoBadge, PlanningDataBadge
│       │   │   ├── RichEditor.jsx       # Éditeur WYSIWYG + vue source HTML
│       │   │   ├── ArticlePreview.jsx   # Prévisualisation + MODE ÉDITION
│       │   │   ├── AIGeneratorModal.jsx # Modal génération image IA
│       │   │   ├── ImageInputField.jsx  # Upload/URL/Galerie/IA
│       │   │   ├── MediaLibrary.jsx     # Médiathèque avec détection doublons
│       │   │   ├── ArticleGenerator.jsx # Générateur + Planning + File IA
│       │   │   └── SeoDashboard.jsx     # Google Search Console
│       │   ├── AdminPanel.jsx           # ~2060 lignes (main admin, import des sous-composants)
│       │   ├── Hero.jsx                 # Section héro dynamique
│       │   ├── Services.jsx             # Section services
│       │   ├── Partners.jsx             # Logo wall défilant
│       │   └── Header.jsx              # Navigation principale
│       └── pages/
│           ├── Admin.jsx               # Page /admin
│           ├── ArticlePage.jsx         # Page article individuel
│           ├── FAQPage.jsx             # Page /faq (SEO)
│           └── ServiceDetail.jsx       # Page service détaillé
```

---

## Fonctionnalités Implémentées (✅ = Fait)

### Site public
- ✅ Page d'accueil : héro, services, comment ça marche, partenaires, avis Google, contact
- ✅ Thème bleu/blanc/rouge (patriotique français) + mode sombre
- ✅ Page FAQ /faq avec ~30 questions + Schema.org FAQPage
- ✅ Pages villes dynamiques avec SEO local
- ✅ Pages services détaillées avec images dynamiques
- ✅ Blog articles : WordPress sync + articles IA
- ✅ Formulaire de contact (SMTP Hostinger → aidenumerique37@gmail.com)
- ✅ Sitemap.xml dynamique + robots.txt correct
- ✅ Font Montserrat + logo + favicon

### Admin Panel (/admin — mot de passe: admin37)
- ✅ Dashboard avec statistiques
- ✅ Gestion de tout le contenu textuel (héro, services, cities, partners)
- ✅ Layout manager : réordonner les sections de la page d'accueil
- ✅ Héro : personnalisation police et taille de titre
- ✅ Upload images : URL / Fichier / Galerie / IA (partout dans l'admin)
- ✅ Médiathèque avec détection de doublons MD5
- ✅ Générateur IA (Claude Sonnet) : article unique ou liste de titres
- ✅ Planning éditorial CSV : import, file auto, publication programmée
- ✅ Panneau latéral fixe (droite) dans le planning éditorial
- ✅ **NOUVEAU** : Régénération d'article depuis la liste ET le formulaire d'édition
- ✅ **NOUVEAU** : Modification des textes en Prévisualisation (mode édition inline)
- ✅ Score SEO affiché (badge 0-5) — word_count depuis DB + regex slug corrigé
- ✅ Google Search Console : dashboard + soumission d'articles
- ✅ Éditeur WYSIWYG (react-quill-new) + vue HTML source
- ✅ Prévisualisation articles + mode édition (titre, méta, contenu, image)
- ✅ Notification email à la publication automatique
- ✅ Auto-pause si budget LLM épuisé
- ✅ Backfill hash MD5 médiathèque
- ✅ Adresse complète dans le prompt maître (37300, email)

---

## Endpoints API Clés

- `GET /api/admin/articles` — Liste complète avec content_html
- `PUT /api/admin/articles/{slug}` — Mise à jour (auto-calcul word_count)
- `POST /api/admin/articles/{slug}/regenerate` — **BACKGROUND** Régénération Claude (retour immédiat)
- `GET /api/admin/articles/{slug}/regeneration-status` — **NOUVEAU** Poll statut régénération
- `POST /api/admin/articles/fix-image-extensions` — **NOUVEAU** Migration .web→.webp en DB
- `GET /api/admin/planning` — Planning avec meta_title, meta_description, slug, word_count
- `GET /api/admin/generator/config` — Config prompt maître
- `PUT /api/admin/generator/config` — Mise à jour prompt
- `GET /api/admin/planning/budget-status` — Statut budget LLM
- `POST /api/upload` — Upload image
- `GET /api/upload/gallery` — Galerie médias
- `GET /api/sitemap.xml` — Sitemap dynamique

---

## Schéma DB Clé

- **articles** : {slug, title, content_html, meta_title, meta_description, word_count, source, status, image_url, date_published, planning_id}
- **editorial_planning** : {id, subject, status, scheduled_at, article_slug, main_keyword, target_city, audience, priority, ...}
- **content** : {key: "article_generator", master_prompt, generate_image, ...}
- **services** : {title, description, image_card_url, image_hero_url, image_content_url}
- **images** : {url, filename, hash, source, label}

---

## P0/P1/P2 Restant

### P0 — Résolu
- ✅ JSX Syntax Error AdminPanel.jsx → Split en sous-composants
- ✅ Régénération IA en timeout → Background task + polling
- ✅ Images .web extension → Endpoint migration + fix dans generate_image_for_article

### P1 — Fait
- ✅ Split AdminPanel.jsx (3625 → 2060 lignes) en sous-composants dans /admin/
- ✅ Split AdminPanel.jsx (2414 → 1356 lignes) : CitiesSection, PartnersSection, ArticlesSection dans /admin/sections/ (refactoring finalisé 2026-05)
- ✅ Page Professionnelle `/pro` : landing page dark-tech B2B complète

### P2 — Fait
- ✅ Auto-pause budget LLM
- ✅ Backfill MD5 médiathèque

---

## Intégrations Tierces

- **Claude Sonnet** : Génération articles (Emergent LLM Key)
- **GPT Image 1** : Génération images (Emergent LLM Key)
- **Google Search Console** : Indexation et analytics
- **WordPress REST API** : Sync articles blog
- **Hostinger SMTP** : Email contact + notifications
- **Google Places API** : Avis Google My Business

---

## Credentials Test

- **Admin URL** : /admin
- **Admin Password** : admin37

---

## Changelog (dernières sessions)

### 2026-04-07 (fork session)
- **Fix CRITIQUE — Régénération IA en timeout** : L'endpoint `POST /api/admin/articles/{slug}/regenerate` passe désormais en tâche d'arrière-plan (asyncio.create_task). Retourne immédiatement `{background:true, message:...}`. Le frontend poll via `GET /api/admin/articles/{slug}/regeneration-status` toutes les 8s. Guard anti-concurrence ajouté.
- **Fix images .web → .webp** : Nouvel endpoint `POST /api/admin/articles/fix-image-extensions` pour migrer les chemins corrompus en DB (et renommer les fichiers si besoin).
- **NOUVEAU — Page Professionnelle `/pro`** : Page marketing dark-tech autonome ciblant TPE/PME. Header Pro dédié, hero "Votre DSI externalisé sur mesure" (60€/h HT), 6 services Pro (Prestataire IT, Formation, IA/Automatisation, Fracture numérique, Conseil stratégique, Création web), stats animées, formulaire de contact Pro, footer. SEO avec Schema.org ProfessionalService.
- **Bouton "Espace Pro"** dans le header principal (visible desktop ≥ lg) et dans le menu hamburger.
- **Lien "Espace Professionnel"** dans le menu de navigation mobile/fullscreen du header.

### 2026-03-30 (fork session)
- Fix CRITIQUE : SyntaxError dans article_generator.py → backend redémarré
- Fix dashboard-stats : word_count + backfill 164 articles
- Score SEO "Mots" maintenant correct (~XXX)
- **NOUVEAU** : Onglet "En réserve (N)" dans Générateur IA — 5 articles pré-générés avec prévisualisation/modification/publication immédiate
- **NOUVEAU** : Médiathèque avec catégories (Articles IA, Services, Landing Page, Partenaires, Villes, Vidéos, Général) + badges + dropdown sélecteur upload + filtres tabs
- **NOUVEAU** : Upload vidéo chunked (2MB/chunk) sur chaque article + section vidéo HTML5 dans l'article public (uniquement si video_url présent) avec tagline "Le résumé de votre article en vidéo en 1 minute par mon clone IA"
- **NOUVEAU** : Sauvegarde automatique catégorie "Articles IA" pour toutes les images générées par IA
- **NOUVEAU** : Range streaming (seek/pause/play) pour les vidéos servies via /api/uploads/

### 2026-03-29
- Split AdminPanel.jsx (~3625 lignes) en 8 sous-composants dans /admin/
- Fix JSX "Unexpected token {" dans le planning tab
- Fix refs manquants batchFileRef/csvFileRef dans ArticleGenerator
- Fix SEO score "0 mots" : word_count stocké en DB + fallback calcul HTML
- Fix slug regex : autorise les underscores (/^[a-z0-9_-]+$/)
- Ajout adresse complète dans le prompt maître (37300, email) + 2026 comme année de référence
- Nouveau endpoint POST /api/admin/articles/{slug}/regenerate
- Bouton "Régénérer" (Sparkles) dans la liste articles + formulaire édition
- Mode édition dans ArticlePreview (titre, méta-SEO, contenu, image)
- Panneau latéral fixe fonctionnel dans le planning éditorial
- Nouveau endpoint POST /api/admin/articles/update-years (2023/2024/2025 → 2026)

### Sessions précédentes
- SEO Dashboard GSC, Rich Text Editor, queue IA, CSV planning, médiathèque MD5
- FAQ page SEO, fix mobile iOS blur, menu animation, logo wall partenaires
- Layout manager, personnalisation héro, upload images


## Corrections qualité code (2026-03-31)
- **Sécurité XSS** : DOMPurify v3.3.3 + `utils/sanitize.js`. Appliqué sur BlogDetail, FAQPage, ArticlePreview. Les JSON-LD avec JSON.stringify() sont déjà sûrs
- **Cryptographie** : MD5 → SHA-256 dans upload.py
- **Secrets tests** : os.getenv('ADMIN_PASSWORD', 'admin37') dans 13 fichiers de tests
- **Catch silencieux** : catch {} → catch(error){console.error()} dans 3 endroits
- **Array keys** : key={i} → key={`url-${i}`} dans SeoDashboard et CityPage

### 2026-04-09 (fork session)
- **Découplage WordPress FINALISÉ** : Suppression de l'onglet filtre "WordPress" dans AdminPanel.jsx. Suppression de l'affichage "Dernière sync WP". Remplacement du bouton "Synchroniser WordPress" par "Rafraîchir les articles".
- **Bouton "Régénérer" universel** : Le bouton de régénération IA (sparkle ✦) est désormais visible et fonctionnel pour TOUS les articles (y compris les 158 anciens articles WordPress convertis en articles internes).
- **Fix minor bug** : `loadArticles()` → `loadAllData()` dans le polling de régénération (ligne 252 AdminPanel.jsx).
- **Dashboard mis à jour** : La stat "Articles WordPress" renommée "Articles internes" (somme WP + IA).

### 2026-04-09 — Correction persistence des images (bug critique)
**Cause racine 1** : `upload.py` sauvegardait le fichier sur disque mais PAS le base64 (`image_data`) en MongoDB → au redémarrage Kubernetes, les images disparaissaient et le fallback échouait.
**Cause racine 2** : Les modèles Pydantic `HeroContent`/`AboutContent` n'avaient pas de champs `image_url`/`photo_url` → Pydantic les ignorait silencieusement lors du `PUT /api/admin/content`.
**Fixes appliqués** :
- `upload.py` : upload utilisateur + génération IA sauvegardent maintenant `image_data` (base64) + `image_type` en MongoDB
- `upload.py` : endpoint `backfill-hashes` amélioré pour sauvegarder le base64 des images existantes sans `image_data`
- `admin.py` : `HeroContent` + `image_url`, `image_alt` (Optional). `AboutContent` + `photo_url`, `photo_alt` (Optional)
- Tests 10/10 frontend + 13/13 backend PASS. Persistance confirmée (simulation redémarrage pod).

### 2026-05 (fork session actuelle)
- **Refactoring AdminPanel.jsx finalisé** : Wiring des 3 composants créés lors de la session précédente (`CitiesSection.jsx`, `PartnersSection.jsx`, `ArticlesSection.jsx`) dans `AdminPanel.jsx`. Fichier réduit de 2414 → 1356 lignes (-44%). Pattern `ctx={{...}}` pour partage d'état. Code mort supprimé (EMPTY_CITY_PAGE, cityPageSlugify, SOCIAL_PLATFORMS). Tests 11/11 PASS (iteration_35).



**Bug CRITIQUE corrigé : double canonical sur la homepage**
- `Hero.jsx` avait `window.location.origin` + une balise `<link rel="canonical">` qui ÉCRASAIT le canonical correct de `App.js`. Google canonicalisait la homepage vers une URL variable.
- **Fix** : `SITE_URL = 'https://www.aidenumerique37.fr'` (hardcodé) + suppression du canonical de `Hero.jsx` (conservé uniquement dans `App.js`).

**og:image ajouté sur toutes les pages manquantes :**
- BlogList, ServiceDetail, CityPage, FAQPage, CreditImpotPage, ProPage, About (avec fallback logo)

**robots.txt dynamique corrigé (Python f-string) :**
- Le backend `server.py` utilisait une string normale au lieu d'une f-string pour la directive Sitemap → l'URL n'était pas évaluée. Fixed → `Sitemap: https://www.aidenumerique37.fr/sitemap.xml`

**Résultat final :**
- Aucun `window.location.origin` dans les composants utilisateur
- Toutes les pages : 1 seul canonical, og:url, og:image, og:description, og:locale
- Sitemap HTTP 200 avec 177 URLs sur www.aidenumerique37.fr
- Tests : 15/15 PASS (iteration_34)



- Le sitemap est maintenant généré comme fichier **physique** `/app/frontend/public/sitemap.xml`
- Accessible à `https://www.aidenumerique37.fr/sitemap.xml` (URL standard, directement lisible par Google Search Console)
- Généré automatiquement au démarrage du backend + chaque nuit à 2h00 (cron APScheduler)
- Bouton "Regénérer sitemap" dans le panneau admin (section Articles)
- `robots.txt` mis à jour pour pointer vers `/sitemap.xml`
- L'ancien endpoint `/api/sitemap.xml` reste fonctionnel (compatibilité + régénère aussi le fichier)
- Endpoint admin : `POST /api/admin/sitemap/regenerate` (header X-Admin-Password)



**Cause racine 1 — 44 pages noindex (anciens URLs WordPress)**
- Les anciens articles WordPress étaient à `/{slug}` (sans `/articles/`). La migration vers React les a renvoyés vers la page 404 (qui a `noindex`). Google les retirait de son index.
- **Fix** : Création du composant `LegacyArticleRedirect.jsx` qui intercepte les requêtes sur `/{slug}`, cherche l'article en DB, et redirige vers `/articles/{slug}` si trouvé (ou affiche une 404 propre sinon). Ajouté dans `App.js` comme route `/:slug` avant le wildcard `*`.

**Cause racine 2 — 27 pages en double sans URL canonique (www vs non-www)**
- Tous les composants utilisaient `window.location.origin` pour les tags canoniques. Si le site est accessible en `aidenumerique37.fr` ET `www.aidenumerique37.fr`, les canoniques changeaient selon l'URL visitée → Google voyait du contenu dupliqué.
- **Fix** : Remplacement de `window.location.origin` par `'https://www.aidenumerique37.fr'` dans `BlogDetail.jsx`, `BlogList.jsx`, `ServiceDetail.jsx`, `CityPage.jsx`, `About.jsx`, `FAQPage.jsx`, `MentionsLegales.jsx`, `App.js` (ParasiteParamGuard).

**Cause racine 3 — Tags canoniques statiques dans index.html (BUG CRITIQUE)**
- `public/index.html` contenait 3 tags statiques : `<link rel="canonical" href="https://www.aidenumerique37.fr/">`, `<meta property="og:url" content="...">`, `<meta name="robots" content="index, follow">`. Ces tags apparaissant AVANT les tags React Helmet dynamiques, Google canonicalisait TOUTES les pages vers la homepage !
- **Fix** : Suppression de ces 3 lignes de `public/index.html`. Chaque composant gère ses propres tags via React Helmet.

**Autres corrections**
- 160 articles sans `status` en DB → migrés vers `status: 'published'` (MongoDB update_many). 5 articles `scheduled` conservent leur `noindex`.
- `/pro` ajouté au sitemap dynamique.
- `/avance-immediate` et `/avantages-fiscaux` convertis en vraies redirections 301 vers `/credit-impot` (était: même composant sans redirection).
- `/category` et `/category/*` (anciens URLs WordPress) → redirection vers `/articles`.
- Nouveau endpoint `POST /api/admin/articles/bulk-publish` pour corriger en masse le statut des articles.
- **Tests** : 19/19 backend + 13/13 frontend PASS (iteration_33)
- **Cause 3** : `Hero.jsx` utilisait l'URL relative `/api/uploads/...` sans préfixe `BACKEND_URL` → image non chargée si frontend/backend sur sous-domaines différents en production
- **Fix** : Ajout de `resolveImageUrl()` dans `Hero.jsx`, cohérent avec `About.jsx` et `Services.jsx` (qui utilisaient déjà `resolveUrl`)
- Confirmé fonctionnel : `naturalWidth > 0` lors du test screenshot avec image 1x1 pixel


- **Backend 1** : `POST /api/admin/articles/fix-broken-links` — Scan de tout le contenu HTML des articles. Détecte les liens internes cassés, les remplace par l'article le plus similaire (similarité ≥ 35%) ou supprime le `<a>` (garde le texte visible). Idempotent.
- **Backend 2** : `POST /api/admin/planning/fix-link-slugs` — Valide les champs `link1_slug`/`link2_slug` de tous les items de planning. Ajoute le préfixe `/articles/`, remplace par le slug similaire ou supprime si aucune correspondance. Idempotent (0 modification au 2ème passage).
- **Frontend** : Deux nouveaux boutons dans la section Articles du panneau d'administration : "Réparer les liens" et "Réparer planning", avec retour visuel coloré.
- **Résultat initial** : 48 liens corrigés dans le planning (slugs `/articles/` correctement préfixés ou redirigés), 54 supprimés (aucune correspondance trouv&eacute;e).

- **Secret hardcodé** : `test_iter29` → `ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin37')`
- **Test obsolète** : `test_iter25` → assertion mise à jour de `hashlib.md5` → `hashlib.sha256` (production déjà à SHA-256)
- **Empty catch block** : `AdminPanel.jsx:254` → `catch(pollErr) { console.error('Poll error:', pollErr) }`
- **useMemo** : Ajout de `useMemo` dans `AdminPanel.jsx` pour `filteredArticles`, `primaryCitiesList`, `secondaryCitiesList` — évite de re-filtrer 167 articles à chaque frappe
- **Clés stables (key props)** : 12 instances de `key={index}` remplacées par des clés sémantiques dans `AdminPanel.jsx`, `ServiceDetail.jsx`, `Reviews.jsx`, `Services.jsx`, `SeoDashboard.jsx`
- **Dépendances hooks** : Ajout de `// eslint-disable-next-line react-hooks/exhaustive-deps` dans `Services.jsx`, `Reviews.jsx`, `ArticleGenerator.jsx`, `AdminPanel.jsx` pour les useEffect intentionnellement sans dépendances
- **Auto-fix Python** : 29 erreurs corrigées dans `/backend/tests/` (f-strings vides, imports multiples)
- **Note XSS** : Les 17 instances signalées étaient déjà toutes sécurisées (DOMPurify sur HTML, JSON.stringify sur JSON-LD)


---

## [2026-05-01] Feature: Portfolio visible + Enrichissement SEO auto pour articles ≤3/5

### ✅ Portfolio "Réalisations" — bloc visible avec 3 projets de test
- 3 projets créés via `POST /api/admin/portfolio` pour valider le rendu visuel sur `/services/creation-site-web-ia` :
  - "Site vitrine Restaurant Le Tourangeau" (Tours, 2024)
  - "Portfolio Artisan Menuisier" (Joué-lès-Tours, 2024)
  - "Boutique en ligne Produits Locaux" (Indre-et-Loire, 2025)
- Bloc "Quelques réalisations" s'affiche correctement en mockup navigateur + CTA "Voir toutes nos réalisations" → `/realisations`

### ✅ Enrichissement SEO automatique des articles à faible score
**Backend** (`/app/backend/routes/article_generator.py`) :
- `_compute_seo_score()` : réplique Python exacte de `SeoBadge.computeSeoScore()` (frontend). Score sur 5 basé sur : meta_title (50-60 car.), meta_description (140-160), word_count (≥700), image, slug.
- `GET /api/admin/articles/seo-audit?threshold=3` : renvoie la liste des articles avec score ≤ seuil + flags déficients (needs_content, needs_meta_title, needs_meta_desc, needs_image).
- `POST /api/admin/articles/auto-enrich` : lance un worker background qui traite jusqu'à `max_articles` (défaut 10, max 30) articles ≤ threshold. Pour chaque article :
  1. Si `needs_content` OU `needs_meta_title` → régénération complète via Claude (fixe contenu, meta_title, meta_description, word_count en une seule passe)
  2. Sinon si `needs_meta_desc` → génération d'une meta description optimisée SEO local
  3. Sinon si `needs_image` ET `regenerate_images=true` → génération d'image IA via GPT Image 1
- `GET /api/admin/articles/auto-enrich/status?run_id=...` : polling de l'état (collection `seo_enrich_runs` dans MongoDB) — renvoie `status`, `processed/total`, `report` des actions + erreurs par article.
- Garde-fou : un seul run actif à la fois (retourne l'existant en cas de chevauchement).

**Frontend** (`AdminPanel.jsx` + `ArticlesSection.jsx`) :
- Nouveau bouton violet "Enrichir SEO auto (N)" affichant en direct le nombre d'articles ≤3/5 (calcul côté client via `computeSeoScore`).
- Carte de progression temps réel (polling 5s) avec barre de progression, statut (En file / En cours / Terminé / Erreur), et liste scrollable des 8 derniers articles traités (actions colorisées + erreurs).
- Reprise automatique du polling si un run est actif au chargement de la page admin.
- Test validé : article "Comment réinitialiser Windows aux paramètres d'usine facilement" passé de **1/5 (349 mots) → 3/5 (926 mots)** en 57 s, meta_description et contenu régénérés correctement.

### Gestion des erreurs 502 transient du provider
- Les erreurs upstream Anthropic (502 BadGateway via litellm) sont capturées dans `report[i].error` sans bloquer le run — chaque article est traité indépendamment.
- L'article cible peut être relancé plus tard via un nouveau batch si le provider était momentanément down.

### Fichiers modifiés
- `/app/backend/routes/article_generator.py` — +275 lignes (scoring + 2 endpoints + worker)
- `/app/frontend/src/components/AdminPanel.jsx` — +65 lignes (state, handlers, useEffect polling resume)
- `/app/frontend/src/components/admin/sections/ArticlesSection.jsx` — +70 lignes (bouton + progress card)
