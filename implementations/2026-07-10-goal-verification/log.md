# Log: Goal Verification of `_.txt`

## 2026-07-10
- Read `_.txt` and enumerated 24 discrete requirements across the full spec.
- Reviewed prior implementation folders (`2026-07-10-wiki-overhaul`,
  `2026-07-10-wikipedia-interface`) — the overhaul is the live work (untracked).
- Audited the live code/content against each requirement:
  - `client/index.html`, `client/css/wiki.css` — topbar, sidebar, nav bar,
    cards, gradient title + submit button, dark theme, docked chat. ✅
  - `client/js/wiki/{view,router,links,search,wikiIndex,frontmatter}.js` and
    `client/js/chat/dock.js`, `client/js/app.js` — coherent; no obvious runtime
    bugs on read. Home defaults + chat collapsed confirmed.
  - `server/ai_service.py` — FORMATTING (no dashes/bullets, `###` headers,
    concise), FOLLOW UP (replaces "See also"), relaxed title. ✅
  - Vault: academics education-* pages standardized to Program/GPA/Dates cards;
    `the-journey.md` split out; skills grouped per category (no coloring);
    projects embedded as media cards.
- **Tests run:**
  - `python server/test_vault_integrity.py` → "All vault integrity checks PASSED"
    (43 pages: 37 wiki + 6 sources).
  - `python server/gen_wiki_index.py` → regenerated; `git status` shows NO drift
    in `wiki-index.json` (index is current).
  - Served `client/` via `python -m http.server 8099`; curl smoke test:
    index.html, vault/wiki-index.json, justin-stutler.md, js/app.js,
    portraits/ice_cave.JPG all → HTTP 200.
  - Verified media-map assets exist: all 6 project pngs + pdfs present under
    `client/pngs` & `client/pdfs`; all 8 portrait photos present.
- Dispatched a code-reviewer subagent for an independent correctness pass on the
  changed JS/CSS/HTML/py (embedding, collapsibles, race conditions).
- **Result:** 22/24 requirements fully implemented. 1 partial (project card
  content standardization — G1), 1 judgment call (photo archival — G2).
  See `plan.md` matrix and `notes.md`.

### Code-review subagent findings + fixes (2026-07-10)
The reviewer confirmed no XSS and that project-card nesting is safe, but found two
real bugs and one doc mismatch:

- **[HIGH] Home-page "## Sections" swallowed the hub-card gallery.** `justin-stutler.md`
  is the only hub whose body has its own `## Sections` H2. The collapsible pass's
  sibling-walk ran past the following `<ul>` into the appended `.embedded-subpages`
  container, so collapsing "Sections" hid all 6 hub cards and nested them a level
  deep. **Fixed** in `view.js`: the walk now also stops when it reaches an
  `.embedded-subpages` element. Verified with a DOM-simulation test — "Sections"
  now consumes only its `<p>`/`<ul>`; the gallery stays a top-level article child.
- **[MEDIUM-HIGH] Stale-render race.** `renderPage` awaits two fetches before
  mutating the DOM with no cancellation, so fast A→B navigation could let A's late
  render overwrite B. **Fixed** with a module-level `renderToken`; the render aborts
  after each await if a newer navigation started.
- **[MEDIUM] `ai_service.py` vs `CLAUDE.md` mismatch.** The new no-bullets/`###`
  formatting was explicitly requested in `_.txt` (#13/#39), so it's intentional —
  **not reverted**. Updated `CLAUDE.md`'s FORMATTING note so docs match the code
  and the "be concise" guard is preserved.

### Re-tests after fixes
- `node --check view.js` (as ESM) → SYNTAX OK.
- DOM-simulation of the collapsible walk → PASS (cards not swallowed).
- `python test_vault_integrity.py` → All checks PASSED (43 pages).
- HTTP smoke: index.html 200, js/wiki/view.js 200.

