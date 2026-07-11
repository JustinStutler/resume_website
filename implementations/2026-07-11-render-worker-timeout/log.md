# Log — Render worker timeout

## 2026-07-11
- Read `config.py`, `ai_service.py`, `app.py`, `scope_guard.py`, `requirements.txt`.
- Probed live endpoint:
  - `hello` → 200 OK, 11.3s, real answer (key + model work).
  - `Tell me about Justin` → 500 with bare HTML `Internal Server Error` (worker killed, not our JSON).
- Timed pipeline locally with the real key: scope 1.4s + select 17.6s + generate 6.9s = 27.2s.
- Diagnosis: gunicorn default 30s worker timeout < heavy-query latency. No `Procfile`/`render.yaml`
  existed, so the default applied.
- Fix applied:
  - Created `server/Procfile` → `web: gunicorn app:app --timeout 120 --graceful-timeout 30 --workers 1 --threads 4`.
  - Added `timeout=30.0` to the OpenAI client in `ai_service.py`.
- Handoff: user must ensure Render honors the Procfile (clear the dashboard Start Command, or set it
  to match) then redeploy. Not yet verified against live deploy (requires Render redeploy by user).

### Latency follow-up (same day)
- Tried capping `max_tokens` on the scope + select stages to cut latency. **Reverted** — on
  `openrouter/free` routing, tight caps starve reasoning-style models so they emit `content=None`,
  which made the scope guard fail-open every call and the selector fall back to `tell-me-about`.
- **Kept** the strictly-beneficial part: `content = (… or "").strip()` None-guards in both stages,
  so a blank free-tier reply degrades gracefully instead of crashing.
- Verified locally (caps removed): 2 runs, scope parsed True, selector returned real multi-page id
  sets, full-length answers, no fallbacks. Timing was **63.7s** then **25.6s** — huge free-tier
  variance that confirms the old 30s default was the killer; both sit safely under the new 120s
  gunicorn timeout, and the per-call `timeout=30` bounds each stage.
- Final code changes: `server/Procfile` (timeout 120), client `timeout=30.0`, None-guards in
  `ai_service.select_context` + `scope_guard.check_scope`. Caps NOT included.
