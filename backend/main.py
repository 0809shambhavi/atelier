import asyncio
import json
import os
import uuid
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from typing import Optional

from tools import TOOLS, execute_tool
from prompt import SYSTEM_PROMPT

load_dotenv()

app = FastAPI(title="Atelier API v2")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Build origins list — includes localhost, FRONTEND_URL, and all vercel.app domains
_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]
if os.getenv("FRONTEND_URL"):
    _origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow ALL vercel.app subdomains
    allow_methods=["POST", "GET", "DELETE"],
    allow_headers=["*"],
    allow_credentials=False,
)


def get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception as e:
        print(f"[supabase] init failed: {e}")
        return None


# ── Pydantic models ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    messages: list[dict]
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    context: Optional[dict] = None

class SaveRequest(BaseModel):
    user_id: str
    type: str
    data: dict
    title: str = ""

class FeedbackRequest(BaseModel):
    rating: int
    response_type: str
    message_text: str = ""
    comment: str = ""
    session_id: str = ""
    user_id: str = ""

class ShareRequest(BaseModel):
    data: dict
    type: str

class WishlistRequest(BaseModel):
    url: str
    session_id: Optional[str] = None   # used as local key when no auth


# ── Helper: load style profile ─────────────────────────────────────────────────

async def load_style_profile(session_id: Optional[str]) -> Optional[dict]:
    """Load style profile from Supabase if available, keyed by session_id."""
    if not session_id:
        return None
    sb = get_supabase()
    if not sb:
        return None
    try:
        result = sb.table("style_profiles") \
            .select("profile") \
            .eq("session_id", session_id) \
            .order("updated_at", desc=True) \
            .limit(1) \
            .execute()
        if result.data:
            print(f"[profile] loaded for session {session_id[:8]}...")
            return result.data[0]["profile"]
    except Exception as e:
        print(f"[profile] load failed: {e}")
    return None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "3.0",
        "tools": {
            "openai":    bool(os.getenv("OPENAI_API_KEY")),
            "dalle":     bool(os.getenv("OPENAI_API_KEY")),
            "unsplash":  bool(os.getenv("UNSPLASH_KEY")),
            "weather":   bool(os.getenv("OPENWEATHER_KEY")),
            "shopping":  bool(os.getenv("RAPIDAPI_KEY")),
            "trends":    bool(os.getenv("TAVILY_KEY")),
            "supabase":  bool(os.getenv("SUPABASE_URL")),
            "pinterest": bool(os.getenv("PINTEREST_TOKEN")),
        }
    }


@app.post("/chat")
async def chat(req: ChatRequest):
    # ── 1. Build sidebar context prefix ───────────────────────────────────────
    context_prefix = ""
    if req.context:
        parts = []
        if req.context.get("weather"):   parts.append(f"City/weather: {req.context['weather']}")
        if req.context.get("occasion"):  parts.append(f"Occasion: {req.context['occasion']}")
        if req.context.get("budget"):    parts.append(f"Budget: {req.context['budget']}")
        if req.context.get("style"):     parts.append(f"Style: {req.context['style']}")
        if req.context.get("bodyType"):  parts.append(f"Body type: {req.context['bodyType']}")
        if req.context.get("skinTone"):  parts.append(f"Skin tone: {req.context['skinTone']}")
        if req.context.get("wardrobe"):  parts.append(f"My wardrobe: {req.context['wardrobe']}")
        if parts:
            context_prefix = "[User context — " + " · ".join(parts) + "]\n"

    # ── 2. Inject style profile if it exists ─────────────────────────────────
    style_profile = await load_style_profile(req.session_id)
    if style_profile:
        # Build a readable summary for the prompt
        sp = style_profile
        profile_lines = []
        if sp.get("aesthetic"):     profile_lines.append(f"Aesthetic: {sp['aesthetic']}")
        if sp.get("colors"):        profile_lines.append(f"Colors: {', '.join(sp['colors'].get('always', []))}")
        if sp.get("silhouettes"):   profile_lines.append(f"Silhouettes: {', '.join(sp['silhouettes'].get('loves', []))}")
        if sp.get("price_comfort"): profile_lines.append(f"Price comfort: {json.dumps(sp['price_comfort'])}")
        if sp.get("brands"):        profile_lines.append(f"Brands owned: {', '.join(sp['brands'].get('owns', []))} | Aspirational: {', '.join(sp['brands'].get('aspirational', []))}")
        if sp.get("occasions"):     profile_lines.append(f"Occasions: {', '.join(sp['occasions'])}")
        if sp.get("avoid"):         profile_lines.append(f"Avoid: {', '.join(sp['avoid'])}")
        if sp.get("personality"):   profile_lines.append(f"Personality: {sp['personality']}")
        if profile_lines:
            context_prefix += "[Style Profile — " + " | ".join(profile_lines) + "]\n"

    # ── 3. Prepend context to last message ────────────────────────────────────
    messages = list(req.messages)
    if context_prefix and messages:
        last = messages[-1]
        messages[-1] = {**last, "content": context_prefix + last.get("content", "")}

    current_messages = [{"role": "system", "content": SYSTEM_PROMPT}, *messages]

    # ── 4. Tool loop ──────────────────────────────────────────────────────────
    for iteration in range(6):
        print(f"[loop] iteration {iteration + 1}")
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=2000,
            tools=TOOLS,
            tool_choice="auto",
            messages=current_messages
        )
        choice = response.choices[0]

        if choice.finish_reason == "stop":
            content = choice.message.content or ""
            print(f"[done] {content[:80]}...")
            return {"content": content}

        if choice.finish_reason == "tool_calls":
            assistant_msg = choice.message
            current_messages.append(assistant_msg)
            tool_results = await asyncio.gather(*[
                execute_tool(tc.function.name, json.loads(tc.function.arguments))
                for tc in assistant_msg.tool_calls
            ])
            for tc, result in zip(assistant_msg.tool_calls, tool_results):
                current_messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result)
                })

    raise HTTPException(status_code=500, detail="Tool loop exceeded max iterations")


# ── Wishlist personalisation ───────────────────────────────────────────────────

@app.post("/style/wishlist")
async def ingest_wishlist(req: WishlistRequest):
    """
    Fetch a Myntra / ASOS / Zara / H&M wishlist URL,
    extract product names, analyse with GPT, store style profile.
    """
    print(f"[wishlist] fetching {req.url[:60]}...")

    # Detect site
    url_lower = req.url.lower()
    site = "unknown"
    for s in ["myntra", "asos", "zara", "hm", "mango", "uniqlo", "nykaa", "ajio"]:
        if s in url_lower:
            site = s
            break

    # Fetch the wishlist page
    try:
        async with httpx.AsyncClient(
            timeout=20,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
            follow_redirects=True
        ) as hclient:
            res = await hclient.get(req.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {e}")

    if res.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Page returned {res.status_code}")

    # Parse HTML and extract product titles / text
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(res.text, "html.parser")

        # Remove scripts and styles
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        # Extract product-looking text — try common selectors first
        products = []
        for sel in [
            ".product-title", ".product-name", ".item-name",
            "h2", "h3", "[class*='product']", "[class*='item']",
            "[class*='title']", "[data-testid*='product']"
        ]:
            for el in soup.select(sel):
                text = el.get_text(strip=True)
                if 3 < len(text) < 120:
                    products.append(text)
            if len(products) >= 30:
                break

        # Fallback: grab all meaningful text blocks
        if len(products) < 5:
            for el in soup.find_all(["h2", "h3", "h4", "p"]):
                text = el.get_text(strip=True)
                if 5 < len(text) < 100:
                    products.append(text)

        # Deduplicate preserving order
        seen = set()
        products = [p for p in products if not (p in seen or seen.add(p))]
        products = products[:60]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not parse page: {e}")

    if not products:
        raise HTTPException(status_code=400, detail="No products found on this page. Try a public wishlist or paste a category/search page.")

    print(f"[wishlist] extracted {len(products)} items from {site}")

    # Send to GPT for style analysis
    analysis_prompt = f"""
You are a fashion analyst. Analyse this product list from a {site} wishlist/page
and extract the user's style profile.

Products found:
{chr(10).join(f'- {p}' for p in products[:40])}

Return ONLY valid JSON with this exact structure:
{{
  "aesthetic": "2-4 word aesthetic label e.g. clean minimal, boho eclectic, quiet luxury",
  "personality": "2 sentences describing their style personality",
  "colors": {{
    "always": ["color1", "color2"],
    "often": ["color3"],
    "never": ["color4"]
  }},
  "silhouettes": {{
    "loves": ["silhouette1", "silhouette2"],
    "avoids": ["silhouette3"]
  }},
  "price_comfort": {{
    "daily_wear": "price range e.g. Rs.500-2000",
    "investment": "price range e.g. Rs.3000-8000"
  }},
  "brands": {{
    "owns": ["brand1", "brand2"],
    "aspirational": ["brand3"]
  }},
  "occasions": ["occasion1", "occasion2"],
  "avoid": ["style element to avoid"],
  "items_analysed": {len(products)},
  "site": "{site}"
}}
"""

    try:
        gpt_response = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=800,
            messages=[{"role": "user", "content": analysis_prompt}],
            response_format={"type": "json_object"}
        )
        profile = json.loads(gpt_response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT analysis failed: {e}")

    print(f"[wishlist] profile extracted: {profile.get('aesthetic', '?')}")

    # Save to Supabase if configured, keyed by session_id
    if req.session_id:
        sb = get_supabase()
        if sb:
            try:
                sb.table("style_profiles").upsert({
                    "session_id": req.session_id,
                    "source": "wishlist",
                    "source_url": req.url,
                    "profile": profile,
                    "updated_at": "now()"
                }, on_conflict="session_id").execute()
                print(f"[wishlist] saved to Supabase")
            except Exception as e:
                print(f"[wishlist] Supabase save failed: {e}")

    return {
        "ok": True,
        "profile": profile,
        "items_found": len(products),
        "site": site
    }


@app.get("/style/profile/{session_id}")
async def get_style_profile(session_id: str):
    """Get the stored style profile for a session."""
    profile = await load_style_profile(session_id)
    if not profile:
        return {"profile": None}
    return {"profile": profile}


@app.delete("/style/profile/{session_id}")
async def delete_style_profile(session_id: str):
    """Let users reset their style profile."""
    sb = get_supabase()
    if not sb:
        return {"ok": False}
    try:
        sb.table("style_profiles").delete().eq("session_id", session_id).execute()
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ── Save / Share / Feedback endpoints (unchanged) ──────────────────────────────

@app.post("/save")
async def save_item(req: SaveRequest):
    sb = get_supabase()
    if not sb:
        return {"ok": False, "error": "Supabase not configured"}
    try:
        result = sb.table("saved_items").insert({
            "user_id": req.user_id,
            "type": req.type,
            "data": req.data,
            "title": req.title,
        }).execute()
        return {"ok": True, "id": result.data[0]["id"] if result.data else None}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.get("/saves/{user_id}")
async def get_saves(user_id: str):
    sb = get_supabase()
    if not sb:
        return {"items": []}
    try:
        result = sb.table("saved_items").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"items": result.data}
    except Exception as e:
        return {"items": []}


@app.delete("/saves/{item_id}")
async def delete_save(item_id: str):
    sb = get_supabase()
    if not sb:
        return {"ok": False}
    try:
        sb.table("saved_items").delete().eq("id", item_id).execute()
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.post("/share")
async def create_share(req: ShareRequest):
    share_id = str(uuid.uuid4())[:8]
    sb = get_supabase()
    if sb:
        try:
            sb.table("shares").insert({
                "share_id": share_id,
                "type": req.type,
                "data": req.data,
            }).execute()
        except Exception as e:
            print(f"[share] db save failed: {e}")
    return {
        "share_id": share_id,
        "url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/share/{share_id}"
    }


@app.get("/share/{share_id}")
async def get_share(share_id: str):
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=404, detail="Share not found")
    try:
        result = sb.table("shares").select("*").eq("share_id", share_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Share not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/feedback")
async def feedback(req: FeedbackRequest):
    print(f"[feedback] rating={req.rating} type={req.response_type}")
    sb = get_supabase()
    if sb:
        try:
            sb.table("feedback").insert({
                "rating": req.rating,
                "response_type": req.response_type,
                "message_text": req.message_text[:200],
                "comment": req.comment,
                "session_id": req.session_id,
                "user_id": req.user_id,
            }).execute()
        except Exception as e:
            print(f"[feedback] save failed: {e}")
    return {"ok": True}