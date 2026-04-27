import asyncio
import json
import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from typing import Optional

from tools import TOOLS, execute_tool
from prompt import SYSTEM_PROMPT

load_dotenv()

app = FastAPI(title="Atelier API v2")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_methods=["POST", "GET", "DELETE"],
    allow_headers=["*"],
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


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0",
        "tools": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "dalle": bool(os.getenv("OPENAI_API_KEY")),
            "unsplash": bool(os.getenv("UNSPLASH_KEY")),
            "weather": bool(os.getenv("OPENWEATHER_KEY")),
            "shopping": bool(os.getenv("RAPIDAPI_KEY")),
            "trends": bool(os.getenv("TAVILY_KEY")),
            "supabase": bool(os.getenv("SUPABASE_URL")),
            "pinterest": bool(os.getenv("PINTEREST_TOKEN")),
        }
    }


@app.post("/chat")
async def chat(req: ChatRequest):
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

    messages = list(req.messages)
    if context_prefix and messages:
        last = messages[-1]
        messages[-1] = {**last, "content": context_prefix + last.get("content", "")}

    current_messages = [{"role": "system", "content": SYSTEM_PROMPT}, *messages]

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

            # Save to conversation history
            if req.user_id and req.session_id:
                sb = get_supabase()
                if sb:
                    try:
                        sb.table("messages").insert({
                            "user_id": req.user_id,
                            "session_id": req.session_id,
                            "role": "assistant",
                            "content": content,
                        }).execute()
                    except Exception as e:
                        print(f"[supabase] save message failed: {e}")

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
        print(f"[save] error: {e}")
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
        print(f"[saves] error: {e}")
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
    return {"share_id": share_id, "url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/share/{share_id}"}


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


@app.get("/history/{user_id}")
async def get_history(user_id: str):
    sb = get_supabase()
    if not sb:
        return {"sessions": []}
    try:
        result = sb.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        return {"sessions": result.data}
    except Exception as e:
        return {"sessions": []}


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
