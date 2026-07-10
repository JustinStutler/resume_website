# Plan: Button UI + Response Alignment with the Section-Level Wiki

**Date:** 2026-07-10
**Goal:** Reorganize the suggestion chips so the 6 columns map to the 6 wiki sections, mixing
instant "set responses" with live AI wiki shortcuts, and update the AI response guidance to match
the new section-level wiki (plus a "See also" behavior). Follows the vault restructure in
`implementations/2026-07-10-vault-wikipedia-restructure/`.

## Decisions (from discussion)
- Routing: **Hybrid** — prose shortcuts route to the AI/wiki; instant/deterministic answers
  (GRE table, PDFs, gallery, course list, static intro) stay as "set responses".
- Static files: **keep & regenerate from the vault** so they stop drifting.
- Responses: add **"See also"** (1-2 related topics) at the end of AI answers.
- Layout: 6 columns = 6 wiki sections, **max 3 chips per column** (drop excess AI chips).

## Final chip layout (all columns = 3)
- Academics: GRE Scores (set) · Random Course (set) · Education Timeline (AI)
- Career: Work Experience (AI) · Statement of Purpose (set/PDF) · Resume (set/PDF)
- Projects: Song Genre Capstone (PDF) · Connect 4 RL (PDF) · House Prices (PDF)
- Skills: All Skills (AI) · AI/ML Skills (AI) · Web Dev Skills (AI)
- Personal: Who is Justin? (set/static) · Hobbies & Interests (AI) · Photo Gallery (set)
- This Website: How This Works (set/static) · Tech Stack (AI) · GitHub (set/link)

Dropped as dedicated chips (still reachable by typing): Facial Recognition, Robot Localization,
Search Algorithms PDFs, and the "AI Interface" stub.

## Work items
1. `client/index.html` — rewrite the 6-column suggestions block (relabel + re-chip). Keep the
   existing column elements/colors to avoid CSS churn.
2. `client/js/events/handlers.js` — remove the `/\bgre\b/` free-text intercept so typed GRE
   questions reach the wiki (GRE button stays static via `local-markdown`). `ai-query` type is
   already supported.
3. Regenerate static files from the vault:
   - `client/content/how_this_works.md` ← about-website wiki (story + flow + tech-stack)
   - `client/content/tell_me_about.txt` ← justin-stutler root + tell-me-about
   - `client/content/GRE_Scores_Formatted.md` ← gre-scores (verify)
4. `server/ai_service.py::ANSWER_SYSTEM_INSTRUCTION` — enrich "HOW TO HANDLE COMMON QUERY TYPES"
   for the new granular topics; add "See also".
5. Verify: live entry is `main.js -> events/index.js -> events/handlers.js` (script.js /
   eventHandlers.js are dead). Drive new buttons + a typed GRE question.

## Risks
- Layout: pyramid-sort JS + flex should adapt to re-chipping; verify visually.
- AI latency/non-determinism on free tier (warm-up ~1 min) — acceptable for shortcuts.
- Ensure PDF keys used (cv-capstone, connect-4, housing-prices, resume, sop) still resolve in
  DocumentManager.
