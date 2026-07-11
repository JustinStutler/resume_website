# Plan — AI service fails on Render deployment

## Symptom
Live site's AI chat fails on the Render backend. The OpenRouter API key was added to Render as
an env var and the service redeployed, but the failure persisted — so the key was suspected but
not confirmed as the cause.

## Investigation (evidence)
- `POST /ask {"query":"hello"}` → **200 OK**, real LLM answer, **11.3s** total.
- `POST /ask {"query":"Tell me about Justin"}` → **500**, but the body is a bare
  `<h1><p>Internal Server Error</p></h1>` HTML page, **not** the JSON error the route's
  `try/except` returns. An HTML 500 escaping the handler = the worker process itself was killed.
- Local timing of the 3-stage pipeline for a heavy query:
  scope 1.4s + **select_context 17.6s** + generate 6.9s = **27.2s** total. Render's free CPU is
  slower, pushing this over 30s.

## Root cause
Gunicorn's **default `--timeout` is 30s**. There is no `Procfile`/`render.yaml` in the repo, so
Render used that default. Heavy queries run 3 sequential OpenRouter free-tier calls (~27s locally,
more on Render), exceed 30s, gunicorn SIGKILLs the worker and returns the bare HTML 500. Light
queries (`hello` short-circuits `select_context`, 2 calls, 11s) stay under 30s → 200.

**The API key was NOT the (whole) problem** — the `hello` path proves the key works and the model
`openrouter/free` responds.

## Fix
1. Commit `server/Procfile` raising the gunicorn timeout to 120s (+ threads for concurrency):
   `web: gunicorn app:app --timeout 120 --graceful-timeout 30 --workers 1 --threads 4`
2. Add a per-call `timeout=30.0` to the OpenAI client so one hung upstream call fails as a caught
   exception (clean JSON error) instead of stacking up and killing the worker.

## Risks / follow-ups
- If Render's service was created from the dashboard (not a Blueprint), it may keep using the
  dashboard **Start Command**. The user must either clear it (so the `Procfile` is honored) or set
  it to `gunicorn app:app --timeout 120 --workers 1 --threads 4`.
- Real latency fix (separate): `select_context` at 17.6s dominates — it feeds the whole vault tree
  to a slow free model. Consider a faster selector model or a smaller index summary.
