# Documentation API n8n - Aide Numérique 37

## 📋 Vue d'ensemble

Cette documentation vous permet d'intégrer votre workflow n8n existant (WordPress) avec l'API Emergent pour publier des articles de blog automatiquement.

## 🔗 URL de Base

```
https://votre-domaine.emergent.sh/api/articles
```

⚠️ **Important** : Remplacez `votre-domaine.emergent.sh` par l'URL réelle de votre application déployée sur Emergent.

## 📝 Créer un Article

### Endpoint
```
POST /api/articles
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Corps de la Requête (JSON)

```json
{
  "title": "Mon Titre d'Article",
  "content": "Le contenu complet de l'article...\n\nVous pouvez utiliser plusieurs paragraphes.",
  "slug": "mon-titre-article",
  "published": true
}
```

### Champs

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | ✅ Oui | Titre de l'article (2-200 caractères) |
| `content` | string | ✅ Oui | Contenu complet de l'article (minimum 1 caractère) |
| `slug` | string | ❌ Non | URL-friendly slug. Si non fourni, sera auto-généré depuis le titre |
| `published` | boolean | ❌ Non | État de publication (par défaut: `true`) |

### Réponse Succès (201 Created)

```json
{
  "_id": "67a1234567890abcdef12345",
  "title": "Mon Titre d'Article",
  "content": "Le contenu complet de l'article...",
  "slug": "mon-titre-article",
  "published": true,
  "created_at": "2025-01-30T14:30:00.000Z",
  "updated_at": "2025-01-30T14:30:00.000Z"
}
```

### Exemple cURL

```bash
curl -X POST https://votre-domaine.emergent.sh/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "5 Astuces pour Sécuriser Votre Ordinateur",
    "content": "La sécurité informatique est essentielle...\n\nVoici 5 astuces simples pour protéger votre ordinateur.",
    "published": true
  }'
```

## 📖 Récupérer Tous les Articles

### Endpoint
```
GET /api/articles
```

### Paramètres de Requête (optionnels)

| Paramètre | Type | Par défaut | Description |
|-----------|------|------------|-------------|
| `published_only` | boolean | `true` | Filtrer uniquement les articles publiés |
| `limit` | integer | `100` | Nombre maximum d'articles à retourner |

### Exemple

```bash
curl https://votre-domaine.emergent.sh/api/articles?published_only=true&limit=10
```

## 🔍 Récupérer un Article Spécifique

### Endpoint
```
GET /api/articles/{slug}
```

### Exemple

```bash
curl https://votre-domaine.emergent.sh/api/articles/mon-titre-article
```

## ✏️ Modifier un Article

### Endpoint
```
PUT /api/articles/{article_id}
```

### Corps de la Requête

Tous les champs sont optionnels. Seuls les champs fournis seront modifiés.

```json
{
  "title": "Nouveau Titre",
  "content": "Nouveau contenu...",
  "published": false
}
```

### Exemple

```bash
curl -X PUT https://votre-domaine.emergent.sh/api/articles/67a1234567890abcdef12345 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Titre Modifié",
    "content": "Contenu mis à jour..."
  }'
```

## 🗑️ Supprimer un Article

### Endpoint
```
DELETE /api/articles/{article_id}
```

### Réponse
```
Status: 204 No Content
```

### Exemple

```bash
curl -X DELETE https://votre-domaine.emergent.sh/api/articles/67a1234567890abcdef12345
```

## 🔧 Configuration n8n

### Adapter Votre Workflow WordPress

1. **Ouvrir votre workflow n8n**
2. **Trouver le nœud HTTP Request WordPress**
3. **Modifier les paramètres** :

   - **Method** : `POST`
   - **URL** : `https://votre-domaine.emergent.sh/api/articles`
   - **Headers** :
     ```
     Content-Type: application/json
     ```
   - **Body** (JSON) :
     ```json
     {
       "title": "{{ $json.title }}",
       "content": "{{ $json.content }}",
       "published": true
     }
     ```

### Exemple Workflow n8n Complet

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Trigger   │────▶│  Process     │────▶│  HTTP Request   │
│  (Webhook)  │     │  (Transform) │     │  (Create Post)  │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                                          POST /api/articles
                                          {
                                            "title": "...",
                                            "content": "..."
                                          }
```

## 🔐 Sécurité (Optionnel - Pour Plus Tard)

Actuellement, l'API est ouverte. Pour ajouter une couche de sécurité :

1. Ajouter une authentification par token
2. Créer un middleware de validation
3. Limiter les requêtes par IP

Je peux vous aider à implémenter cela si nécessaire.

## ❓ Gestion des Erreurs

### Codes de Réponse

| Code | Signification |
|------|---------------|
| `200` | Succès (GET, PUT) |
| `201` | Créé (POST) |
| `204` | Supprimé (DELETE) |
| `400` | Requête invalide |
| `404` | Article non trouvé |
| `500` | Erreur serveur |

### Exemple d'Erreur

```json
{
  "detail": "Error creating article: Invalid field"
}
```

## 🎯 Cas d'Usage Typiques

### 1. Publication Automatique depuis RSS
```
RSS Feed → n8n → API Emergent
```

### 2. Publication Planifiée
```
Google Sheets → n8n Schedule → API Emergent
```

### 3. Publication depuis Email
```
Gmail Trigger → n8n → API Emergent
```

## 📊 Exemple Complet : Workflow n8n

```json
{
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "https://votre-domaine.emergent.sh/api/articles",
        "options": {
          "headers": {
            "Content-Type": "application/json"
          }
        },
        "body": {
          "title": "={{ $json.title }}",
          "content": "={{ $json.content }}",
          "published": true
        }
      },
      "name": "Create Blog Post",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que votre URL Emergent est correcte
2. Vérifiez que le backend est démarré
3. Consultez les logs backend : `/var/log/supervisor/backend.out.log`

## 📝 Notes Importantes

- **Slug auto-généré** : Si vous ne fournissez pas de slug, il sera créé automatiquement depuis le titre en supprimant les accents et espaces
- **Format du contenu** : Utilisez `\n` pour les sauts de ligne dans le contenu
- **Limite de caractères** : Titre max 200 caractères, pas de limite pour le contenu
- **Langues** : Le système supporte parfaitement les accents français

## 🚀 Prochaines Étapes

1. Déployez votre application sur Emergent
2. Notez votre URL de déploiement
3. Remplacez l'URL WordPress dans votre workflow n8n
4. Testez avec un article de test
5. Activez votre workflow !

---

**Besoin d'aide ?** Contactez-moi ou consultez la documentation Emergent.
