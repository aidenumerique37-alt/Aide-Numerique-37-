# Debug Articles - Production vs Preview

## Situation Actuelle

- ✅ **Preview** : Fonctionne parfaitement
- ❌ **Production** : "Impossible de charger les articles"

## Causes Possibles

### 1. URL Backend Différente en Production

**Question** : Quelle est l'URL de votre site en production ?
- Est-ce `aidenumerique37.fr` ou une autre ?
- L'URL backend est-elle différente en production ?

### 2. Variable d'environnement manquante en production

Le build de production n'a peut-être pas accès à `REACT_APP_BACKEND_URL`

**Solution** : Utiliser l'URL dynamique basée sur l'origine

```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
                    (window.location.hostname === 'localhost' 
                      ? 'http://localhost:8001' 
                      : window.location.origin);
```

### 3. Build React non mis à jour

Les variables d'environnement React sont injectées au moment du BUILD, pas au runtime.

**Solution** : Rebuild le frontend en production

### 4. Configuration CORS en production

Le backend accepte-t-il les requêtes depuis le domaine de production ?

## Solutions Immédiates

### Solution 1: URL Dynamique Intelligente (RECOMMANDÉ)

Je vais modifier le code pour qu'il détecte automatiquement la bonne URL :

```javascript
const getBackendUrl = () => {
  // En développement/preview
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // En production, utiliser la même origine
  return window.location.origin;
};

const BACKEND_URL = getBackendUrl();
```

### Solution 2: Chemin Relatif

Utiliser un chemin relatif au lieu d'une URL absolue :

```javascript
const BACKEND_URL = ''; // Chemin relatif, même domaine
// Appel devient : axios.get('/api/articles/')
```

### Solution 3: Vérifier dans la Console du Navigateur

Sur le site de production, ouvrez la console (F12) et regardez :

1. **Erreur réseau ?**
   - `Failed to fetch` = problème CORS ou réseau
   - `404 Not Found` = URL incorrecte
   - `500 Internal Server Error` = problème backend

2. **Quelle URL est appelée ?**
   - Regardez dans l'onglet Network
   - Quelle URL apparaît pour `/api/articles/` ?

## Action Requise de Votre Part

**Pouvez-vous me dire :**

1. Quelle est l'URL de votre site en production ? (ex: https://aidenumerique37.fr)
2. En ouvrant la console (F12) sur la page Articles en production, voyez-vous des erreurs ?
3. Dans l'onglet Network, quelle URL est appelée quand vous chargez /articles ?

**En attendant, je vais appliquer Solution 1 (URL Dynamique) qui devrait résoudre le problème.**
