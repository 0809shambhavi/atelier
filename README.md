# Atelier v2 — AI Fashion Moodboard Chatbot

Full-stack fashion AI with user accounts, saved looks, shareable moodboards, AI outfit generation, and real shopping links.

## What's new in v2

| Feature | How |
|---|---|
| User login | Supabase Auth — Google + email/password |
| Conversation history | Saved per user in Supabase |
| Saved moodboards & looks | One-click save, view in "Saved looks" |
| Shareable links | `/share/:id` — anyone can view without login |
| AI outfit image | DALL-E 3 generates an illustration per look |
| Real shopping links | RapidAPI product search — real prices + buy URLs |
| Body type context | Sidebar pill — tailors cut/fit advice |
| Skin tone context | Sidebar pill — tailors color advice |
| My wardrobe | Tell Atelier what you own — outfits built around it |

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python FastAPI |
| AI brain | OpenAI gpt-4o-mini |
| Image generation | DALL-E 3 |
| Fashion images | Unsplash API (Pinterest when approved) |
| Weather | OpenWeatherMap |
| Shopping | RapidAPI Real-Time Product Search |
| Auth + DB | Supabase |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

## Quick start

### 1. Supabase setup

1. Go to supabase.com → create a free project
2. Go to SQL Editor → paste the contents of `backend/supabase_schema.sql` → Run
3. Go to Authentication → Providers → enable Google (optional) and Email
4. Copy your Project URL and anon key from Settings → API

### 2. Backend

```bash
cd backend
conda activate atelier        # or: python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in all keys
uvicorn main:app --reload --port 8000
```

Check: `http://localhost:8000/health`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open: `http://localhost:5173`

## API keys needed

| Key | Where | Free? |
|---|---|---|
| `OPENAI_API_KEY` | platform.openai.com | Pay per use |
| `UNSPLASH_KEY` | unsplash.com/developers | Free |
| `OPENWEATHER_KEY` | openweathermap.org | Free |
| `RAPIDAPI_KEY` | rapidapi.com → Real-Time Product Search | Free tier |
| `SUPABASE_URL` | supabase.com → Settings → API | Free |
| `SUPABASE_KEY` | supabase.com → Settings → API (anon key) | Free |
| `SUPABASE_SERVICE_KEY` | supabase.com → Settings → API (service_role) | Free |

## Deploy

**Frontend (Vercel):**
```bash
cd frontend && vercel --prod
# Add in Vercel dashboard:
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL
```

**Backend (Railway):**
```bash
cd backend && railway login && railway init && railway up
# Add all backend .env vars in Railway → Variables
```

## Supabase Auth — enable Google login

1. Supabase dashboard → Authentication → Providers → Google
2. Create OAuth credentials at console.cloud.google.com
3. Add Client ID and Secret to Supabase
4. Add `http://localhost:5173` and your Vercel URL to allowed redirect URLs

## Cost for 100-user beta

| Item | Cost |
|---|---|
| gpt-4o-mini chat | ~$0.05 |
| DALL-E 3 images (if enabled) | ~$0.04/image × usage |
| Supabase | Free tier |
| Railway backend | ~$0–5/month |
| Vercel frontend | Free |

Recommended: add $10 to OpenAI account. Covers everything.
