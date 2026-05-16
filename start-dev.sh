#!/bin/bash
# Script de démarrage en développement local
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Démarrage Aide Numérique 37 en mode développement"
echo ""

# Vérifier MongoDB
if ! command -v mongod &>/dev/null && ! docker ps 2>/dev/null | grep -q mongo; then
  echo "⚠️  MongoDB non détecté. Options :"
  echo "   1. Installer MongoDB : https://www.mongodb.com/try/download/community"
  echo "   2. Utiliser Docker : docker run -d -p 27017:27017 mongo:7"
  echo ""
fi

# Backend
echo "📦 Installation des dépendances Python..."
cd "$ROOT/backend"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "🔧 Démarrage du backend FastAPI sur http://localhost:8001"
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# Frontend
echo ""
echo "📦 Installation des dépendances Node.js..."
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  yarn install
fi

echo ""
echo "⚛️  Démarrage du frontend React sur http://localhost:3000"
yarn start &
FRONTEND_PID=$!

echo ""
echo "✅ Les deux serveurs sont lancés !"
echo "   Frontend : http://localhost:3000"
echo "   Backend  : http://localhost:8001"
echo "   Admin    : http://localhost:3000/admin (mot de passe : admin37)"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
