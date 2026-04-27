import os
import json
import httpx

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city to suggest weather-appropriate outfits",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name e.g. London, Mumbai, New York"}
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_moodboard_images",
            "description": "Search for real fashion inspiration images. Always call for moodboard AND outfit requests.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Fashion search query e.g. 'minimal summer editorial linen beige'"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Search for real shoppable fashion products with prices and buy links. Always call for outfit/looks requests.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Product search e.g. 'white linen shirt women summer'"},
                    "budget": {"type": "string", "description": "Budget range e.g. 'under $50' or 'under 2000 rupees'"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_outfit_image",
            "description": "Generate an AI illustration of a complete outfit using DALL-E. Call for looks requests.",
            "parameters": {
                "type": "object",
                "properties": {
                    "description": {"type": "string", "description": "Detailed outfit description e.g. 'A fashion editorial photo of a woman wearing a flowing white linen dress, strappy sandals, minimal gold jewelry, soft natural lighting'"}
                },
                "required": ["description"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_trends",
            "description": "Search the web for current fashion trends and news",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Trend search query e.g. 'SS26 fashion trends womenswear'"}
                },
                "required": ["query"]
            }
        }
    }
]

NOT_AVAILABLE = {"not_available": True, "reason": "Shopping unavailable. Return full items array with 4-6 outfit pieces but set shopCards to []."}


async def get_weather(city: str) -> dict:
    key = os.getenv("OPENWEATHER_KEY")
    if not key:
        return {"error": "OPENWEATHER_KEY not set", "city": city, "temp": 22,
                "condition": "clear", "outfit_note": "Mild weather — layers work well"}
    async with httpx.AsyncClient(timeout=8) as client:
        try:
            res = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": key, "units": "metric"}
            )
            d = res.json()
        except Exception as e:
            return {"error": str(e)}
    if d.get("cod") != 200:
        return {"error": f"City not found: {city}"}
    temp = round(d["main"]["temp"])
    if temp > 32:
        note = "Very hot — breathable linen, cotton, chambray. Avoid synthetics."
    elif temp > 26:
        note = "Warm — lightweight fabrics. Light layers for AC spaces."
    elif temp > 20:
        note = "Pleasant — transitional dressing. Light knits or cotton."
    elif temp > 14:
        note = "Mild — layer with a light jacket or cardigan."
    elif temp > 5:
        note = "Cold — knitwear, wool coats, thermal layering."
    else:
        note = "Very cold — heavy wool, down, thermal base layers essential."
    return {
        "city": d["name"],
        "temp": temp,
        "feels_like": round(d["main"]["feels_like"]),
        "condition": d["weather"][0]["description"],
        "humidity": d["main"]["humidity"],
        "outfit_note": note
    }


async def search_moodboard_images(query: str) -> list:
    pinterest_token = os.getenv("PINTEREST_TOKEN")
    if pinterest_token:
        try:
            result = await _pinterest_official(query, pinterest_token)
            if result:
                print(f"[images] Pinterest → {len(result)}")
                return result
        except Exception as e:
            print(f"[Pinterest failed]: {e}")

    unsplash_key = os.getenv("UNSPLASH_KEY")
    if unsplash_key:
        try:
            result = await _unsplash(query, unsplash_key)
            if result:
                print(f"[images] Unsplash → {len(result)}")
                return result
        except Exception as e:
            print(f"[Unsplash failed]: {e}")

    print("[images] all sources failed — check UNSPLASH_KEY in .env")
    return []


async def _pinterest_official(query: str, token: str) -> list:
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            "https://api.pinterest.com/v5/pins",
            params={"query": query, "page_size": 6},
            headers={"Authorization": f"Bearer {token}"}
        )
    d = res.json()
    results = []
    for pin in d.get("items", []):
        img = pin.get("media", {}).get("images", {})
        url = (img.get("600x", {}).get("url") or img.get("400x300", {}).get("url") or "")
        if url:
            results.append({
                "url": url,
                "label": " ".join((pin.get("title") or query).split()[:2]).lower(),
                "color": "#C4859A", "source": "pinterest",
                "link": f"https://pinterest.com/pin/{pin.get('id','')}"
            })
    return results


async def _unsplash(query: str, key: str) -> list:
    async with httpx.AsyncClient(timeout=8) as client:
        res = await client.get(
            "https://api.unsplash.com/search/photos",
            params={"query": f"{query} fashion editorial", "per_page": 6,
                    "orientation": "squarish", "content_filter": "high"},
            headers={"Authorization": f"Client-ID {key}"}
        )
    d = res.json()
    return [
        {
            "url": p["urls"]["small"],
            "label": " ".join((p.get("alt_description") or query).split()[:2]).lower(),
            "color": p.get("color", "#C4859A"),
            "source": "unsplash",
            "link": p.get("links", {}).get("html", "")
        }
        for p in d.get("results", []) if p.get("urls", {}).get("small")
    ]


async def _rapidapi_search(query: str, key: str, country: str = "us") -> list:
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(
            "https://real-time-product-search.p.rapidapi.com/search-v2",
            params={"q": query, "country": country, "language": "en", "limit": "10"},
            headers={
                "X-RapidAPI-Key": key,
                "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com"
            }
        )

    d = res.json()
    print(f"[products] HTTP {res.status_code} | keys: {list(d.keys())}")

    # API returned an error message
    if "message" in d and "data" not in d:
        print(f"[products] API error: {d['message']}")
        return []

    # extract products from whichever key they're under
    products = (
        d.get("data", {}).get("products") or
        d.get("data", {}).get("items") or
        d.get("products") or
        d.get("items") or
        (d.get("data") if isinstance(d.get("data"), list) else None) or
        []
    )

    if isinstance(products, dict):
        products = products.get("products") or products.get("items") or []

    print(f"[products] found {len(products)} products (country={country})")
    return products


async def search_products(query: str, budget: str = "") -> list:
    key = os.getenv("RAPIDAPI_KEY")
    if not key:
        print("[products] RAPIDAPI_KEY not set")
        return NOT_AVAILABLE

    try:
        # Try with simple clean query — avoid budget strings in query
        clean_query = query.replace("under 1000 Rs", "").replace("Rs", "").strip()

        # Try India first, then US
        products = await _rapidapi_search(clean_query, key, country="in")
        if not products:
            products = await _rapidapi_search(clean_query, key, country="us")
        if not products:
            # last attempt with even simpler query (first 3 words only)
            simple = " ".join(clean_query.split()[:4])
            products = await _rapidapi_search(simple, key, country="us")

        if not products:
            print("[products] all attempts returned 0 — returning not_available")
            return NOT_AVAILABLE

        results = []
        for p in products[:3]:
            price_range = p.get("typical_price_range") or []
            price = (
                price_range[0] if price_range else
                p.get("offer", {}).get("price") or
                p.get("price") or
                "See link"
            )
            photos = p.get("product_photos") or p.get("images") or []
            results.append({
                "name": (p.get("product_title") or p.get("title") or "")[:50],
                "brand": p.get("brand") or p.get("store") or "",
                "price": str(price),
                "link": p.get("product_page_url") or p.get("url") or "",
                "image": photos[0] if photos else "",
                "category": "fashion"
            })
        return results if results else NOT_AVAILABLE

    except Exception as e:
        print(f"[products] exception: {e}")
        return NOT_AVAILABLE


async def generate_outfit_image(description: str) -> dict:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return {"url": "", "error": "No OpenAI key"}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model": "dall-e-3",
                    "prompt": f"Fashion editorial photograph: {description}. High-end fashion magazine style, clean aesthetic, professional lighting, no text or watermarks.",
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard"
                }
            )
        d = res.json()
        url = d.get("data", [{}])[0].get("url", "")
        print(f"[dalle] generated: {bool(url)}")
        return {"url": url}
    except Exception as e:
        print(f"[dalle] error: {e}")
        return {"url": "", "error": str(e)}


async def search_trends(query: str) -> dict:
    key = os.getenv("TAVILY_KEY")
    if not key:
        return {"summary": "Trend data unavailable.", "sources": []}
    async with httpx.AsyncClient(timeout=12) as client:
        try:
            res = await client.post(
                "https://api.tavily.com/search",
                json={"api_key": key, "query": query, "search_depth": "basic",
                      "max_results": 4, "include_answer": True}
            )
            d = res.json()
        except Exception as e:
            return {"summary": f"Search failed: {e}", "sources": []}
    return {
        "summary": d.get("answer", ""),
        "sources": [{"title": r.get("title",""), "snippet": r.get("content","")[:150]}
                    for r in d.get("results", [])]
    }


async def execute_tool(name: str, args: dict):
    print(f"[tool] {name}({list(args.keys())})")
    if name == "get_weather":             return await get_weather(**args)
    if name == "search_moodboard_images": return await search_moodboard_images(**args)
    if name == "search_products":         return await search_products(**args)
    if name == "generate_outfit_image":   return await generate_outfit_image(**args)
    if name == "search_trends":           return await search_trends(**args)
    return {"error": f"Unknown tool: {name}"}
