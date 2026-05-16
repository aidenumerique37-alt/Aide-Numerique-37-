# Configuration WordPress pour Aide Numérique 37

## Problème Actuel

L'API WordPress à l'URL `https://www.aidenumerique37.fr/wp-json/wp/v2/posts` ne retourne pas de données JSON valides actuellement.

## Diagnostic

L'API retourne du HTML au lieu de JSON, ce qui indique un des problèmes suivants:

### 1. **Permaliens WordPress non configurés**
   - Allez dans **Réglages > Permaliens** dans WordPress
   - Assurez-vous que les permaliens sont configurés (ex: "Nom de l'article")
   - Cliquez sur "Enregistrer" même si rien n'a changé

### 2. **Fichier .htaccess manquant ou incorrect**
   - Le fichier `.htaccess` à la racine du site doit contenir les règles de réécriture WordPress
   - Vérifiez que le fichier existe et contient les règles par défaut WordPress

### 3. **Plugin de sécurité bloquant l'API REST**
   - Certains plugins de sécurité (iThemes Security, Wordfence, etc.) peuvent bloquer l'API REST
   - Vérifiez les paramètres du plugin de sécurité
   - Assurez-vous que l'API REST est activée

### 4. **Thème ou plugin cassant l'API**
   - Désactivez temporairement les plugins pour identifier le coupable
   - Testez avec un thème par défaut (Twenty Twenty-Four)

## Solution Temporaire - Utilisation de n8n

En attendant la résolution du problème WordPress, vous pouvez utiliser n8n pour publier des articles directement dans la base de données.

### Option A: API Direct MongoDB (Recommandé)

Je peux réactiver l'API MongoDB d'origine qui permet:
- POST /api/articles - Créer un article
- PUT /api/articles/{id} - Modifier un article  
- DELETE /api/articles/{id} - Supprimer un article

Votre workflow n8n existant peut être adapté pour pointer vers cette API au lieu de WordPress.

### Option B: Sync WordPress → Base de données

Je peux créer un script qui:
1. Fetch les articles depuis WordPress quand l'API fonctionne
2. Les stocke dans MongoDB
3. Le frontend affiche depuis MongoDB

## Tests à effectuer

### Test 1: API REST disponible
```bash
curl -I https://www.aidenumerique37.fr/wp-json/wp/v2/posts
```
Résultat attendu: `HTTP/2 200` avec `Content-Type: application/json`

### Test 2: Récupérer des articles
```bash
curl -H "Accept: application/json" "https://www.aidenumerique37.fr/wp-json/wp/v2/posts?per_page=1"
```
Résultat attendu: JSON array avec au moins un article

### Test 3: Vérifier les permaliens
1. Aller sur https://www.aidenumerique37.fr/wp-admin/options-permalink.php
2. Sélectionner "Nom de l'article" ou structure personnalisée
3. Cliquer "Enregistrer les modifications"

## État Actuel du Backend

Le backend est configuré pour:
- ✅ Titre et favicon du site configurés
- ✅ Backend prêt à récupérer depuis WordPress
- ⚠️ Attend que l'API WordPress retourne du JSON valide

## Prochaines Étapes

**Choisissez une option:**

1. **Réparer WordPress** (recommandé si vous voulez gérer les articles depuis WordPress)
   - Suivez les étapes de diagnostic ci-dessus
   - Testez l'API REST
   
2. **Utiliser l'API MongoDB directe** (rapide à mettre en place)
   - Je réactive l'API MongoDB
   - Vous utilisez n8n pour publier directement
   - Plus de contrôle depuis le code

3. **Hybride** 
   - Gardez WordPress pour la création
   - Sync automatique vers MongoDB
   - Affichage depuis MongoDB

**Quelle option préférez-vous ?**
