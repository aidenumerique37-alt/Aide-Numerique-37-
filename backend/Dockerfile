# ── Stage 1 : Build React frontend ──────────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /frontend

# Contexte = racine du projet, donc frontend/ est accessible
COPY frontend/package.json frontend/yarn.lock* ./
RUN yarn install --frozen-lockfile --silent

COPY frontend/ .

# URL backend = même domaine en production (Hostinger reverse-proxy)
ENV REACT_APP_BACKEND_URL=https://www.aidenumerique37.fr

RUN yarn build

# ── Stage 2 : Backend FastAPI ────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Copie le build React au chemin attendu par le SPA fallback de server.py
# server.py: FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"
# = /app/../frontend/build = /frontend/build
COPY --from=frontend-build /frontend/build /frontend/build

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
