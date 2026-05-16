# Déploiement sur Hostinger VPS

## Prérequis sur le serveur
- Ubuntu 22.04 LTS (ou Debian 12)
- Docker + Docker Compose installés
- Ports 80 et 443 ouverts
- Nom de domaine `aidenumerique37.fr` pointant sur l'IP du VPS

---

## Étapes de déploiement

### 1. Copier le projet sur le serveur

```bash
# Depuis votre Mac
scp -r "/Users/sessionadmin/Desktop/Site-web-Aide Numérique 37" user@IP_SERVEUR:/home/user/aidenumerique37
```

Ou via Git si le projet est sur GitHub :
```bash
git clone https://github.com/votre-repo.git /home/user/aidenumerique37
```

---

### 2. Configurer le fichier .env

```bash
cd /home/user/aidenumerique37/backend
cp .env.production .env
# Vérifier le contenu :
cat .env
```

---

### 3. Transférer les uploads (images)

```bash
# Depuis votre Mac
scp -r "/Users/sessionadmin/Desktop/Site-web-Aide Numérique 37/uploads" user@IP_SERVEUR:/home/user/aidenumerique37/
```

---

### 4. Lancer Docker Compose

```bash
cd /home/user/aidenumerique37

# Build et démarrage (première fois : ~5 min pour builder le frontend)
docker compose up -d --build

# Vérifier que les conteneurs tournent
docker compose ps

# Logs en direct
docker compose logs -f backend
```

---

### 5. Seeder la base de données (PREMIÈRE FOIS UNIQUEMENT)

```bash
# Attendre que le backend soit prêt (~30s)
sleep 30

# Lancer le seed
docker compose exec backend python3 seed.py
```

Sortie attendue :
```
🔌 Connected to mongodb://mongo:27017/aidenumerique37
  ✅ articles: 164 insérés
  ✅ services: 8 insérés
  ✅ city_pages: 3 insérés
  ...
🎉 Seed terminé.
```

---

### 6. Configurer le reverse proxy Nginx (HTTPS)

Installer Nginx + Certbot :
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Créer la config Nginx `/etc/nginx/sites-available/aidenumerique37` :
```nginx
server {
    listen 80;
    server_name aidenumerique37.fr www.aidenumerique37.fr;
    return 301 https://www.aidenumerique37.fr$request_uri;
}

server {
    listen 443 ssl;
    server_name www.aidenumerique37.fr;

    # SSL (généré par Certbot)
    ssl_certificate     /etc/letsencrypt/live/www.aidenumerique37.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.aidenumerique37.fr/privkey.pem;

    # Taille max upload (images)
    client_max_body_size 20M;

    # Proxy vers le backend FastAPI (qui sert aussi le React)
    location / {
        proxy_pass         http://127.0.0.1:8001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Activer et générer le certificat SSL :
```bash
sudo ln -s /etc/nginx/sites-available/aidenumerique37 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Générer le certificat Let's Encrypt (GRATUIT)
sudo certbot --nginx -d aidenumerique37.fr -d www.aidenumerique37.fr
sudo systemctl reload nginx
```

---

### 7. Vérifier que tout fonctionne

```bash
# Health check API
curl https://www.aidenumerique37.fr/api/health
# Attendu : {"status":"ok","db":"connected"}

# Test frontend
curl -I https://www.aidenumerique37.fr
# Attendu : HTTP/2 200
```

---

## Commandes utiles en production

```bash
# Redémarrer le backend
docker compose restart backend

# Voir les logs
docker compose logs -f backend

# Mettre à jour après modification du code
docker compose up -d --build backend

# Backup MongoDB
docker compose exec mongo mongodump --db aidenumerique37 --out /dump
docker compose cp mongo:/dump ./backup_$(date +%Y%m%d)

# Restaurer un backup
docker compose exec mongo mongorestore --db aidenumerique37 /dump/aidenumerique37
```

---

## Récapitulatif des URLs

| URL | Description |
|-----|-------------|
| `https://www.aidenumerique37.fr` | Site public |
| `https://www.aidenumerique37.fr/admin` | Panneau admin (mot de passe : `admin37`) |
| `https://www.aidenumerique37.fr/api/health` | Health check |

---

## Notes importantes

- **SMTP** : Le mot de passe est en clair dans `.env`. Ce fichier ne doit jamais être commité sur Git (déjà dans `.gitignore`).
- **MongoDB** : Exposé uniquement sur `127.0.0.1` (pas accessible depuis Internet).
- **Uploads** : Montés via le volume Docker `./uploads:/app/uploads`. Ils survivent aux redéploiements.
- **Seed** : Ne lancer `seed.py` qu'une seule fois. Il vérifie les collections avant d'insérer.
