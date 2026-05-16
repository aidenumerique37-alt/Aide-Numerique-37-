"""
Seed la base MongoDB depuis backend/data/*.json
À lancer UNE SEULE FOIS sur un serveur vierge : python3 seed.py
Ne fait rien si les collections sont déjà remplies.
"""
import asyncio, json, os, sys
from pathlib import Path
import motor.motor_asyncio

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME",   "aidenumerique37")
DATA_DIR  = Path(__file__).parent / "data"

async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"🔌 Connected to {MONGO_URL}/{DB_NAME}")

    # ── Articles ──────────────────────────────────────────────────────────────
    if await db["articles"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "articles.json").read_text())
        for d in docs:
            d.pop("_id", None)
        await db["articles"].insert_many(docs)
        print(f"  ✅ articles: {len(docs)} insérés")
    else:
        print(f"  ⏭  articles: déjà présents ({await db['articles'].count_documents({})})")

    # ── Services ──────────────────────────────────────────────────────────────
    if await db["services"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "services.json").read_text())
        for d in docs: d.pop("_id", None)
        await db["services"].insert_many(docs)
        print(f"  ✅ services: {len(docs)} insérés")
    else:
        print(f"  ⏭  services: déjà présents")

    # ── City pages ────────────────────────────────────────────────────────────
    if await db["city_pages"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "city_pages.json").read_text())
        for d in docs: d.pop("_id", None)
        if docs:
            await db["city_pages"].insert_many(docs)
        print(f"  ✅ city_pages: {len(docs)} insérés")
    else:
        print(f"  ⏭  city_pages: déjà présents")

    # ── Partners ──────────────────────────────────────────────────────────────
    if await db["partners"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "partners.json").read_text())
        for d in docs: d.pop("_id", None)
        if docs:
            await db["partners"].insert_many(docs)
        print(f"  ✅ partners: {len(docs)} insérés")
    else:
        print(f"  ⏭  partners: déjà présents")

    # ── Partner categories (liste de strings) ────────────────────────────────
    if await db["partner_categories"].count_documents({}) == 0:
        raw = json.loads((DATA_DIR / "partner_categories.json").read_text())
        # Peut être une liste de strings ou de dicts
        if raw and isinstance(raw[0], str):
            docs = [{"name": name} for name in raw]
        else:
            docs = raw
            for d in docs: d.pop("_id", None)
        if docs:
            await db["partner_categories"].insert_many(docs)
        print(f"  ✅ partner_categories: {len(docs)} insérés")
    else:
        print(f"  ⏭  partner_categories: déjà présents")

    # ── Cities ────────────────────────────────────────────────────────────────
    if await db["cities"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "cities.json").read_text())
        for d in docs: d.pop("_id", None)
        if docs:
            await db["cities"].insert_many(docs)
        print(f"  ✅ cities: {len(docs)} insérés")
    else:
        print(f"  ⏭  cities: déjà présents")

    # ── Portfolio ─────────────────────────────────────────────────────────────
    if await db["portfolio"].count_documents({}) == 0:
        docs = json.loads((DATA_DIR / "portfolio.json").read_text())
        for d in docs: d.pop("_id", None)
        if docs:
            await db["portfolio"].insert_many(docs)
        print(f"  ✅ portfolio: {len(docs)} insérés")
    else:
        print(f"  ⏭  portfolio: déjà présents")

    # ── Site content (unique doc) ─────────────────────────────────────────────
    if await db["site_content"].count_documents({"_id": "main"}) == 0:
        doc = json.loads((DATA_DIR / "content.json").read_text())
        doc["_id"] = "main"
        await db["site_content"].insert_one(doc)
        print(f"  ✅ site_content: inséré")
    else:
        print(f"  ⏭  site_content: déjà présent")

    # ── Legal pages ───────────────────────────────────────────────────────────
    if await db["legal_pages"].count_documents({}) == 0:
        pages = json.loads((DATA_DIR / "legal_pages.json").read_text())
        for page_type, data in pages.items():
            data.pop("_id", None)
            data["page_type"] = page_type
            await db["legal_pages"].update_one(
                {"page_type": page_type}, {"$set": data}, upsert=True
            )
        print(f"  ✅ legal_pages: {len(pages)} pages insérées")
    else:
        print(f"  ⏭  legal_pages: déjà présentes")

    print("\n🎉 Seed terminé.")
    client.close()

asyncio.run(main())
