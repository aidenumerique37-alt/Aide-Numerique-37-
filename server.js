/**
 * server.js — Point d'entrée Node.js pour Hostinger
 *
 * Rôle : sert le build React (frontend/build/) en statique
 * et redirige tous les appels /api/* vers le backend Python
 * (uvicorn sur le port 8001, géré par PM2).
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8001';

// ── 1. Proxy /api/* → backend Python ────────────────────────────────────────
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
}));

// ── 2. Proxy /uploads/* → backend Python (images) ───────────────────────────
app.use('/uploads', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
}));

// ── 3. Proxy /sitemap.xml et /robots.txt → backend ──────────────────────────
app.use(['/sitemap.xml', '/robots.txt'], createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
}));

// ── 4. Fichiers statiques React ──────────────────────────────────────────────
const BUILD_DIR = path.join(__dirname, 'frontend', 'build');
app.use(express.static(BUILD_DIR));

// ── 5. SPA fallback : toutes les routes → index.html ─────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Node.js démarré sur le port ${PORT}`);
  console.log(`   Frontend : http://localhost:${PORT}`);
  console.log(`   Proxy API → ${BACKEND_URL}`);
});
