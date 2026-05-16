FROM python:3.11-slim

WORKDIR /app

# Dépendances Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code backend
COPY backend/ .

# Uploads (dossier persistant via volume Railway)
RUN mkdir -p /app/uploads

EXPOSE 8001

CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
