# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI-powered personal resume website where visitors can chat with an AI assistant (powered by Google Gemini) to learn about Justin Stutler. The frontend is deployed on Netlify; the backend on Render.

**Live site:** https://justinstutlerai.netlify.app/

## Running the Project

**Backend (Flask server):**
```bash
cd server
pip install -r requirements.txt
python app.py   # Runs on http://localhost:5001
```

**Frontend:**
Open `client/index.html` directly in a browser or use VS Code Live Server. No build step required.

**Environment:**
- Copy `.env.example` → `.env` and set `GEMINI_API_KEY`
- Activate Python virtual environment before running server

## Architecture

### Two-Stage AI Pipeline

User queries go through two sequential Gemini API calls in `server/ai_service.py`:

1. **`select_context()`** — JSON-mode Gemini call that identifies which context chunks are relevant to the query (returns IDs like `["resume", "tell_me_about"]`)
2. **`generate_answer()`** — Second Gemini call that uses only the selected chunks to generate a response constrained to that context

Context chunks are loaded from `server/content/*.txt` files at startup via `context_loader.py`. Available chunks: `resume`, `sop`, `gre_scores`, `courses`, `personal_background`, `tell_me_about`.

### API Fallback Logic

`client/js/api.js` tries the Render production endpoint first (`https://resume-website-c625.onrender.com/ask`), then falls back to `http://localhost:5001/ask`. Update both URLs in `client/js/config.js`.

### Frontend Module Structure

Vanilla JS ES6 modules with no build system:
- `main.js` — bootstraps state, services, and event listeners
- `events/handlers.js` — handles user input and suggestion button clicks
- `api.js` — `callJustinAI()` with loading indicators and warm-up message logic
- `ui.js` — DOM manipulation and markdown rendering (via marked.js CDN)
- `services/` — `CourseManager` (deduplication), `GalleryManager` (random portraits), `DocumentManager` (PDFs)
- `data.js` — static arrays for image gallery and course list

### Chat History

The frontend maintains `chatHistoryArray` and sends the last 4 turns with each request as `{ role: 'user'|'model', parts: [{ text }] }`.

## Key Configuration

- `server/config.py` — `GEMINI_API_KEY` and CORS allowed origins
- `client/js/config.js` — production/development API endpoints and UI constants
- Model in use: `gemini-2.5-flash-lite` (set in `ai_service.py`)

## Deployment

- **Frontend → Netlify:** Point to `client/` directory; no build command needed
- **Backend → Render:** Uses `gunicorn` as WSGI server; set `GEMINI_API_KEY` env var in Render dashboard


Update this file whenever you deem it necessary.