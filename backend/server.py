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

try:
    import anthropic as _anthropic_module
    _ANTHROPIC_AVAILABLE = True
except ImportError:
    _ANTHROPIC_AVAILABLE = False

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
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
CLAUDE_MODEL   = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_PLACE_ID= os.getenv("GOOGLE_PLACE_ID", "")
WP_BASE_URL    = os.getenv("WP_BASE_URL", "https://www.aidenumerique37.fr")
SITE_URL       = os.getenv("SITE_URL", "https://www.aidenumerique37.fr")
UPLOADS_DIR    = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))
ANTHROPIC_API_KEY     = os.getenv("ANTHROPIC_API_KEY", "")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY    = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ── Cloudinary config ─────────────────────────────────────────────────────────
_CLOUDINARY_AVAILABLE = False
try:
    import cloudinary
    import cloudinary.uploader
    if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True,
        )
        _CLOUDINARY_AVAILABLE = True
        print("[cloudinary] Cloudinary configured ✓")
    else:
        print("[cloudinary] Cloudinary env vars missing — uploads will fall back to MongoDB base64")
except ImportError:
    print("[cloudinary] cloudinary package not installed")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Aide Numérique 37 API", version="1.0.0")

_ALLOWED_ORIGINS = [
    "https://www.aidenumerique37.fr",
    "https://aidenumerique37.fr",
    "https://seashell-duck-353987.hostingersite.com",  # Hostinger staging
    "http://localhost:3000",   # dev
    "http://localhost:3001",   # dev alt
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=False,
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
    await _ensure_indexes()
    _start_scheduler()

@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()

# ── Seed DB from exported JSON ─────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"

async def _seed_db_if_empty():
    try:
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
                        docs = [d if isinstance(d, dict) else {"value": d} for d in data]
                        try:
                            await db[col].insert_many(docs)
                            print(f"[seed] {col}: {len(docs)} documents")
                        except Exception as e:
                            print(f"[seed] {col}: skipped (DB may be read-only): {e}")

        # Seed partner categories
        if not await db["partner_categories"].find_one({"_id": "categories"}):
            fpath = DATA_DIR / "partner_categories.json"
            if fpath.exists():
                cats = json.loads(fpath.read_text(encoding="utf-8"))
                items = [c for c in cats if isinstance(c, str) and not c.startswith("TEST") and not c.startswith("Duplicate")]
                try:
                    await db["partner_categories"].insert_one({"_id": "categories", "items": items})
                    print(f"[seed] partner_categories: {len(items)} items")
                except Exception as e:
                    print(f"[seed] partner_categories: skipped (DB may be read-only): {e}")
    except Exception as e:
        print(f"[seed] seed_db_if_empty failed (non-fatal): {e}")

    # Seed site content
    DEFAULT_HERO = {
        "title": "Votre Assistant",
        "title_highlight": "Informatique",
        "title_suffix": "à Domicile",
        "subtitle": "Besoin d'aide avec votre ordinateur, tablette ou smartphone ? Je me déplace chez vous en Indre-et-Loire pour une assistance informatique à domicile personnalisée et bienveillante.",
        "button_text": "Me Contacter",
        "font_family": "Montserrat",
        "font_size": "normal",
        "font_size_suffix": "small",
    }
    DEFAULT_CONTENT = {
        "_id": "main",
        "hero": DEFAULT_HERO,
        "services": {"title": "Assistance Informatique à Domicile - Mes Services", "subtitle": "Un accompagnement personnalisé pour tous vos besoins informatiques et numériques à domicile"},
        "contact": {"title": "Contactez-Moi", "subtitle": "Une question ? Besoin d'un accompagnement informatique ? Je suis là pour vous aider."},
        "section_order": ["reviews", "services", "howItWorks", "urssafInfo", "specialPricing", "press", "contact", "partners"],
    }
    existing = await db["site_content"].find_one({"_id": "main"})
    if not existing:
        fpath = DATA_DIR / "content.json"
        if fpath.exists():
            try:
                data = json.loads(fpath.read_text(encoding="utf-8"))
                data["_id"] = "main"
                await db["site_content"].insert_one(data)
                print("[seed] site_content: from file")
            except Exception:
                await db["site_content"].insert_one(DEFAULT_CONTENT)
                print("[seed] site_content: defaults")
        else:
            await db["site_content"].insert_one(DEFAULT_CONTENT)
            print("[seed] site_content: defaults")
    else:
        # Restore hero fields if they were wiped (all empty strings)
        hero = existing.get("hero", {})
        if not hero.get("title") and not hero.get("title_highlight"):
            restore = {f"hero.{k}": v for k, v in DEFAULT_HERO.items() if not hero.get(k)}
            if restore:
                try:
                    await db["site_content"].update_one({"_id": "main"}, {"$set": restore})
                    print(f"[seed] site_content: restored {len(restore)} empty hero fields")
                except Exception as e:
                    print(f"[seed] site_content: could not restore hero fields (DB may be read-only): {e}")

# ── MongoDB indexes ────────────────────────────────────────────────────────────
async def _ensure_indexes():
    try:
        from pymongo import ASCENDING, DESCENDING
        # articles — most queried fields
        await db["articles"].create_index([("slug", ASCENDING)], unique=True, background=True)
        await db["articles"].create_index([("status", ASCENDING)], background=True)
        await db["articles"].create_index([("category", ASCENDING)], background=True)
        await db["articles"].create_index([("date_published", DESCENDING)], background=True)
        await db["articles"].create_index([("scheduled_at", ASCENDING)], background=True, sparse=True)
        # city_pages
        await db["city_pages"].create_index([("slug", ASCENDING)], unique=True, background=True)
        # services
        await db["services"].create_index([("slug", ASCENDING)], background=True)
        await db["services"].create_index([("order", ASCENDING)], background=True)
        # media
        await db["media"].create_index([("filename", ASCENDING)], background=True)
        await db["media"].create_index([("created_at", DESCENDING)], background=True)
        print("[db] Indexes ensured ✓")
    except Exception as e:
        print(f"[db] Index creation skipped (non-fatal): {e}")


# ── APScheduler ───────────────────────────────────────────────────────────────
async def _auto_publish_task():
    """Publish articles whose scheduled_at has passed."""
    try:
        now = datetime.now(timezone.utc)
        result = await db["articles"].update_many(
            {
                "status": "scheduled",
                "scheduled_at": {"$lte": now.isoformat()},
            },
            {"$set": {"status": "published", "date_published": now.isoformat()}}
        )
        if result.modified_count:
            print(f"[scheduler] Auto-published {result.modified_count} article(s)")
    except Exception as e:
        print(f"[scheduler] auto_publish error: {e}")


def _start_scheduler():
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler(timezone="Europe/Paris")
        # Auto-publish scheduled articles every hour
        scheduler.add_job(_auto_publish_task, "interval", hours=1, id="auto_publish")
        scheduler.start()
        print("[scheduler] Auto-publish job started (every 1h)")
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


# ── Anthropic AI helper ────────────────────────────────────────────────────────
async def _claude(prompt: str, system: str = "", max_tokens: int = 4096) -> str:
    """Call Claude claude-opus-4-5 and return the text response. Raises HTTPException if unavailable."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY non configurée sur le serveur")
    if not _ANTHROPIC_AVAILABLE:
        raise HTTPException(status_code=503, detail="Bibliothèque anthropic non installée")
    client = _anthropic_module.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": CLAUDE_MODEL, "max_tokens": max_tokens, "messages": messages}
    if system:
        kwargs["system"] = system
    response = await client.messages.create(**kwargs)
    return response.content[0].text

# ── Cloudinary upload helper ──────────────────────────────────────────────────
async def _upload_to_cloudinary(content: bytes, filename: str, folder: str = "aidenumerique37") -> dict:
    """Upload bytes to Cloudinary in a thread (SDK is synchronous). Returns {url, public_id}."""
    import io
    def _sync_upload():
        result = cloudinary.uploader.upload(
            io.BytesIO(content),
            folder=folder,
            public_id=Path(filename).stem,
            overwrite=False,
            resource_type="auto",
        )
        return result
    result = await asyncio.to_thread(_sync_upload)
    return {"url": result["secure_url"], "public_id": result["public_id"]}


async def _delete_from_cloudinary(public_id: str):
    """Delete a resource from Cloudinary by public_id (best-effort, non-fatal)."""
    try:
        def _sync_delete():
            cloudinary.uploader.destroy(public_id, resource_type="image")
        await asyncio.to_thread(_sync_delete)
    except Exception as e:
        print(f"[cloudinary] delete {public_id} failed (non-fatal): {e}")


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
@app.get("/api/articles/categories")
async def get_article_categories():
    """Return distinct non-empty article categories sorted alphabetically."""
    cats = await db["articles"].distinct("category", {"status": {"$nin": ["draft", "scheduled"]}})
    return sorted([c for c in cats if c])


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
    doc = _strip_mongo(doc)
    # Normalise: expose both fields so frontend works regardless of article origin
    # WordPress articles store body in content_html, Claude articles in content
    if not doc.get("content_html") and doc.get("content"):
        doc["content_html"] = doc["content"]
    elif not doc.get("content") and doc.get("content_html"):
        doc["content"] = doc["content_html"]
    return doc


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
                params={"place_id": GOOGLE_PLACE_ID, "fields": "rating,reviews,user_ratings_total", "key": GOOGLE_API_KEY, "language": "fr"},
                timeout=10,
            )
            data = r.json().get("result", {})
            raw_reviews = data.get("reviews", [])
            # Normalize Google Places API format → frontend expected format
            reviews = [
                {
                    "rating": rev.get("rating", 5),
                    "text": rev.get("text", ""),
                    "relative_time_description": rev.get("relative_time_description", ""),
                    "author": {
                        "name": rev.get("author_name", "Anonyme"),
                        "profile_photo_url": rev.get("profile_photo_url", ""),
                        "url": rev.get("author_url", ""),
                    },
                }
                for rev in raw_reviews
            ]
            result = {
                "rating": data.get("rating", 0),
                "total_ratings": data.get("user_ratings_total", 0),
                "user_ratings_total": data.get("user_ratings_total", 0),
                "reviews": reviews,
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
    service: Optional[str] = ""        # funnel: service category chosen
    service_options: Optional[List[str]] = []  # funnel: specific options chosen

def _esc(text: str) -> str:
    """Escape HTML special chars to prevent injection in emails."""
    return (str(text)
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#x27;"))

@app.post("/api/contact/send")
async def send_contact(form: ContactForm):
    if not RESEND_API_KEY and (not SMTP_USER or not SMTP_PASS):
        raise HTTPException(status_code=503, detail="Email not configured")

    options_str  = ", ".join(form.service_options) if form.service_options else "—"
    subject_line = form.service or form.subject or "Nouveau message"
    subject      = f"[Aide Numérique 37] {subject_line}"

    body_plain = (
        f"Nouveau message depuis le site web\n\n"
        f"Nom : {form.name}\nEmail : {form.email}\n"
        f"Téléphone : {form.phone or 'Non renseigné'}\n"
        f"Service : {form.service or 'Non renseigné'}\nOptions : {options_str}\n"
        f"Sujet : {form.subject or 'Non renseigné'}\n\nMessage :\n{form.message}"
    )
    # All user-supplied values are HTML-escaped before being inserted in the email body
    body_html = (
        f'<html><body style="font-family:Arial,sans-serif;color:#333">'
        f'<h2 style="color:#1a56db">Nouveau message — Aide Numérique 37</h2>'
        f'<table style="border-collapse:collapse;width:100%">'
        f'<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Nom</td><td style="padding:8px;border:1px solid #e5e7eb">{_esc(form.name)}</td></tr>'
        f'<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #e5e7eb"><a href="mailto:{_esc(form.email)}">{_esc(form.email)}</a></td></tr>'
        f'<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Téléphone</td><td style="padding:8px;border:1px solid #e5e7eb">{_esc(form.phone or "Non renseigné")}</td></tr>'
        f'<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #e5e7eb"><strong>{_esc(form.service or "Non renseigné")}</strong></td></tr>'
        f'<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Options</td><td style="padding:8px;border:1px solid #e5e7eb">{_esc(options_str)}</td></tr>'
        f'</table>'
        f'<h3 style="color:#1a56db;margin-top:20px">Message</h3>'
        f'<p style="background:#f9fafb;padding:16px;border-radius:8px;line-height:1.6">{_esc(form.message).replace(chr(10), "<br>")}</p>'
        f'</body></html>'
    )

    # ── Path 1 : Resend HTTP API (works on Railway — no outbound SMTP needed) ──
    if RESEND_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": f"Aide Numérique 37 <onboarding@resend.dev>",
                        "to": [CONTACT_EMAIL],
                        "reply_to": form.email,
                        "subject": subject,
                        "html": body_html,
                        "text": body_plain,
                    },
                )
            if resp.status_code in (200, 201):
                return {"success": True, "message": "Message envoyé avec succès"}
            # Surface Resend error clearly
            err_detail = resp.json().get("message", resp.text) if resp.headers.get("content-type","").startswith("application/json") else resp.text
            raise HTTPException(status_code=500, detail=f"Resend error {resp.status_code}: {err_detail}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur Resend : {str(e)}")

    # ── Path 2 : Direct SMTP fallback (for local dev / non-Railway hosting) ──
    msg = MIMEMultipart("alternative")
    msg["From"]     = SMTP_USER
    msg["To"]       = CONTACT_EMAIL
    msg["Reply-To"] = form.email
    msg["Subject"]  = subject
    msg.attach(MIMEText(body_plain, "plain", "utf-8"))
    msg.attach(MIMEText(body_html,  "html",  "utf-8"))

    sent = False
    last_err = None
    for port, use_tls, start_tls in [(587, False, True), (465, True, False)]:
        try:
            await aiosmtplib.send(
                msg, hostname=SMTP_HOST, port=port,
                use_tls=use_tls, start_tls=start_tls,
                username=SMTP_USER, password=SMTP_PASS,
                timeout=15,
            )
            sent = True
            break
        except Exception as e:
            last_err = e
            continue
    if not sent:
        raise HTTPException(status_code=500, detail=f"Erreur envoi email : {str(last_err)}")
    return {"success": True, "message": "Message envoyé avec succès"}


# ── Static uploads — Cloudinary redirect or MongoDB fallback ──────────────────
@app.get("/api/uploads/{filename}")
async def serve_upload(filename: str):
    doc = await db["media"].find_one({"filename": filename})
    if doc:
        # Prefer Cloudinary CDN URL (no bandwidth cost, fast CDN)
        if doc.get("cloudinary_url"):
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url=doc["cloudinary_url"], status_code=302)
        # Legacy: base64 stored in MongoDB
        if doc.get("data_b64"):
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


# ── Simple in-memory brute-force protection on login ─────────────────────────
_login_attempts: Dict[str, list] = {}   # ip → [timestamp, ...]
_LOGIN_MAX_ATTEMPTS = 10
_LOGIN_WINDOW_SECONDS = 300  # 5 minutes

def _check_login_rate(ip: str):
    import time
    now = time.time()
    attempts = [t for t in _login_attempts.get(ip, []) if now - t < _LOGIN_WINDOW_SECONDS]
    _login_attempts[ip] = attempts
    if len(attempts) >= _LOGIN_MAX_ATTEMPTS:
        wait = int(_LOGIN_WINDOW_SECONDS - (now - attempts[0]))
        raise HTTPException(
            status_code=429,
            detail=f"Trop de tentatives. Réessayez dans {wait} secondes."
        )
    _login_attempts[ip].append(now)

@app.post("/api/admin/login")
async def admin_login(data: dict, request: Request):
    ip = request.client.host if request.client else "unknown"
    _check_login_rate(ip)
    password = data.get("password", "")
    if not _verify_password(password):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    # Clear attempts on success
    _login_attempts.pop(ip, None)
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
async def admin_put_content(request: Request, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data = await request.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="JSON object expected")
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
    # Keep content and content_html in sync so both article origins work on the public site
    if "content" in data and not data.get("content_html"):
        data["content_html"] = data["content"]
    elif "content_html" in data and not data.get("content"):
        data["content"] = data["content_html"]
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


@app.post("/api/admin/articles/import-csv")
async def admin_import_csv(file: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    """
    Import SEO planning from a semicolon-delimited CSV file.
    Creates articles with status='scheduled' and sets scheduled_at from the Date_publication column.
    Skips articles whose slug already exists (duplicate detection).
    """
    _check_admin(authorization)
    import csv as _csv, io as _io, unicodedata as _ud

    raw = await file.read()
    text = raw.decode("utf-8-sig")  # strip BOM if present
    reader = _csv.reader(_io.StringIO(text), delimiter=";", quotechar='"')
    rows = list(reader)
    if len(rows) < 2:
        raise HTTPException(status_code=400, detail="Fichier CSV vide ou sans données")

    headers = [h.strip() for h in rows[0]]

    def _col(row, name):
        try:
            return row[headers.index(name)].strip()
        except (ValueError, IndexError):
            return ""

    def _parse_date(d: str) -> str:
        """Convert DD/MM/YYYY → ISO 8601 date string (noon UTC)."""
        try:
            day, month, year = d.strip().split("/")
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}T12:00:00+00:00"
        except Exception:
            return _now()

    inserted, skipped, errors = [], [], []

    for i, row in enumerate(rows[1:], start=2):
        if not any(row):
            continue
        try:
            slug = _col(row, "URL_slug")
            title = _col(row, "Titre_H1")
            if not slug or not title:
                errors.append({"row": i, "error": "slug ou titre manquant"})
                continue

            # Duplicate check
            existing = await db["articles"].find_one({"slug": slug}, {"slug": 1})
            if existing:
                skipped.append(slug)
                continue

            pub_date_str = _col(row, "Date_publication")
            scheduled_iso = _parse_date(pub_date_str)

            # Build article document
            h2s = [_col(row, f"H2_{n}") for n in range(1, 5)]
            outline = [h for h in h2s if h]

            faqs = []
            for n in range(1, 4):
                q = _col(row, f"FAQ_question_{n}")
                a = _col(row, f"FAQ_reponse_{n}_resume")
                if q and a:
                    faqs.append({"question": q, "answer": a})

            doc = {
                "slug": slug,
                "title": title,
                "meta_title": _col(row, "Meta_titre_60car"),
                "meta_description": _col(row, "Meta_description_155car"),
                "status": "scheduled",
                "date_published": scheduled_iso,
                "scheduled_at": scheduled_iso,
                "date_modified": _now(),
                "category": _col(row, "Categorie_blog"),
                "source": "seo_planning",
                "content": "",
                "content_html": "",
                # ── SEO planning metadata ──────────────────────────────
                "seo_keyword": _col(row, "Mot_cle_principal"),
                "seo_priority": _col(row, "Priorite_SEO"),
                "target_city": _col(row, "Ville_cible_principale"),
                "target_audience": _col(row, "Public_cible"),
                "content_type": _col(row, "Type_contenu"),
                "outline": outline,
                "hook": _col(row, "Hook_introduction_2phrases"),
                "editorial_notes": _col(row, "Notes_editoriales"),
                "faqs": faqs,
                "pillar": _col(row, "Pilier_ou_cluster"),
                "week": _col(row, "Semaine"),
            }

            await db["articles"].insert_one(doc)
            inserted.append(slug)

        except Exception as e:
            errors.append({"row": i, "slug": _col(row, "URL_slug"), "error": str(e)})

    return {
        "success": True,
        "inserted": len(inserted),
        "skipped": len(skipped),
        "errors": errors,
        "inserted_slugs": inserted[:20],   # preview (first 20)
        "skipped_slugs": skipped[:20],
    }


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

    # Find articles missing meta_title or meta_description
    articles = await db["articles"].find({
        "$or": [
            {"meta_title": {"$in": [None, ""]}},
            {"meta_description": {"$in": [None, ""]}}
        ]
    }).to_list(length=200)

    if not articles:
        return {"success": True, "updated": 0, "message": "Tous les articles ont déjà leurs métadonnées SEO"}

    import re as _re, json as _json, re as _re2

    updated = 0
    errors = []
    for art in articles:
        try:
            plain = _re.sub(r"<[^>]+>", "", art.get("content", ""))[:1000]
            prompt = f"""Pour l'article "{art.get('title', '')}", génère un meta title (50-60 car.) et une meta description SEO (150-160 car.).
Contenu : {plain}
Réponds UNIQUEMENT en JSON : {{"meta_title": "...", "meta_description": "..."}}"""
            raw = await _claude(prompt, max_tokens=200)
            match = _re2.search(r"\{.*\}", raw, _re2.DOTALL)
            if match:
                meta = _json.loads(match.group())
                await db["articles"].update_one(
                    {"slug": art["slug"]},
                    {"$set": {"meta_title": meta.get("meta_title", ""), "meta_description": meta.get("meta_description", ""), "updated_at": _now()}}
                )
                updated += 1
        except Exception as e:
            errors.append({"slug": art.get("slug", "?"), "error": str(e)})

    return {"success": True, "updated": updated, "total": len(articles), "errors": errors}


# ── AI / Generator config (master prompt + generation settings) ───────────────
_GENERATOR_CONFIG_DEFAULTS = {
    "master_prompt": "",
    "default_category": "Conseils & Astuces",
    "generate_image": True,
}

@app.get("/api/admin/generator/config")
async def get_generator_config(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    doc = await db["generator_config"].find_one({"_id": "main"})
    cfg = {**_GENERATOR_CONFIG_DEFAULTS, **(doc or {})}
    cfg.pop("_id", None)
    return cfg

@app.put("/api/admin/generator/config")
async def save_generator_config(request: Request, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data = await request.json()
    allowed = {"master_prompt", "default_category", "generate_image"}
    update = {k: v for k, v in data.items() if k in allowed}
    update["updated_at"] = _now()
    await db["generator_config"].update_one(
        {"_id": "main"}, {"$set": update}, upsert=True
    )
    return {"success": True}

# Legacy alias kept for compatibility
@app.get("/api/admin/ai-config")
async def get_ai_config(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    doc = await db["generator_config"].find_one({"_id": "main"})
    return {"master_prompt": (doc or {}).get("master_prompt", "")}

@app.put("/api/admin/ai-config")
async def save_ai_config(request: Request, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data = await request.json()
    await db["generator_config"].update_one(
        {"_id": "main"},
        {"$set": {"master_prompt": data.get("master_prompt", ""), "updated_at": _now()}},
        upsert=True,
    )
    return {"success": True}


@app.post("/api/admin/articles/auto-enrich")
async def admin_auto_enrich(request: Request, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    data = await request.json()
    run_id = str(uuid.uuid4())

    # Support both old {limit} and new {max_articles} param names
    max_articles = int(data.get("max_articles", data.get("limit", 10)))

    # master_prompt: from request, fallback to saved generator config
    master_prompt = data.get("master_prompt", "").strip()
    if not master_prompt:
        cfg = await db["generator_config"].find_one({"_id": "main"})
        master_prompt = (cfg or {}).get("master_prompt", "")

    DEFAULT_SYSTEM = (
        "Tu es un expert en rédaction web SEO pour Aide Numérique 37, "
        "une entreprise d'assistance informatique à domicile en Indre-et-Loire (37). "
        "Rédige en français, style clair, humain, bienveillant, accessible aux seniors. "
        "Pas de jargon inutile."
    )
    system = master_prompt if master_prompt else DEFAULT_SYSTEM

    # Select articles missing content (priority) or missing meta
    # Sort "no_content" articles so the next scheduled articles (by date) come first
    # → ensures the 5 nearest publications are always ready
    all_articles = await db["articles"].find({}).to_list(length=500)
    no_content = sorted(
        [a for a in all_articles if not a.get("content", "").strip()],
        key=lambda x: (
            x.get("scheduled_at") or x.get("date_published") or "9999"
        )
    )
    has_content = [a for a in all_articles if a.get("content", "").strip()
                   and (not a.get("meta_title") or not a.get("meta_description"))]
    to_enrich = (no_content + has_content)[:max_articles]

    await db["enrich_status"].update_one(
        {"run_id": run_id},
        {"$set": {"run_id": run_id, "status": "running", "progress": 0,
                  "total": len(to_enrich), "started_at": _now(), "report": []}},
        upsert=True,
    )

    async def _do_enrich():
        import re as _re, json as _json
        done = 0
        report = []
        for art in to_enrich:
            # Check cancellation flag before each article
            current = await db["enrich_status"].find_one({"run_id": run_id})
            if current and current.get("status") == "cancelled":
                break
            slug = art.get("slug", "")
            title = art.get("title", slug)
            try:
                existing_content = art.get("content", "").strip()

                # ── Step 1: generate full content if missing ──────────────────
                if not existing_content:
                    # Use planning metadata if available (imported from CSV)
                    hook_hint = art.get("hook", "")
                    outline_hint = art.get("outline", [])
                    city_hint = art.get("target_city", "")
                    kw_hint = art.get("seo_keyword", "")

                    structure_block = ""
                    if outline_hint:
                        structure_block = "Structure imposée (utilise ces H2 dans l'ordre) :\n"
                        structure_block += "\n".join(f"- {h}" for h in outline_hint) + "\n\n"

                    hook_block = ""
                    if hook_hint:
                        hook_block = f"Introduction suggérée (à développer) :\n{hook_hint}\n\n"

                    city_block = f"Ville cible : {city_hint}. Mentionne cette ville naturellement dans le contenu.\n\n" if city_hint else ""
                    kw_block   = f"Mot-clé SEO principal à inclure : {kw_hint}\n\n" if kw_hint else ""

                    content_prompt = (
                        f'Rédige un article de blog HTML pour le titre : "{title}"\n\n'
                        f"RÈGLES ABSOLUES :\n"
                        f"- Ta réponse doit commencer DIRECTEMENT par une balise HTML (ex: <h2> ou <p>)\n"
                        f"- N'inclus AUCUN JSON, AUCUN markdown, AUCUN bloc de code, AUCUN commentaire\n"
                        f"- Utilise UNIQUEMENT ces balises : <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>\n\n"
                        f"{structure_block}"
                        f"{hook_block}"
                        f"{city_block}"
                        f"{kw_block}"
                        f"L'article doit :\n"
                        f"- Avoir une introduction engageante (2-3 paragraphes)\n"
                        f"- Être structuré avec des sous-titres H2 et H3\n"
                        f"- Contenir entre 600 et 900 mots\n"
                        f"- Inclure des conseils pratiques et concrets\n"
                        f"- Se terminer par une conclusion avec appel à l'action doux\n\n"
                        f"Commence directement par le premier <h2> sans rien d'autre avant."
                    )
                    new_content = await _claude(content_prompt, system=system, max_tokens=2000)

                    # Strip markdown code fences if Claude wrapped the response
                    new_content = _re.sub(r'^```[a-z]*\s*', '', new_content.strip())
                    new_content = _re.sub(r'\s*```$', '', new_content.strip())
                    new_content = new_content.strip()

                    # Reject if response doesn't contain any HTML tag (likely JSON or plain text)
                    if not _re.search(r'<(h[1-6]|p|ul|ol|li|strong|em)\b', new_content):
                        raise ValueError(f"Claude n'a pas retourné de HTML valide (reçu : {new_content[:120]})")

                    plain = _re.sub(r"<[^>]+>", "", new_content)
                    excerpt = (plain.strip()[:160].rsplit(" ", 1)[0] + "…") if len(plain) > 160 else plain.strip()
                    await db["articles"].update_one(
                        {"slug": slug},
                        {"$set": {"content": new_content, "excerpt": excerpt, "updated_at": _now()}}
                    )
                    existing_content = new_content

                # ── Step 2: generate meta + tags ──────────────────────────────
                plain = _re.sub(r"<[^>]+>", "", existing_content)[:1000]
                meta_prompt = (
                    f'Pour l\'article "{title}", génère :\n'
                    f"1. meta_title SEO (50-60 car.)\n"
                    f"2. meta_description SEO (150-160 car., appel à l'action)\n"
                    f"3. tags : liste de 3 à 5 mots-clés courts\n\n"
                    f"Contenu (extrait) : {plain}\n\n"
                    f"Réponds UNIQUEMENT en JSON valide :\n"
                    f'{{"meta_title":"...","meta_description":"...","tags":["tag1","tag2"]}}'
                )
                raw = await _claude(meta_prompt, system=system, max_tokens=300)
                match = _re.search(r"\{.*\}", raw, _re.DOTALL)
                if match:
                    meta = _json.loads(match.group())
                    update_fields = {"updated_at": _now()}
                    if meta.get("meta_title"):    update_fields["meta_title"]    = meta["meta_title"]
                    if meta.get("meta_description"): update_fields["meta_description"] = meta["meta_description"]
                    if meta.get("tags"):          update_fields["tags"]          = meta["tags"]
                    await db["articles"].update_one({"slug": slug}, {"$set": update_fields})

                report.append({"slug": slug, "title": title, "status": "ok",
                                "generated_content": not art.get("content", "").strip()})
            except Exception as e:
                report.append({"slug": slug, "title": title, "status": "error", "error": str(e)})

            done += 1
            await db["enrich_status"].update_one(
                {"run_id": run_id},
                {"$set": {"progress": done, "processed": done, "report": report}}
            )

        await db["enrich_status"].update_one(
            {"run_id": run_id},
            {"$set": {"status": "done", "progress": done, "report": report}}
        )

    asyncio.create_task(_do_enrich())
    return {"success": True, "run_id": run_id, "total": len(to_enrich)}


@app.post("/api/admin/articles/auto-enrich/cancel")
async def admin_auto_enrich_cancel(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    # Find the most recent running/queued job then cancel it
    doc = await db["enrich_status"].find_one(
        {"status": {"$in": ["running", "queued"]}},
        sort=[("started_at", -1)]
    )
    if doc:
        await db["enrich_status"].update_one({"run_id": doc["run_id"]}, {"$set": {"status": "cancelled"}})
        return {"success": True, "message": "Enrichissement annulé"}
    # No running job — reset any stuck "running" docs anyway
    await db["enrich_status"].update_many({"status": "running"}, {"$set": {"status": "cancelled"}})
    return {"success": True, "message": "Aucun enrichissement en cours (statut réinitialisé)"}


@app.get("/api/admin/articles/auto-enrich/status")
async def admin_auto_enrich_status(run_id: Optional[str] = None, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    if not run_id:
        # Return most recent run if any
        doc = await db["enrich_status"].find_one({}, sort=[("started_at", -1)])
        if doc and doc.get("status") == "running":
            # Auto-reset if stuck for more than 10 minutes with no progress
            started = doc.get("started_at", "")
            try:
                from datetime import datetime, timezone, timedelta
                started_dt = datetime.fromisoformat(started.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) - started_dt > timedelta(minutes=20) and doc.get("progress", 0) == 0:
                    await db["enrich_status"].update_one({"run_id": doc["run_id"]}, {"$set": {"status": "cancelled"}})
                    return {"status": "cancelled", "progress": 0, "total": 0, "report": [], "auto_reset": True}
            except Exception:
                pass
            return {"found": True, "run_id": doc.get("run_id"), "status": "running",
                    "progress": doc.get("progress", 0), "processed": doc.get("processed", 0),
                    "total": doc.get("total", 0), "report": doc.get("report", [])}
        return {"status": "idle", "progress": 0, "total": 0}
    doc = await db["enrich_status"].find_one({"run_id": run_id})
    if not doc:
        return {"found": False, "status": "idle", "progress": 0, "total": 0}
    return {
        "found": True,
        "run_id": doc.get("run_id"),
        "status": doc.get("status", "idle"),
        "progress": doc.get("progress", 0),
        "processed": doc.get("processed", 0),
        "total": doc.get("total", 0),
        "report": doc.get("report", []),
    }


@app.post("/api/admin/articles/update-years")
async def admin_update_years(authorization: Optional[str] = Header(None)):
    """Replace outdated year references (2022-2024) with current year in all article content."""
    _check_admin(authorization)
    import re as _re
    current_year = str(datetime.now(timezone.utc).year)
    # Years to replace: anything 2020–(current_year-1)
    old_years = [str(y) for y in range(2020, int(current_year))]
    pattern = r'\b(' + '|'.join(old_years) + r')\b'

    articles = await db["articles"].find(
        {}, {"slug": 1, "content": 1, "content_html": 1}
    ).to_list(length=2000)

    updated = 0
    for art in articles:
        slug = art.get("slug", "")
        changes: dict = {}
        for field in ("content", "content_html"):
            raw = art.get(field, "") or ""
            if not raw:
                continue
            new_val, count = _re.subn(pattern, current_year, raw)
            if count:
                changes[field] = new_val
        if changes:
            changes["date_modified"] = _now()
            await db["articles"].update_one({"slug": slug}, {"$set": changes})
            updated += 1

    return {
        "success": True,
        "updated": updated,
        "message": f"{updated} article(s) mis à jour avec l'année {current_year}."
    }


@app.post("/api/admin/articles/fix-broken-links")
async def admin_fix_broken_links(authorization: Optional[str] = Header(None)):
    """Scan articles for internal links and report broken slugs (no auto-fix — WordPress is gone)."""
    _check_admin(authorization)
    import re as _re
    articles = await db["articles"].find({}, {"slug": 1, "content": 1, "content_html": 1, "title": 1}).to_list(length=2000)
    all_slugs = {a["slug"] for a in articles}

    broken = []
    for art in articles:
        raw = art.get("content") or art.get("content_html") or ""
        # Find href="/articles/SLUG" or href="…/articles/SLUG"
        hrefs = _re.findall(r'href=["\'][^"\']*?/articles/([a-z0-9\-]+)["\']', raw)
        for linked_slug in hrefs:
            if linked_slug not in all_slugs:
                broken.append({"article": art["slug"], "broken_slug": linked_slug})

    return {
        "success": True,
        "broken_count": len(broken),
        "broken_links": broken[:50],  # cap at 50
        "message": f"{len(broken)} lien(s) interne(s) cassé(s) trouvé(s)." if broken else "Aucun lien interne cassé détecté ✓"
    }


@app.post("/api/admin/articles/{slug}/generate-image")
async def admin_generate_image(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    # Image generation requires a dedicated image model (DALL-E, Stable Diffusion, etc.)
    # Claude API generates text only — this feature is not available
    return {"success": False, "message": "La génération d'image nécessite une clé API dédiée (DALL-E, Stable Diffusion…). Non disponible actuellement."}


@app.post("/api/admin/articles/{slug}/generate-meta")
async def admin_generate_meta(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    article = await db["articles"].find_one({"slug": slug})
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    import re as _re
    plain = _re.sub(r"<[^>]+>", "", article.get("content", ""))[:1500]

    prompt = f"""Pour cet article de blog intitulé "{article.get('title', '')}", génère :
1. Un meta title SEO (50-60 caractères max, accrocheur)
2. Une meta description SEO (150-160 caractères max, avec appel à l'action)

Contenu de l'article (extrait) :
{plain}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaire :
{{"meta_title": "...", "meta_description": "..."}}"""

    raw = await _claude(prompt, max_tokens=300)
    # Parse JSON from response
    import json as _json
    import re as _re2
    match = _re2.search(r"\{.*\}", raw, _re2.DOTALL)
    if not match:
        raise HTTPException(status_code=500, detail="Réponse IA invalide")
    meta = _json.loads(match.group())
    await db["articles"].update_one(
        {"slug": slug},
        {"$set": {"meta_title": meta.get("meta_title", ""), "meta_description": meta.get("meta_description", ""), "updated_at": _now()}}
    )
    return {"success": True, "meta_title": meta.get("meta_title", ""), "meta_description": meta.get("meta_description", "")}


@app.post("/api/admin/articles/{slug}/regenerate")
async def admin_regenerate_article(slug: str, data: dict = {}, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    article = await db["articles"].find_one({"slug": slug})
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")

    run_id = str(uuid.uuid4())
    # Store running status
    await db["regen_status"].update_one(
        {"slug": slug}, {"$set": {"slug": slug, "run_id": run_id, "status": "running", "started_at": _now()}}, upsert=True
    )

    async def _do_regen():
        try:
            import re as _re
            # Read from whichever content field exists
            raw = article.get("content") or article.get("content_html") or ""
            plain = _re.sub(r"<[^>]+>", "", raw)[:1200]
            master_prompt = data.get("master_prompt", "")
            if not master_prompt:
                cfg = await db["generator_config"].find_one({"_id": "main"})
                master_prompt = (cfg or {}).get("master_prompt", "")
            system = master_prompt if master_prompt else (
                "Tu es un expert en rédaction web SEO pour une entreprise d'aide numérique en Indre-et-Loire (37). "
                "Style : clair, humain, professionnel. Langue : français."
            )
            prompt = f"""Réécris et améliore cet article de blog intitulé "{article.get('title', '')}" en le rendant plus engageant, plus complet et mieux optimisé SEO.

Contenu actuel :
{plain}

Retourne UNIQUEMENT le contenu HTML amélioré (<h2>, <h3>, <p>, <ul>, <li>, <strong>). Pas de balise <html>/<body>."""
            new_content = await _claude(prompt, system=system, max_tokens=2000)
            plain2 = _re.sub(r"<[^>]+>", "", new_content)
            excerpt = plain2.strip()[:160].rsplit(" ", 1)[0] + "…" if len(plain2) > 160 else plain2.strip()
            now = _now()
            # Write to both fields so both article origins work on the public site
            await db["articles"].update_one(
                {"slug": slug},
                {"$set": {"content": new_content, "content_html": new_content,
                           "excerpt": excerpt, "date_modified": now, "updated_at": now}}
            )
            await db["regen_status"].update_one(
                {"slug": slug},
                {"$set": {"status": "done", "run_id": run_id, "done": True}}
            )
        except Exception as e:
            await db["regen_status"].update_one({"slug": slug}, {"$set": {"status": "error", "error": str(e)}})

    asyncio.create_task(_do_regen())
    return {"success": True, "run_id": run_id}


@app.get("/api/admin/articles/{slug}/regeneration-status")
async def admin_regeneration_status(slug: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    doc = await db["regen_status"].find_one({"slug": slug})
    if not doc:
        return {"status": "idle", "done": False}
    status = doc.get("status", "idle")
    response: dict = {"status": status, "run_id": doc.get("run_id"), "error": doc.get("error"), "done": False}
    if status == "done":
        response["done"] = True
        # Return the updated article so the frontend can refresh without extra request
        art = await db["articles"].find_one({"slug": slug})
        if art:
            response["article"] = _strip_mongo(art)
            if not response["article"].get("content_html") and response["article"].get("content"):
                response["article"]["content_html"] = response["article"]["content"]
    return response


@app.post("/api/admin/generate-article")
async def admin_generate_article(data: dict, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    title = data.get("title", "").strip()
    master_prompt = data.get("master_prompt", "").strip()
    extra_context = data.get("extra_context", "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Le champ 'title' est requis")

    system = (
        master_prompt
        if master_prompt
        else (
            "Tu es un expert en rédaction web SEO pour une entreprise d'aide numérique en Indre-et-Loire (37). "
            "Tu rédiges des articles de blog informatifs, bienveillants et accessibles, destinés à des personnes "
            "peu à l'aise avec la technologie. Style : clair, humain, professionnel. Pas de jargon technique inutile. "
            "Langue : français."
        )
    )

    context_block = f"\n\nContexte supplémentaire : {extra_context}" if extra_context else ""
    prompt = f"""Rédige un article de blog complet et optimisé SEO sur le sujet suivant : "{title}"{context_block}

L'article doit :
- Avoir une introduction engageante (2-3 paragraphes)
- Être structuré avec des sous-titres H2 et H3 (en markdown)
- Contenir entre 600 et 900 mots
- Inclure des conseils pratiques et concrets
- Se terminer par une conclusion avec un appel à l'action doux
- Être rédigé en français

Retourne UNIQUEMENT le contenu de l'article en HTML (utilise <h2>, <h3>, <p>, <ul>, <li>, <strong>). Pas de balise <html>, <body> ou <head>."""

    html_content = await _claude(prompt, system=system, max_tokens=2000)

    # Build a complete article document
    slug = _slug(title)
    # Ensure unique slug
    existing = await db["articles"].find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    # Extract a short excerpt (first ~160 chars of text content)
    import re as _re
    plain = _re.sub(r"<[^>]+>", "", html_content)
    excerpt = plain.strip()[:160].rsplit(" ", 1)[0] + "…" if len(plain) > 160 else plain.strip()

    now = _now()
    article = {
        "slug": slug,
        "title": title,
        "content": html_content,        # Claude-origin field
        "content_html": html_content,   # WordPress-origin field — kept in sync
        "excerpt": excerpt,
        "category": data.get("default_category", "Conseils & Astuces"),
        "tags": [],
        "status": "published",          # Published immediately so it's visible on the public site
        "source": "ai_generated",
        "featured_image": "",
        "meta_title": title,
        "meta_description": excerpt,
        "date_published": now,
        "date_modified": now,
        "created_at": now,
        "updated_at": now,
        "ai_generated": True,
    }
    await db["articles"].insert_one(article)
    article = _strip_mongo(article)
    return {"success": True, "article": article}


@app.post("/api/admin/sitemap/regenerate")
async def admin_regenerate_sitemap(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    return {"success": True, "message": "Sitemap régénéré dynamiquement à chaque requête"}


@app.post("/api/ai-generate")
async def ai_generate_image(request: Request, authorization: Optional[str] = Header(None)):
    """
    Image generation endpoint — currently requires an external image AI API
    (DALL-E, Stable Diffusion, etc.) which is not configured.
    Returns a clear 503 so the frontend can display a helpful message.
    """
    _check_admin(authorization)
    raise HTTPException(
        status_code=503,
        detail=(
            "La génération d'images IA nécessite une clé API dédiée (OpenAI DALL-E ou Stable Diffusion). "
            "Uploadez vos propres images ou utilisez des images libres de droits depuis Unsplash, Pexels, etc."
        )
    )


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

    meta: dict = {
        "filename": filename, "category": category, "context": context,
        "original_name": file.filename, "size": len(content), "mime": mime,
        "created_at": _now(),
    }

    if _CLOUDINARY_AVAILABLE:
        try:
            cld = await _upload_to_cloudinary(content, filename)
            meta["cloudinary_url"] = cld["url"]
            meta["cloudinary_public_id"] = cld["public_id"]
            meta["url"] = cld["url"]
        except Exception as e:
            print(f"[cloudinary] upload failed, falling back to base64: {e}")
            import base64
            meta["data_b64"] = base64.b64encode(content).decode("utf-8")
            meta["url"] = f"/api/uploads/{filename}"
    else:
        import base64
        meta["data_b64"] = base64.b64encode(content).decode("utf-8")
        meta["url"] = f"/api/uploads/{filename}"

    await db["media"].insert_one(meta)

    # Also write to filesystem as cache (best-effort, local dev)
    try:
        (UPLOADS_DIR / filename).write_bytes(content)
    except Exception:
        pass

    return {"url": meta["url"], "filename": filename}


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
    for file in files:
        ext = Path(file.filename).suffix.lower() if file.filename else ".bin"
        if ext not in allowed:
            results.append({"error": f"{file.filename} : type non autorisé", "filename": file.filename})
            continue
        content = await file.read()
        mime = mime_map.get(ext, "application/octet-stream")
        prefix = "ai_" if context == "ai" else ""
        filename = f"{prefix}{uuid.uuid4().hex}{ext}"

        meta: dict = {
            "filename": filename, "category": category, "context": context,
            "original_name": file.filename, "size": len(content), "mime": mime,
            "created_at": _now(),
        }

        if _CLOUDINARY_AVAILABLE:
            try:
                cld = await _upload_to_cloudinary(content, filename)
                meta["cloudinary_url"] = cld["url"]
                meta["cloudinary_public_id"] = cld["public_id"]
                meta["url"] = cld["url"]
            except Exception as e:
                print(f"[cloudinary] upload {filename} failed, falling back to base64: {e}")
                import base64
                meta["data_b64"] = base64.b64encode(content).decode("utf-8")
                meta["url"] = f"/api/uploads/{filename}"
        else:
            import base64
            meta["data_b64"] = base64.b64encode(content).decode("utf-8")
            meta["url"] = f"/api/uploads/{filename}"

        await db["media"].insert_one(meta)
        try:
            (UPLOADS_DIR / filename).write_bytes(content)
        except Exception:
            pass
        results.append({"url": meta["url"], "filename": filename, "original_name": file.filename})
    return {"uploaded": len([r for r in results if "url" in r]), "total": len(files), "results": results}


@app.get("/api/upload/gallery")
async def get_gallery(authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    # Exclude data_b64 from projection — never send MBs of base64 to frontend
    docs = await db["media"].find({}, {"data_b64": 0}).sort("created_at", -1).to_list(length=500)
    return [_strip_mongo(d) for d in docs]


@app.delete("/api/uploads/{filename}")
async def delete_upload(filename: str, authorization: Optional[str] = Header(None)):
    _check_admin(authorization)
    path = UPLOADS_DIR / filename
    if path.exists():
        path.unlink()
    # Also delete from Cloudinary if applicable
    doc = await db["media"].find_one({"filename": filename})
    if doc and doc.get("cloudinary_public_id") and _CLOUDINARY_AVAILABLE:
        await _delete_from_cloudinary(doc["cloudinary_public_id"])
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

@app.get("/api/admin/articles/content-audit")
async def admin_content_audit(authorization: Optional[str] = Header(None)):
    """Report on how many articles have real body content vs empty."""
    _check_admin(authorization)
    total     = await db["articles"].count_documents({})
    has_html  = await db["articles"].count_documents({"content_html": {"$exists": True, "$nin": [None, ""]}})
    has_plain = await db["articles"].count_documents({"content":      {"$exists": True, "$nin": [None, ""]}})
    has_any   = await db["articles"].count_documents({"$or": [
        {"content_html": {"$exists": True, "$nin": [None, ""]}},
        {"content":      {"$exists": True, "$nin": [None, ""]}},
    ]})
    empty     = total - has_any
    by_source = {}
    for src in ["wordpress", "ai_generated", None]:
        q = {"source": src} if src else {"source": {"$exists": False}}
        c = await db["articles"].count_documents(q)
        if c: by_source[src or "unknown"] = c
    by_status = {}
    for st in ["published", "draft", "scheduled", None]:
        q = {"status": st} if st else {"status": {"$exists": False}}
        c = await db["articles"].count_documents(q)
        if c: by_status[st or "unknown"] = c
    # Sample of empty articles (first 5)
    empty_samples = await db["articles"].find(
        {"content_html": {"$in": [None, ""]}, "content": {"$in": [None, ""]}},
        {"slug": 1, "title": 1, "source": 1, "status": 1}
    ).limit(5).to_list(5)
    return {
        "total": total,
        "with_content": has_any,
        "with_content_html": has_html,
        "with_content_field": has_plain,
        "empty_content": empty,
        "by_source": by_source,
        "by_status": by_status,
        "empty_samples": [_strip_mongo(d) for d in empty_samples],
    }


@app.get("/api/admin/articles/export-backup")
async def admin_export_backup(authorization: Optional[str] = Header(None)):
    """Export all articles as JSON (including content) — use to create a local backup."""
    _check_admin(authorization)
    docs = await db["articles"].find({}).to_list(length=5000)
    cleaned = [_strip_mongo(d) for d in docs]
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content=cleaned,
        headers={"Content-Disposition": "attachment; filename=articles_backup.json"},
    )


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
