import os, uuid, re, json, hashlib, shutil, asyncio
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List, Any, Dict

from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Query, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import httpx
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from passlib.context import CryptContext
from jose import jwt, JWTError

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
MONGO_URL            = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME              = os.getenv("DB_NAME", "aidenumerique37")
ADMIN_PASSWORD       = os.getenv("ADMIN_PASSWORD", "admin37")
ADMIN_PASSWORD_HASH  = os.getenv("ADMIN_PASSWORD_HASH", "")
JWT_SECRET_KEY       = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
JWT_ALGORITHM        = "HS256"
JWT_EXPIRE_HOURS     = 24
SMTP_HOST            = os.getenv("SMTP_HOST", "smtp.hostinger.com")
SMTP_PORT      = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER      = os.getenv("SMTP_USER", "")
SMTP_PASS      = os.getenv("SMTP_PASS", "")
CONTACT_EMAIL  = os.getenv("CONTACT_EMAIL", "contact@aidenumerique37.fr")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_PLACE_ID= os.getenv("GOOGLE_PLACE_ID", "")
WP_BASE_URL    = os.getenv("WP_BASE_URL", "https://www.aidenumerique37.fr")
SITE_URL       = os.getenv("SITE_URL", "https://www.aidenumerique37.fr")
UPLOADS_DIR    = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Aide Numérique 37 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB ────────────────────────────────────────────────────────────────────────
client: AsyncIOMotorClient = None
db = None

@app.on_event("startup")
async def startup():
    global client, db
    mongo_host = MONGO_URL[:40] if MONGO_URL else "NOT SET"
    print(f"[db] MONGO_URL starts with: {mongo_host}")
    print(f"[db] Connecting to MongoDB...")
    try:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=10000)
        await client.admin.command("ping")
        db = client[DB_NAME]
        print("[db] Connected to MongoDB Atlas ✓")
    except Exception as e:
        print(f"[db] MongoDB connection FAILED: {e}")
        raise RuntimeError(f"Cannot connect to MongoDB: {e}")
    await _seed_db_if_empty()
    _start_scheduler()

@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()

# ── Seed DB from exported JSON ─────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"

async def _seed_db_if_empty():
    list_collections = {
        "articles":   "articles.json",
        "services":   "services.json",
        "cities":     "cities.json",
        "partners":   "partners.json",
        "city_pages": "city_pages.json",
        "portfolio":  "portfolio.json",
    }
    for col, fname in list_collections.items():
        count = await db[col].count_documents({})
        if count == 0:
            fpath = DATA_DIR / fname
            if fpath.exists():
                data = json.loads(fpath.read_text(encoding="utf-8"))
                if isinstance(data, list) and data:
                    # Ensure all elements are plain dicts
                    docs = [d if isinstance(d, dict) else {"value": d} for d in data]
                    await db[col].insert_many(docs)
                    print(f"[seed] {col}: {len(docs)} documents")

    # Seed partner categories (stored as single doc with items array)
    if not await db["partner_categories"].find_one({"_id": "categories"}):
        fpath = DATA_DIR / "partner_categories.json"
        if fpath.exists():
            cats = json.loads(fpath.read_text(encoding="utf-8"))
            items = [c for c in cats if isinstance(c, str) and not c.startswith("TEST") and not c.startswith("Duplicate")]
            await db["partner_categories"].insert_one({"_id": "categories", "items": items})
            print(f"[seed] partner_categories: {len(items)} items")

    # Seed site content
    if not await db["site_content"].find_one({"_id": "main"}):
        fpath = DATA_DIR / "content.json"
        if fpath.exists():
            data = json.loads(fpath.read_text(encoding="utf-8"))
            data["_id"] = "main"
            await db["site_content"].insert_one(data)
            print("[seed] site_content: 1 document")

# ── APScheduler ───────────────────────────────────────────────────────────────
def _start_scheduler():
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler(timezone="Europe/Paris")
        scheduler.add_job(_sync_wordpress_task, "cron", hour=3, minute=0, id="wp_sync")
        scheduler.start()
        print("[scheduler] WordPress sync scheduled at 03:00 Paris time")
    except Exception as e:
        print(f"[scheduler] Could not start: {e}")

# ── Auth ──────────────────────────────────────────────────────────────────────
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _verify_password(plain: str) -> bool:
    if ADMIN_PASSWORD_HASH:
        return _pwd_context.verify(plain, ADMIN_PASSWORD_HASH)
    return plain == ADMIN_PASSWORD

def _create_token() -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": "admin", "exp": exp}, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def _check_admin(authorization: Optional[str]):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        scheme, token = authorization.split(" ", 1)
        if scheme.lower() != "bearer":
            raise ValueError()
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("sub") != "admin":
            raise ValueError()
    except (JWTError, ValueError, AttributeError):
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Helpers ───────────────────────────────────────────────────────────────────

def _slug(text: str) -> str:
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text

def _strip_mongo(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC ROUTES
# ══════════════════════════════════════════════════════════════════════════════

# ── Public settings (GA tracking ID, etc.) ────────────────────────────────────
@app.get("/api/settings")
async def get_public_settings():
    """Returns only non-sensitive public config (e.g. GA tracking ID)."""
    doc = await db["site_content"].find_one({"_id": "main"})
    return {
        "ga_tracking_id": (doc or {}).get("ga_tracking_id", ""),
    }

# ── Articles (public) ─────────────────────────────────────────────────────────
@app.get("/api/articles")
async def get_articles(
    published_only: bool = True,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    query: Dict[str, Any] = {}
    if published_only:
        # Articles visibles : published, null/absent (WordPress cachés), mais PAS scheduled/draft
        query["status"] = {"$nin": ["scheduled", "draft"]}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}},
        ]

    cursor = db["articles"].find(query, {"content_html": 0}).sort("date_published", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [_strip_mongo(d) for d in docs]


@app.get("/api/articles/{slug}")
async def get_article(slug: str):
    doc = await db["articles"].find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return _strip_mongo(doc)


# ── Services (public) ─────────────────────────────────────────────────────────
@app.get("/api/services")
async def get_services_public():
    cursor = db["services"].find({}).sort("order", 1)
    docs = await cursor.to_list(length=100)
    return [_strip_mongo(d) for d in docs]


@app.get("/api/services/{slug}")
async def get_service_public(slug: str):
    doc = await db["services"].find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Service not found")
    return _strip_mongo(doc)


# ── Portfolio (public) ────────────────────────────────────────────────────────
@app.get("/api/portfolio")
async def get_portfolio_public():
    cursor = db["portfolio"].find({}).sort("order", 1)
    docs = await cursor.to_list(length=100)
    return [_strip_mongo(d) for d in docs]


# ── City pages (public) ───────────────────────────────────────────────────────
@app.get("/api/cities/pages/{slug}")
async def get_city_page(slug: str):
    doc = await db["city_pages"].find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="City page not found")
    return _strip_mongo(doc)


# ── Reviews ───────────────────────────────────────────────────────────────────
_reviews_cache: Dict = {"data": None, "ts": 0}

@app.get("/api/reviews/google")
async def get_google_reviews():
    import time
    if _reviews_cache["data"] and time.time() - _reviews_cache["ts"] < 3600:
        return _reviews_cache["data"]

    if not GOOGLE_API_KEY or not GOOGLE_PLACE_ID:
        return {"rating": 5.0, "total_ratings": 0, "reviews": []}

    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                params={"place_id": GOOGLE_PLACE_ID, "fields": "rating,reviews,user_ratings_total", "key": GOOGLE_API_KEY},
                timeout=10,
            )
            data = r.json().get("result", {})
            reviews = data.get("reviews", [])
            result = {
                "rating": data.get("rating", 0),
                "total_ratings": data.get("user_ratings_total", 0),
                "reviews": reviews[:5],
            }
            _reviews_cache["data"] = result
            _reviews_cache["ts"] = time.time()
            return result
    except Exception as e:
        return {"rating": 0, "total_ratings": 0, "reviews": [], "error": str(e)}


# ── Contact ───────────────────────────────────────────────────────────────────
class ContactForm(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: Optional[str] = ""
    message: str

@app.post("/api/contact/send")
async def send_contact(form: ContactForm):
    if not SMTP_USER or not SMTP_PASS:
        raise HTTPException(status_code=503, detail="SMTP not configured")
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Aide Numérique 37] {form.subject or 'Nouveau message'}"
        msg["From"]    = SMTP_USER
        msg["To"]      = CONTACT_EMAIL
        msg["Reply-To"]= form.email

        body = f"""Nouveau message depuis le site web\n\nNom : {form.name}\nEmail : {form.email}\nTéléphone : {form.phone or 'Non renseigné'}\nSujet : {form.subject or 'Non renseigné'}\n\nMessage :\n{form.message}"""
        html = f"""<html><body><h2>Nouveau message depuis le site web</h2><table><tr><td><b>Nom</b></td><td>{form.name}</td></tr><tr><td><b>Email</b></td><td><a href="mailto:{form.email}">{form.email}</a></td></tr><tr><td><b>Téléphone</b></td><td>{form.phone or 'Non renseigné'}</td></tr><tr><td><b>Sujet</b></td><td>{form.subject or 'Non renseigné'}</td></tr></table><h3>Message</h3><p>{form.message.replace(chr(10), '<br>')}</p></body></html>"""

        msg.attach(MIMEText(body, "plain", "utf-8"))
        msg.attach(MIMEText(html, "html", "utf-8"))

        await aiosmtplib.send(msg, hostname=SMTP_HOST, port=SMTP_PORT, use_tls=True, username=SMTP_USER, password=SMTP_PASS)
        return {"success": True, "message": "Message envoyé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email : {str(e)}")


# ── Static uploads — served from MongoDB (persistent) ─────────────────────────
@app.get("/api/uploads/{filename}")
async def serve_upload(filename: str):
    # Try MongoDB first (persistent storage)
    doc = await db["media"].find_one({"filename": filename})
    if doc and doc.get("data_b64"):
        import base64
        data = base64.b64decode(doc["data_b64"])
        mime = doc.get("mime", "application/octet-stream")
        return Response(content=data, media_type=mime)
    # Fallback: filesystem (local dev)
    path = UPLOADS_DIR / filename
    if path.exists():
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="File not found")


# ── Sitemap ───────────────────────────────────────────────────────────────────
@app.get("/sitemap.xml")
async def sitemap():
    articles = await db["articles"].find({"status": "published"}, {"slug": 1, "date_modified": 1}).to_list(length=1000)
    services = await db["services"].find({}, {"slug": 1}).to_list(length=100)
    city_pages = await db["city_pages"].find({}, {"slug": 1}).to_list(length=500)

    urls = [
        f"<url><loc>{SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        f"<url><loc>{SITE_URL}/articles</loc><changefreq>daily</changefreq><priority>0.9</priority></url>",
        f"<url><loc>{SITE_URL}/a-propos</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>",
        f"<url><loc>{SITE_URL}/credit-impot</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>",
        f"<url><loc>{SITE_URL}/pro</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>",
        f"<url><loc>{SITE_URL}/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>",
        f"<url><loc>{SITE_URL}/realisations</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>",
        f"<url><loc>{SITE_URL}/mentions-legales</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>",
        f"<url><loc>{SITE_URL}/cgv</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>",
        f"<url><loc>{SITE_URL}/politique-de-confidentialite</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>",
    ]
    for s in services:
        urls.append(f"<url><loc>{SITE_URL}/services/{s['slug']}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>")
    for a in articles:
        mod = a.get("date_modified", "")[:10] or ""
        lastmod = f"<lastmod>{mod}</lastmod>" if mod else ""
        urls.append(f"<url><loc>{SITE_URL}/articles/{a['slug']}</loc>{lastmod}<changefreq>monthly</changefreq><priority>0.7</priority></url>")
    for cp in city_pages:
        urls.append(f"<url><loc>{SITE_URL}/intervention/{cp['slug']}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>")

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>"
    return Response(content=xml, media_type="application/xml")


@app.get("/robots.txt")
async def robots():
    content = f"User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: {SITE_URL}/sitemap.xml\n"
    return Response(content=content, media_type="text/plain")


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN AUTH MIDDLEWARE
# ══════════════════════════════════════════════════════════════════════════════

def _admin(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)


@app.post("/api/admin/login")
async def admin_login(data: dict):
    password = data.get("password", "")
    if not _verify_password(password):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    return {"token": _create_token()}


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC — LEGAL PAGES
# ══════════════════════════════════════════════════════════════════════════════

_LEGAL_DEFAULTS: Dict[str, Dict[str, str]] = {
    "mentions-legales": {
        "title": "Mentions Légales",
        "content_html": """<p><em>Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site aidenumerique37.fr les présentes mentions légales.</em></p>

<h2>Éditeur du site</h2>
<p>
  <strong>Aide Numérique 37</strong><br>
  Micro-entreprise — Pierrick [nom de famille]<br>
  5 rue James Pradier, 37300 Joué-lès-Tours<br>
  <strong>SIRET :</strong> 904 963 659 00035<br>
  <strong>Téléphone :</strong> 07 61 50 35 85<br>
  <strong>E-mail :</strong> <a href="mailto:aidenumerique37@gmail.com">aidenumerique37@gmail.com</a>
</p>

<h2>Hébergeur</h2>
<p>
  <strong>Hostinger International Ltd</strong><br>
  61 Lordou Vironos Street, 6023 Larnaca, Chypre<br>
  <strong>Contact :</strong> <a href="https://www.hostinger.fr/contact" target="_blank" rel="noopener noreferrer">https://www.hostinger.fr/contact</a>
</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus présents sur le site aidenumerique37.fr (textes, images, logos) est la propriété exclusive d'Aide Numérique 37, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>

<h2>Données personnelles — RGPD</h2>
<p><strong>Responsable du traitement :</strong> Aide Numérique 37 — <a href="mailto:aidenumerique37@gmail.com">aidenumerique37@gmail.com</a></p>
<p><strong>Données collectées :</strong></p>
<ul>
  <li><strong>Via le formulaire de contact :</strong> nom, adresse e-mail, message. Ces données sont utilisées uniquement pour répondre à votre demande et ne sont pas transmises à des tiers.</li>
  <li><strong>Via Google Analytics :</strong> données de navigation anonymisées (pages visitées, durée de session, provenance). Google Analytics utilise des cookies tiers. Pour en savoir plus : <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
</ul>
<p><strong>Durée de conservation :</strong> Les données du formulaire sont conservées le temps nécessaire au traitement de la demande.</p>
<p><strong>Vos droits :</strong> Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer : <a href="mailto:aidenumerique37@gmail.com">aidenumerique37@gmail.com</a></p>

<h2>Cookies</h2>
<p>Ce site n'utilise pas de cookies publicitaires. Google Analytics dépose des cookies de mesure d'audience. Vous pouvez vous y opposer via l'extension <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a>.</p>

<h2>Droit applicable</h2>
<p>Le présent site est soumis au droit français. Tout litige relève de la compétence exclusive des tribunaux du ressort de Tours.</p>"""
    },
    "cgv": {
        "title": "Conditions Générales de Vente",
        "content_html": """<h2>1. Objet</h2>
<p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Aide Numérique 37 (ci-après « le Prestataire ») et ses clients (ci-après « le Client ») dans le cadre des prestations d'assistance informatique à domicile.</p>

<h2>2. Prestations proposées</h2>
<p>Le Prestataire propose les services suivants :</p>
<ul>
<li>Assistance et dépannage informatique à domicile</li>
<li>Formation numérique personnalisée</li>
<li>Installation et configuration de matériel</li>
<li>Sécurisation des appareils</li>
<li>Création de sites internet</li>
</ul>

<h2>3. Tarifs</h2>
<p>Les tarifs sont communiqués au Client avant toute intervention. Ils sont exprimés en euros TTC. Aide Numérique 37 est assujetti à la TVA selon les règles en vigueur.</p>
<p>En tant que Service à la Personne agréé, les prestations ouvrent droit à un <strong>crédit d'impôt de 50%</strong> pour les particuliers, dans la limite des plafonds légaux.</p>

<h2>4. Modalités de paiement</h2>
<p>Le règlement s'effectue en fin de prestation, par espèces, virement bancaire ou chèque. Une facture est remise au Client à l'issue de chaque intervention.</p>

<h2>5. Délai d'intervention</h2>
<p>Le Prestataire s'engage à intervenir dans les meilleurs délais selon ses disponibilités. Un rendez-vous est fixé d'un commun accord avec le Client.</p>

<h2>6. Responsabilité</h2>
<p>Le Prestataire est tenu à une obligation de moyens. Sa responsabilité ne saurait être engagée en cas de perte de données, de dommages préexistants ou résultant d'une utilisation inappropriée du matériel par le Client.</p>
<p>Il est fortement recommandé au Client d'effectuer des sauvegardes de ses données avant toute intervention.</p>

<h2>7. Droit de rétractation</h2>
<p>Conformément à l'article L221-28 du Code de la Consommation, le droit de rétractation ne s'applique pas aux contrats de prestations de services pleinement exécutées avant la fin du délai de rétractation, lorsque l'exécution a commencé avec l'accord exprès du consommateur.</p>

<h2>8. Données personnelles</h2>
<p>Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion des prestations. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant : aidenumerique37@gmail.com</p>

<h2>9. Litiges</h2>
<p>En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux d'Indre-et-Loire seront compétents.</p>

<h2>10. Loi applicable</h2>
<p>Les présentes CGV sont régies par le droit français.</p>"""
    },
    "confidentialite": {
        "title": "Politique de Confidentialité",
        "content_html": """<h2>1. Introduction</h2>
<p>Aide Numérique 37 accorde une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD) — Règlement (UE) 2016/679.</p>

<h2>2. Responsable du traitement</h2>
<p><strong>Responsable :</strong> Pierrick Le Penru — Aide Numérique 37<br>
<strong>Adresse :</strong> Joué-lès-Tours, 37300, Indre-et-Loire<br>
<strong>Email :</strong> aidenumerique37@gmail.com<br>
<strong>Téléphone :</strong> 07 61 50 35 85</p>

<h2>3. Données collectées</h2>
<p>Nous collectons uniquement les données que vous nous transmettez volontairement via le formulaire de contact :</p>
<ul>
<li>Nom et prénom</li>
<li>Adresse email</li>
<li>Numéro de téléphone (optionnel)</li>
<li>Message</li>
</ul>
<p>Aucune donnée de navigation n'est collectée (pas de cookies de tracking, pas d'analytics tiers).</p>

<h2>4. Finalité du traitement</h2>
<p>Les données collectées sont utilisées exclusivement pour :</p>
<ul>
<li>Répondre à vos demandes de contact</li>
<li>Organiser et confirmer les interventions</li>
<li>Établir les devis et factures</li>
</ul>

<h2>5. Base légale</h2>
<p>Le traitement de vos données repose sur votre consentement exprès (formulaire de contact) et sur l'exécution du contrat de prestation.</p>

<h2>6. Durée de conservation</h2>
<p>Vos données sont conservées pendant la durée nécessaire à la réalisation des prestations, augmentée de la durée légale de conservation des documents comptables (10 ans pour les factures).</p>

<h2>7. Destinataires des données</h2>
<p>Vos données ne sont ni vendues, ni cédées, ni partagées avec des tiers à des fins commerciales. Elles peuvent être transmises à des prestataires techniques strictement nécessaires (hébergeur) dans le cadre de leurs obligations contractuelles de confidentialité.</p>

<h2>8. Vos droits</h2>
<p>Conformément au RGPD, vous disposez des droits suivants :</p>
<ul>
<li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
<li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
<li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
<li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
<li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
</ul>
<p>Pour exercer ces droits, contactez-nous à : <strong>aidenumerique37@gmail.com</strong></p>
<p>En cas de réclamation, vous pouvez saisir la CNIL : <a href="https://www.cnil.fr">www.cnil.fr</a></p>

<h2>9. Sécurité</h2>
<p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.</p>

<h2>10. Cookies</h2>
<p>Ce site utilise uniquement des cookies techniques strictement nécessaires à son fonctionnement (mémorisation de votre préférence de thème). Aucun cookie publicitaire ou de traçage n'est déposé.</p>

<h2>11. Modifications</h2>
<p>Cette politique de confidentialité peut être mise à jour. La date de dernière modification est indiquée en bas de page. Nous vous encourageons à la consulter régulièrement.</p>

<p><em>Dernière mise à jour : mai 2026</em></p>"""
    },
}

@app.get("/api/legal/{page_type}")
async def get_legal_page(page_type: str):
    valid = {"mentions-legales", "cgv", "confidentialite"}
    if page_type not in valid:
        raise HTTPException(status_code=404, detail="Page introuvable")
    doc = await db["legal_pages"].find_one({"_id": page_type})
    if doc:
        doc.pop("_id", None)
        return doc
    # Return defaults if not yet saved
    return _LEGAL_DEFAULTS.get(page_type, {})


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — LEGAL PAGES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/legal/{page_type}")
async def admin_get_legal(page_type: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    valid = {"mentions-legales", "cgv", "confidentialite"}
    if page_type not in valid:
        raise HTTPException(status_code=404, detail="Page introuvable")
    doc = await db["legal_pages"].find_one({"_id": page_type})
    if doc:
        doc.pop("_id", None)
        return doc
    return _LEGAL_DEFAULTS.get(page_type, {})


@app.put("/api/admin/legal/{page_type}")
async def admin_save_legal(page_type: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    valid = {"mentions-legales", "cgv", "confidentialite"}
    if page_type not in valid:
        raise HTTPException(status_code=404, detail="Page introuvable")
    data.pop("_id", None)
    data["updated_at"] = _now()
    await db["legal_pages"].update_one({"_id": page_type}, {"$set": data}, upsert=True)
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — CONTENT
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/content")
async def admin_get_content():
    doc = await db["site_content"].find_one({"_id": "main"})
    if not doc:
        return {}
    doc.pop("_id", None)
    return doc


@app.put("/api/admin/content")
async def admin_put_content(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    await db["site_content"].update_one({"_id": "main"}, {"$set": data}, upsert=True)
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — SERVICES
# ══════════════════════════════════════════════════════════════════════════════

class ServiceModel(BaseModel):
    id: Optional[str] = None
    title: str
    description: str = ""
    icon: str = "monitor"
    is_new: bool = False
    order: int = 0
    slug: Optional[str] = None
    detailed_description: str = ""
    features: List[str] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    image_card: Optional[str] = None
    image_hero: Optional[str] = None
    image_context: Optional[str] = None
    image_alt_card: Optional[str] = None
    image_alt_hero: Optional[str] = None
    image_alt_context: Optional[str] = None

@app.get("/api/admin/services")
async def admin_get_services():
    docs = await db["services"].find({}).sort("order", 1).to_list(length=100)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/services")
async def admin_create_service(svc: ServiceModel, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    doc = svc.model_dump()
    doc["id"] = doc.get("id") or str(uuid.uuid4())
    doc["slug"] = doc.get("slug") or _slug(svc.title)
    await db["services"].insert_one(doc)
    return _strip_mongo(doc)


@app.put("/api/admin/services/{service_id}")
async def admin_update_service(service_id: str, svc: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    svc.pop("_id", None)
    await db["services"].update_one({"id": service_id}, {"$set": svc}, upsert=True)
    return {"success": True}


@app.delete("/api/admin/services/{service_id}")
async def admin_delete_service(service_id: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    await db["services"].delete_one({"id": service_id})
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — CITIES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/cities")
async def admin_get_cities():
    docs = await db["cities"].find({}).sort("name", 1).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/cities")
async def admin_create_city(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="City name required")
    existing = await db["cities"].find_one({"name": name})
    if existing:
        raise HTTPException(status_code=409, detail="City already exists")
    doc = {"name": name, "is_primary": data.get("is_primary", False)}
    await db["cities"].insert_one(doc)
    return _strip_mongo(doc)


@app.put("/api/admin/cities/{city_name}")
async def admin_update_city(city_name: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    from urllib.parse import unquote
    city_name = unquote(city_name)
    data.pop("_id", None)
    await db["cities"].update_one({"name": city_name}, {"$set": data})
    return {"success": True}


@app.delete("/api/admin/cities/{city_name}")
async def admin_delete_city(city_name: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    from urllib.parse import unquote
    city_name = unquote(city_name)
    await db["cities"].delete_one({"name": city_name})
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — PARTNERS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/partners")
async def admin_get_partners():
    docs = await db["partners"].find({}).sort("order", 1).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/partners")
async def admin_create_partner(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    data["id"] = data.get("id") or str(uuid.uuid4())
    await db["partners"].insert_one(data)
    return _strip_mongo(data)


@app.put("/api/admin/partners/{partner_id}")
async def admin_update_partner(partner_id: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    await db["partners"].update_one({"id": partner_id}, {"$set": data}, upsert=True)
    return {"success": True}


@app.delete("/api/admin/partners/{partner_id}")
async def admin_delete_partner(partner_id: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    await db["partners"].delete_one({"id": partner_id})
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — PARTNER CATEGORIES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/partner-categories")
async def admin_get_partner_categories():
    doc = await db["partner_categories"].find_one({"_id": "categories"})
    if doc:
        return doc.get("items", [])
    # Fallback: derive from partners
    partners = await db["partners"].distinct("category")
    return [c for c in partners if c]


@app.post("/api/admin/partner-categories")
async def admin_create_partner_category(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name required")
    await db["partner_categories"].update_one(
        {"_id": "categories"},
        {"$addToSet": {"items": name}},
        upsert=True
    )
    return {"success": True}


@app.delete("/api/admin/partner-categories/{cat_name}")
async def admin_delete_partner_category(cat_name: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    from urllib.parse import unquote
    cat_name = unquote(cat_name)
    await db["partner_categories"].update_one(
        {"_id": "categories"},
        {"$pull": {"items": cat_name}}
    )
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — ARTICLES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/articles")
async def admin_get_articles(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    docs = await db["articles"].find({}, {"content_html": 0}).sort("date_published", -1).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/articles")
async def admin_create_article(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    if not data.get("slug"):
        data["slug"] = _slug(data.get("title", str(uuid.uuid4())))
    if not data.get("date_published"):
        data["date_published"] = _now()
    data["date_modified"] = _now()
    if not data.get("status"):
        data["status"] = "published"
    existing = await db["articles"].find_one({"slug": data["slug"]})
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    await db["articles"].insert_one(data)
    return _strip_mongo(data)


@app.put("/api/admin/articles/{slug}")
async def admin_update_article(slug: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    data["date_modified"] = _now()
    result = await db["articles"].update_one({"slug": slug}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}


@app.delete("/api/admin/articles/{slug}")
async def admin_delete_article(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    result = await db["articles"].delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}


@app.get("/api/admin/articles/sync-status")
async def admin_sync_status(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    doc = await db["sync_status"].find_one({"_id": "wordpress"})
    if not doc:
        return {"last_sync": None, "articles_synced": 0, "status": "never"}
    doc.pop("_id", None)
    return doc


@app.post("/api/sync-wordpress")
async def sync_wordpress(background_tasks: BackgroundTasks, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    background_tasks.add_task(_sync_wordpress_task)
    return {"success": True, "message": "Synchronisation démarrée en arrière-plan"}


@app.post("/api/admin/articles/backfill-seo")
async def admin_backfill_seo(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    # Stub — AI feature requires ANTHROPIC_API_KEY
    return {"success": True, "message": "Backfill SEO non disponible sans clé API IA"}


@app.post("/api/admin/articles/auto-enrich")
async def admin_auto_enrich(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "run_id": str(uuid.uuid4()), "message": "Auto-enrich non disponible sans clé API IA"}


@app.get("/api/admin/articles/auto-enrich/status")
async def admin_auto_enrich_status(run_id: Optional[str] = None, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"status": "idle", "progress": 0, "total": 0}


@app.post("/api/admin/articles/update-years")
async def admin_update_years(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "message": "Mise à jour des années non disponible sans clé API IA"}


@app.post("/api/admin/articles/fix-broken-links")
async def admin_fix_broken_links(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "message": "Fix des liens non disponible sans clé API IA"}


@app.post("/api/admin/articles/{slug}/generate-image")
async def admin_generate_image(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": False, "message": "Génération d'image non disponible sans clé API IA"}


@app.post("/api/admin/articles/{slug}/generate-meta")
async def admin_generate_meta(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": False, "message": "Génération de méta non disponible sans clé API IA"}


@app.post("/api/admin/articles/{slug}/regenerate")
async def admin_regenerate_article(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": False, "run_id": None, "message": "Régénération non disponible sans clé API IA"}


@app.get("/api/admin/articles/{slug}/regeneration-status")
async def admin_regeneration_status(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"status": "idle"}


@app.post("/api/admin/generate-article")
async def admin_generate_article(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": False, "message": "Génération IA non disponible sans clé ANTHROPIC_API_KEY"}


@app.post("/api/admin/sitemap/regenerate")
async def admin_regenerate_sitemap(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "message": "Sitemap régénéré dynamiquement à chaque requête"}


@app.post("/api/admin/planning/fix-link-slugs")
async def admin_fix_link_slugs(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "fixed": 0}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — CITY PAGES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/city-pages")
async def admin_get_city_pages(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    docs = await db["city_pages"].find({}).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/city-pages")
async def admin_create_city_page(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    if not data.get("slug"):
        data["slug"] = _slug(data.get("name", ""))
    existing = await db["city_pages"].find_one({"slug": data["slug"]})
    if existing:
        await db["city_pages"].update_one({"slug": data["slug"]}, {"$set": data})
    else:
        await db["city_pages"].insert_one(data)
    return _strip_mongo(data)


@app.put("/api/admin/city-pages/{slug}")
async def admin_update_city_page(slug: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    await db["city_pages"].update_one({"slug": slug}, {"$set": data}, upsert=True)
    return {"success": True}


@app.delete("/api/admin/city-pages/{slug}")
async def admin_delete_city_page(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    await db["city_pages"].delete_one({"slug": slug})
    return {"success": True}


@app.post("/api/admin/city-pages/{slug}/generate-image")
async def admin_generate_city_image(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": False, "message": "Génération d'image non disponible sans clé API IA"}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — PORTFOLIO
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/portfolio")
async def admin_get_portfolio(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    docs = await db["portfolio"].find({}).sort("order", 1).to_list(length=100)
    return [_strip_mongo(d) for d in docs]


@app.post("/api/admin/portfolio")
async def admin_create_portfolio(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    data["id"] = data.get("id") or str(uuid.uuid4())
    await db["portfolio"].insert_one(data)
    return _strip_mongo(data)


@app.put("/api/admin/portfolio/{item_id}")
async def admin_update_portfolio(item_id: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data.pop("_id", None)
    await db["portfolio"].update_one({"id": item_id}, {"$set": data}, upsert=True)
    return {"success": True}


@app.delete("/api/admin/portfolio/{item_id}")
async def admin_delete_portfolio(item_id: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    await db["portfolio"].delete_one({"id": item_id})
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/dashboard-stats")
async def admin_dashboard_stats(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    articles_total  = await db["articles"].count_documents({})
    articles_pub    = await db["articles"].count_documents({"status": "published"})
    articles_sched  = await db["articles"].count_documents({"status": "scheduled"})
    articles_draft  = await db["articles"].count_documents({"status": "draft"})
    articles_wp     = await db["articles"].count_documents({"source": "wordpress"})
    articles_ai_pub = await db["articles"].count_documents({"source": "ai_generated", "status": "published"})
    articles_ai_sch = await db["articles"].count_documents({"source": "ai_generated", "status": "scheduled"})
    services_count  = await db["services"].count_documents({})
    cities_count    = await db["cities"].count_documents({})
    partners_count  = await db["partners"].count_documents({})
    sync_doc = await db["sync_status"].find_one({"_id": "wordpress"})

    # Next scheduled article
    next_article = None
    next_doc = await db["articles"].find_one(
        {"status": "scheduled", "scheduled_at": {"$gt": _now()}},
        sort=[("scheduled_at", 1)]
    )
    if next_doc:
        next_article = {"subject": next_doc.get("title", ""), "scheduled_at": next_doc.get("scheduled_at", "")}

    # Recent AI articles
    recent_cursor = db["articles"].find({"source": "ai_generated", "status": "published"}, {"slug": 1, "title": 1, "date_published": 1}).sort("date_published", -1).limit(5)
    recent_ai = [_strip_mongo(d) for d in await recent_cursor.to_list(length=5)]

    # Upload stats
    upload_files = list(UPLOADS_DIR.glob("*")) if UPLOADS_DIR.exists() else []
    upload_count = len([f for f in upload_files if f.is_file()])
    upload_size  = sum(f.stat().st_size for f in upload_files if f.is_file())

    return {
        "articles": {
            "total": articles_total,
            "published": articles_pub,
            "scheduled": articles_sched,
            "draft": articles_draft,
            "wordpress": articles_wp,
            "ai_published": articles_ai_pub,
            "ai_scheduled": articles_ai_sch,
        },
        "planning": {"pending": 0, "total": articles_ai_sch},
        "services": services_count,
        "cities": cities_count,
        "partners": partners_count,
        "uploads": {"count": upload_count, "size_mb": round(upload_size / 1024 / 1024, 2)},
        "last_wp_sync": sync_doc.get("last_sync") if sync_doc else None,
        "next_article": next_article,
        "recent_ai": recent_ai,
    }


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN — FILE UPLOAD
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    context: str = Query("default"),
    category: str = Query(""),
    authorization: Optional[str] = Header(None),
):
    _check_admin(authorization)
    content = await file.read()
    ext = Path(file.filename).suffix.lower() if file.filename else ".bin"
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".pdf"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé")

    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
                ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf"}
    mime = mime_map.get(ext, "application/octet-stream")

    prefix = "ai_" if context == "ai" else ""
    filename = f"{prefix}{uuid.uuid4().hex}{ext}"

    import base64
    data_b64 = base64.b64encode(content).decode("utf-8")

    url = f"/api/uploads/{filename}"
    # Store file content in MongoDB (persistent — survives Railway restarts)
    meta = {"filename": filename, "url": url, "category": category, "context": context,
            "original_name": file.filename, "size": len(content), "mime": mime,
            "data_b64": data_b64, "created_at": _now()}
    await db["media"].insert_one(meta)

    # Also write to filesystem as cache (best-effort)
    try:
        (UPLOADS_DIR / filename).write_bytes(content)
    except Exception:
        pass

    return {"url": url, "filename": filename}


@app.post("/api/upload/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    context: str = Query("default"),
    category: str = Query(""),
    authorization: Optional[str] = Header(None),
):
    _check_admin(authorization)
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".pdf"}
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
                ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf"}
    results = []
    import base64
    for file in files:
        ext = Path(file.filename).suffix.lower() if file.filename else ".bin"
        if ext not in allowed:
            results.append({"error": f"{file.filename} : type non autorisé", "filename": file.filename})
            continue
        content = await file.read()
        mime = mime_map.get(ext, "application/octet-stream")
        prefix = "ai_" if context == "ai" else ""
        filename = f"{prefix}{uuid.uuid4().hex}{ext}"
        data_b64 = base64.b64encode(content).decode("utf-8")
        url = f"/api/uploads/{filename}"
        meta = {"filename": filename, "url": url, "category": category, "context": context,
                "original_name": file.filename, "size": len(content), "mime": mime,
                "data_b64": data_b64, "created_at": _now()}
        await db["media"].insert_one(meta)
        try:
            (UPLOADS_DIR / filename).write_bytes(content)
        except Exception:
            pass
        results.append({"url": url, "filename": filename, "original_name": file.filename})
    return {"uploaded": len([r for r in results if "url" in r]), "total": len(files), "results": results}


@app.get("/api/upload/gallery")
async def get_gallery(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    docs = await db["media"].find({}).sort("created_at", -1).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.delete("/api/uploads/{filename}")
async def delete_upload(filename: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    path = UPLOADS_DIR / filename
    if path.exists():
        path.unlink()
    await db["media"].delete_one({"filename": filename})
    return {"success": True}


@app.patch("/api/upload/gallery/{filename}/label")
async def update_gallery_label(filename: str, data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    await db["media"].update_one({"filename": filename}, {"$set": {"label": data.get("label", "")}})
    return {"success": True}


@app.post("/api/admin/media/backfill-hashes")
async def backfill_hashes(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    count = 0
    for f in UPLOADS_DIR.glob("*"):
        if f.is_file():
            h = hashlib.md5(f.read_bytes()).hexdigest()
            await db["media"].update_one({"filename": f.name}, {"$set": {"hash": h}}, upsert=True)
            count += 1
    return {"success": True, "count": count}


# ══════════════════════════════════════════════════════════════════════════════
# WORDPRESS SYNC
# ══════════════════════════════════════════════════════════════════════════════

async def _sync_wordpress_task():
    print(f"[sync] Starting WordPress sync at {_now()}")
    synced = 0
    errors = 0
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            page = 1
            while True:
                r = await client.get(
                    f"{WP_BASE_URL}/wp-json/wp/v2/posts",
                    params={"per_page": 100, "page": page, "_embed": 1, "status": "publish"},
                )
                if r.status_code != 200:
                    break
                posts = r.json()
                if not posts:
                    break

                for post in posts:
                    try:
                        slug = post.get("slug", "")
                        if not slug:
                            continue

                        # Categories
                        cats = []
                        embedded = post.get("_embedded", {})
                        for term_list in embedded.get("wp:term", []):
                            for term in term_list:
                                if term.get("taxonomy") == "category" and term.get("name") != "Non classifié":
                                    cats.append(term["name"])

                        # Featured image
                        img_url = None
                        media = embedded.get("wp:featuredmedia", [{}])
                        if media:
                            img_url = media[0].get("source_url")

                        # Yoast SEO
                        yoast = post.get("yoast_head_json", {})

                        doc = {
                            "slug": slug,
                            "title": post["title"]["rendered"],
                            "content_html": post["content"]["rendered"],
                            "excerpt": re.sub(r"<[^>]+>", "", post["excerpt"]["rendered"]).strip(),
                            "category": cats[0] if cats else "Non classifié",
                            "tags": cats,
                            "image_url": img_url,
                            "author": "Pierrick",
                            "date_published": post.get("date_gmt", _now()),
                            "date_modified": post.get("modified_gmt", _now()),
                            "source": "wordpress",
                            "status": "published",
                            "meta_title": yoast.get("title", ""),
                            "meta_description": yoast.get("description", ""),
                            "wordpress_id": post.get("id"),
                        }

                        await db["articles"].update_one(
                            {"slug": slug},
                            {"$set": doc},
                            upsert=True
                        )
                        synced += 1
                    except Exception as e:
                        errors += 1
                        print(f"[sync] Error on post {post.get('slug')}: {e}")

                if len(posts) < 100:
                    break
                page += 1

    except Exception as e:
        print(f"[sync] Fatal error: {e}")
        errors += 1

    status_doc = {
        "_id": "wordpress",
        "last_sync": _now(),
        "articles_synced": synced,
        "errors": errors,
        "status": "success" if errors == 0 else "partial",
    }
    await db["sync_status"].update_one({"_id": "wordpress"}, {"$set": status_doc}, upsert=True)
    print(f"[sync] Done: {synced} synced, {errors} errors")


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
async def health():
    try:
        await client.admin.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# SPA FALLBACK — serve React build
# ══════════════════════════════════════════════════════════════════════════════

FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"

if FRONTEND_BUILD.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_BUILD / "static"), name="static")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        index = FRONTEND_BUILD / "index.html"
        if index.exists():
            return FileResponse(index)
        return Response("Frontend not built", status_code=404)
