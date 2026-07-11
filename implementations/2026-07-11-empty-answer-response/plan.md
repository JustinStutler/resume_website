# Plan — "I received an empty response" on deployed chat

## Symptom
On the live site, a substantive query ("tell me something unique about Justin and
why he'd be a good hire as an information specialist") returned the frontend message
**"I received an empty response. Please try again."** A greeting ("hello") worked.

## Root cause
`client/js/api.js:101` renders `data.response || "I received an empty response..."`.
The backend `ai_service.generate_answer()` returned `response.choices[0].message.content`
**without a None-guard**. On `openrouter/free` dynamic routing, the answer model
intermittently returns `content=None` (same free-tier flakiness the prior session
guarded against in the scope-guard and selector stages — but that guard was never
applied to the answer stage). `None` → `{"response": null}` → falsy → "empty response".
Heavier queries trip the empty-completion behavior more often than cheap greetings.

## Fix
In `generate_answer()`: wrap the completion in a retry loop (3 attempts, since free
routing may land on a different working model), coalesce `content` with `(… or "").strip()`,
and return a non-empty fallback message (pointing to email) if all attempts are empty.
Guarantees the endpoint never returns `null`/empty.

## Risks
- Retries add latency on the (rare) empty path; bounded by the per-call `timeout=30`
  and the gunicorn `--timeout 120`, so worst case stays under the worker limit.
- Does not change the underlying free-tier flakiness; it degrades gracefully instead.
