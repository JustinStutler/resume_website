# Log: Button UI + Response Alignment (append-only)

## 2026-07-10

- Explored frontend: live chain is `main.js -> events/index.js -> events/handlers.js`
  (`script.js` / `eventHandlers.js` are dead legacy). Buttons dispatch on `data-type`; only
  `ai-query` and free-text input reach the wiki, and no button used `ai-query`.
- Discussed design; decisions recorded in `plan.md` (hybrid routing, regenerate static files,
  add "See also", 6 columns = 6 wiki sections, max 3 chips/column).

### Implementation (done)
- `client/index.html`: rewrote all 6 columns → 6 wiki sections (kept color classes to avoid CSS
  churn), 3 chips each. Final: Academics (GRE static · Random Course · Education Timeline AI),
  Career (Work Experience AI · SOP pdf · Resume pdf), Projects (Song Genre · Connect 4 · House
  Prices pdfs), Skills (All / AI-ML / Web Dev — all AI), Personal (Who is Justin? static ·
  Hobbies AI · Photo Gallery), This Website (How This Works static · Tech Stack AI · GitHub link).
- `handlers.js`: removed the `/\bgre\b/` free-text intercept — typed queries now all hit the AI
  (GRE button still serves the static table via its own `local-markdown` chip).
- `ai_service.py`: enriched `ANSWER_SYSTEM_INSTRUCTION` query-type guidance (specific school,
  skill category, hobbies/personality, role, tech-stack) + added a "See also" instruction.
- `client/content/how_this_works.md`: light refresh to mention the Wikipedia-style section tree.
- Confirmed PDF keys (cv-capstone, connect-4, housing-prices, resume, sop) resolve in
  DocumentManager; `viewRandomClassBtn` id retained for main.js.

### Test results — PASS (drove the live backend with the local OPENROUTER key)
- "What are Justin's GRE scores?" → AI-generated table + `**See also:** ... USF — Graduate`.
  Proves the typed-GRE path now goes through the wiki (intercept removed) and See also works.
- "What does Justin do for fun?" → Personal section (DJing/BJJ/sourdough/autotelic) + See also.
- "List Justin's web development skills" → skills-web-development content, and via 1-hop `related`
  expansion also pulled USF-undergraduate/capstone; ended with
  `**See also:** Software Engineering Skills, University of South Florida — Undergraduate`
  (matches the wiki's related graph). All returned HTTP 200.
- Note: one run of the web-dev query returned "User Safety: safe" — a known `openrouter/free`
  dynamic-model artifact (moderation token leak), not a code defect; clean on rephrase/retry.
  Flask debug reloader also intermittently restarts on stdlib file-access false positives.
- Structural: `ai_service` imports OK; index.html grep shows 6 columns × 3 chips with correct
  data-types; live entry chain unchanged (`main.js -> events/index.js -> handlers.js`).

### Follow-ups
- Free-tier model non-determinism can occasionally return odd tokens; consider pinning a specific
  OpenRouter model if this recurs in production.
- Dropped project PDFs (Facial Recognition, Robot Localization, Search Algorithms) remain
  reachable by typing; revisit if they warrant dedicated chips again.

### REVERTED (user request) — 2026-07-10
- User preferred the original quick-response buttons over the AI-query chips.
- Reverted `client/index.html` to the original 6 columns (Info, Academics, AI Projects, More
  Projects, Links, Docs) — verified: no `ai-query` chips / section emojis remain.
- Restored the `/\bgre\b/` quick-response intercept in `handlers.js` (now matches committed state).
- **Kept** (response-quality changes, not buttons; user did not object): the enriched
  `ANSWER_SYSTEM_INSTRUCTION` query-type guidance + "See also" in `ai_service.py`, and the
  `how_this_works.md` wiki-tree refresh. These still improve free-text AI answers. Can be reverted
  too on request.
