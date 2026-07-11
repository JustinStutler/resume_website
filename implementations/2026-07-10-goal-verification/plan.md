# Goal Verification: `_.txt` Requirements Audit

## Objective
Verify every requirement in the root `_.txt` spec is implemented in the wiki
overhaul. For anything missing, produce a plan. Test end-to-end and log as we go.

## Method
1. Enumerate every discrete requirement from `_.txt` (25 items across the whole spec).
2. For each, locate the implementing code/content and record evidence or a gap.
3. Run the backend integrity + index tests; serve the frontend over HTTP and
   smoke-test that pages/assets return 200.
4. Independent code-review subagent pass on the changed files for correctness bugs.
5. Report status; plan any gaps.

## Requirements Matrix

| # | Requirement (`_.txt`) | Status | Evidence |
|---|------------------------|--------|----------|
| 1 | New branch/fork before starting | ✅ Done | On `feature/wikipedia-interface` |
| 2 | Archive the photo gallery feature | ⚠️ Judgment | Interactive chat "photos" action removed; now a static `personal/photos.md` wiki page. Gallery *feature* archived, content retained. |
| 3 | Concise set responses; split the "journey" into its own section | ✅ Done | `about-website/the-journey.md` is a standalone page linked from `about-this-website.md` |
| 4 | Fix chat formatting — fluid, no oversized forced title | ✅ Done | `ai_service.py` FORMATTING block relaxed; no forced `## Title` |
| 5 | Wikipedia-style wiki interface (links, search, sections) | ✅ Done | Full SPA: `js/wiki/*` (router, links, search, view) |
| 6 | AI chatbar docked at the bottom, always accessible | ✅ Done | `.chat-dock` fixed bottom; `chat/dock.js` |
| 7 | Justin page = default load; chat collapsed at bottom | ✅ Done | `router.js` defaults to home; dock panel `display:none` until focus/send |
| 8 | One picture in the top-right on the home page | ✅ Done | `view.js buildInfobox()` → `portraits/ice_cave.JPG` |
| 9 | Transfer style: dark theme, persistent section colors, active underline, gradient title | ✅ Done | `wiki.css` dark vars; `.sec-*` colors; `.site-brand` gradient; active border |
| 10 | Hub pages visually embed subpages as sections; still navigable individually | ✅ Done | `view.js` embeds `parent===id` children as cards |
| 11 | Projects as cards (image/pdf UI + info) | ⚠️ Partial | Card + media/PDF UI done; per-project field standardization not enforced (see gap) |
| 12 | Skills grouped by category, color-coded | ✅→ overridden | Grouped by category; per-category coloring intentionally removed by req #18 |
| 13 | AI chat: no dashes/bullets, `###` headers, concise | ✅ Done | `ANSWER_SYSTEM_INSTRUCTION` FORMATTING rules |
| 14 | Remove "See also"; end with a follow-up question | ✅ Done | No "see also" in vault; FOLLOW UP instruction added |
| 15 | Click a section → collapse/expand, header always shown | ✅ Done | `view.js` collapsible `<h2>` + `.collapsible-header` CSS |
| 16 | Remove hyperlink on embedded section headers (toggle instead) | ✅ Done | `<a>` wrapper removed; header click toggles |
| 17 | Tech skills page: remove section coloring | ✅ Done | `.skill-category-container` plain (no color) |
| 18 | Submit button gradient | ✅ Done | `#send-btn` `linear-gradient(90deg,var(--blue),var(--purple))` |
| 19 | Academics: courses & GRE no longer "whited out" | ✅ Done | Backticks/code spans removed from `academics.md` + education pages |
| 20 | Standardize academics — each school a card, GPA/name in same place | ✅ Done | All `education-*.md` use Program/GPA/Dates template |
| 21 | Card layout site-wide; each section a card, collapse by title | ✅ Done | `.wiki-card` global + collapsible headers |
| 22 | Back/forward navigation buttons | ✅ Done | `.nav-history-buttons` in `index.html` |
| 23 | Breadcrumb in its own bar above the article; back/fwd on its left | ✅ Done | `.wiki-navigation-bar` wraps history buttons + `#breadcrumb-container` |
| 24 | Move index sections to a left sidebar; main shows subpage cards | ✅ Done | `.wiki-sidebar` holds `.section-nav`; main renders embedded cards |

## Gaps Identified
- **G1 (req #11) — Project card content standardization.** Cards + image/PDF media
  render, but each project `.md` has an ad-hoc structure. The spec asked for a
  standardized card showing: title, course, when taken, brief summary, results,
  technologies used, and what was learned, in a consistent order. Because hub
  embedding shows full page content, long pages (e.g. `house-prices.md`) read as
  walls of text inside their card rather than a compact standardized summary.
- **G2 (req #2) — Photo gallery archival is a judgment call** worth confirming with
  the user (feature archived vs. content fully removed).

## Plan for G1 (project standardization)
See `notes.md`. Recommended approach: add a compact, standardized summary block at
the TOP of each project page (Course · Date · Summary · Results · Tech · Learned)
so the embedded hub card leads with the standardized fields, while the deep detail
remains below and collapsible. Keeps LLM-friendly modularity and the "cute card"
visual. Requires editing 8 project `.md` files — content change, recommend user
review of tone before committing.

## Risks
- Editing project content risks losing the rich detail that powers AI answers —
  mitigate by *prepending* a standardized header, not replacing existing body.
