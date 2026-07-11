# Log

## 2026-07-10
- Read `wiki.css`, `view.js`, `app.js`, `index.html`; confirmed via `wiki-index.json` that career's children (magmutual-insurance, piehole, career-direction) render as leaf **cards**, so "first section" = first card (was red).
- `view.js`: added `orderedCardColors(pageColorName)` (rainbow starting after the page's own color); replaced the `filter`-based `_cardColors` assignment with it. Appended `<hr class="home-sep">` before `buildHomeIndex` on the home branch.
- `wiki.css`: `.home-index` — removed background/border/radius, padding→0; `.home-index h2` — 1.5rem serif `var(--ink)`, non-uppercase; added `hr.home-sep`; added `.home-index a:visited { color: var(--sc) }`; added `.section-nav.nav-hidden { display:none }`.
- `app.js`: renamed `updateNavHighlight`→`updateNav`, added `navRevealed` latch that hides `#section-nav` on home and reveals it permanently after the first section navigation.
- **Test:** node check of `orderedCardColors` → career yields `yellow, green, blue, purple, red` (first = yellow ✓). Served over `python -m http.server 8099`; index.html / view.js / wiki.css all 200 with new symbols present.

## 2026-07-10 (home divider/portrait polish)
- Added `--rule: rgba(255,255,255,0.78)` token; made `.wiki-article hr` and `hr.home-sep` use it (white dividers).
- `hr.home-sep` now `clear: both` so it drops UNDER the floated portrait — the picture is contained within the bio/interests block and the white rule lands beneath it.
- `.home-index h2` ("Explore the wiki") gained a white `border-bottom` (rule under the header).
- Home-scoped white underlines: `#wiki-article[data-section="home"] .article-body h1` recolored, `h3` ("Interests:") given a white `border-bottom`. Narrowed home `.wiki-infobox` to 240px so the portrait fits the interests block.

## 2026-07-10 (collapse whole toolbar on first load)
- Extended the home nav-hiding into a full-toolbar first-load reveal: the entire `.wiki-topbar` starts collapsed to an empty clickable strip; contents keep layout (`min-height`) but go `opacity:0; pointer-events:none`.
- `wiki.css`: added `.wiki-topbar.topbar-collapsed` (cursor pointer) + `.topbar-collapsed .topbar-inner { opacity:0; pointer-events:none }` and `.topbar-fade .topbar-inner { transition: opacity 2s ease }`.
- `index.html`: header now ships with `topbar-collapsed` so there's no flash before JS runs.
- `app.js`: replaced the `navRevealed` latch with `topbarRevealed` + a `revealTopbar(fade)` helper. Reveal triggers: (1) click anywhere on `.wiki-topbar` → instant reveal of ALL elements; (2) any navigation away from home (e.g. an in-page "Explore the wiki" link → hashchange → `updateNav`) → slow 2s fade reveal. `updateNav` toggles `topbar-collapsed`/`nav-hidden` off `topbarRevealed`.
- **Test:** served over `python -m http.server 8099`; index.html/app.js/wiki.css all 200 with new symbols (`topbar-collapsed`, `revealTopbar`) present. Behavior verified in browser: home loads with a bare strip; clicking the strip pops the controls/nav/search in instantly; clicking an "Explore the wiki" link fades the toolbar in over ~2s and highlights the target section.
