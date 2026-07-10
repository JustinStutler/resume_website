# Log — Wikipedia-style Wiki Interface + Docked Chat

Append-only. Newest entries at the bottom.

## 2026-07-10

- Created safety branch `feature/wikipedia-interface` off `main`.
- Researched frontend (index.html, main.js, handlers, ui.js, api.js, data.js) and backend
  (app.py, ai_service.py, vault_loader.py, test_vault_integrity.py). Confirmed all internal wiki
  links target wiki pages (no source links) → a wiki-only client index is self-contained.
- Decisions locked with user: move wiki into `client/`, serve raw `.md` live, generate a
  metadata-only `wiki-index.json`; only the wiki is public (sources stay at repo root); backend
  reads both roots; formatting → short/absent title + fluid prose; photo gallery → wiki Photos
  page; remove all suggestion buttons + GRE shortcut; column headers → top section-nav next to
  search; home = `justin-stutler` with an infobox portrait (`ice_cave.JPG`); phased build.

### Phase 1 — vault relocation + index generator (backend)
- Moved `Portfolio_Website_Vault/wiki/` → `client/vault/wiki/` (34 pages); removed stray
  `.ruff_cache`. Sources + meta stay private at `Portfolio_Website_Vault/`.
- `vault_loader.py`: added `WIKI_PATH`/`SOURCES_PATH`/`VAULT_PATHS` + `load_vault_roots()`;
  `VAULT` now merges both roots. `VAULT_PATH` kept as a back-compat alias (public wiki root).
- Added `server/gen_wiki_index.py` — emits `client/vault/wiki-index.json` (metadata only, wiki
  pages only, web paths relative to `client/`).
- Synced `test_vault_integrity.py` to walk `VAULT_PATHS`.
- Verified: integrity test PASS (41 pages: 35 wiki + 6 sources); index generated (35 pages).

### Phase 2 — chat formatting (backend)
- Relaxed the FORMATTING block of `ANSWER_SYSTEM_INSTRUCTION` in `ai_service.py`: fluid prose,
  no forced `## Title` (short `###` topic label only for long multi-part answers). Fixes the
  oversized/verbose title problem.

### Phase 3+4 — wiki frontend + docked chat
- Rewrote `client/index.html` into a wiki shell: top bar (brand + 6 colored section-nav links +
  search) on one level, article area, bottom docked chat (input always visible, panel collapses).
- New `client/css/wiki.css` (self-contained: Wikipedia-ish light theme, infobox, search
  dropdown, dock + reused chat-bubble styles). Old `style.css` no longer linked.
- New modules: `js/app.js`, `js/wiki/{wikiIndex,frontmatter,view,links,router,search}.js`,
  `js/chat/dock.js`. Dock reuses existing `api.js`/`ui.js`/`config.js`.
- `links.js` opens external + `.pdf`/image links in a new tab; marks unknown ids inert.

### Phase 5+6 — content (parallel subagent)
- Subagent created `personal/photos.md` (8 portraits, exact filename case) and
  `about-website/the-journey.md` (concise RAG→LLM-wiki story, kept Karpathy link); linked both
  from their hubs; trimmed duplication in `architecture-and-story.md`. Integrity PASS (37 wiki).
- Preserved resume/SOP access: linked both PDFs from `personal/contact-and-links.md`.

### Verification
- Regenerated index (37 wiki pages).
- Static validation script: 37 pages, all index paths on disk, all 8 images resolve (case-exact),
  **0 broken internal links, 0 warnings → PASS**.
- `node --check` (ESM) on all 8 new JS modules → all OK.
- Backend import check: `vault_loader` (43 pages), `ai_service`, `app` import cleanly.
- Served `client/` via `http.server`: index.html, css, js, wiki-index.json, wiki `.md`, and
  portraits all return 200; `vault/sources/*` and traversal attempts return **404** (privacy
  requirement holds — sources physically outside the web root).

### Phase 7 — Cleanup & Docs
- Deleted unreferenced legacy code: `client/js/main.js`, `script.js`, `eventHandlers.js`, `data.js`, the `js/events/` directory, and `js/services/` directory.
- Deleted `client/css/style.css` (superseded by `wiki.css`).
- Deleted obsolete content files in `client/content/` (`GRE_Scores_Formatted.md`, `how_this_works.md`, `tell_me_about.txt`).
- Updated root `README.md` to document the new Wikipedia-style architecture and docked chat instead of the old Quick Query Chips.
