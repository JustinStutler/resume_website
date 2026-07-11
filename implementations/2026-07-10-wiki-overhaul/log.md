# Implementation Log: Wiki Overhaul

## 2026-07-10
- Created implementation plan and initialized logs.
- Updated `client/css/wiki.css` to use a dark theme, persistent top nav section colors, gradient brand title, and styles for cards and collapsible headers.
- Refactored `client/js/wiki/view.js` to dynamically fetch and append subpages into hub pages (`academics`, `projects`, `skills`).
- Implemented collapsible sections in `view.js` so clicking an `<h2>` toggles the content below it.
- Simplified `projects.md`, `academics.md`, and `skills.md` by removing their redundant manual text walls and letting the dynamic embedding take over.
- Demoted headers (`H1` to `H2`) inside embedded subpages and injected a direct `🔗` link to navigate to the standalone page, satisfying the requirement to navigate to them individually while allowing the entire section to be collapsible.
- Reconstructed the image/PDF UI for projects inside a new flexbox `.project-card` layout.
- Updated `server/ai_service.py` to enforce concise replies, `###` headers instead of bullets/dashes, and follow-up questions instead of "See also".

### Follow-up Changes (2026-07-10)
- Expanded dynamic subpage embedding to **all** pages that have children (not just `academics`, `projects`, `skills`).
- Removed the hyperlink (`<a>`) wrapper from the dynamically embedded section headers. Now, clicking the header text directly triggers the expand/collapse action without navigating.
- Removed the dynamic coloring from the technical skills sections, falling back to a standard bordered container.
- **UI Redesign:** Added a top navigation bar above `.wiki-article` with Back/Forward history buttons and the breadcrumb trail.
- **Universal Cards:** Renamed `.project-card` to `.wiki-card` and applied it globally so all embedded subpages render as collapsible cards.
- **Academics Standardization:** Removed markdown backticks in `academics.md` to prevent bright code block rendering in dark mode, and refactored all `education-*.md` files to a strict Program/GPA/Dates card template.
- **Gradient Button:** Applied the title's `linear-gradient` to the AI chat submit button.
- **Sidebar Layout Redesign:** Extracted `.section-nav` from the top header into a dedicated left-hand `.wiki-sidebar`. Wrapped the sidebar and `.wiki-main` inside a flexbox `.wiki-layout` for a true web app feel. Added media queries to collapse the sidebar horizontally on mobile.

### Full-Content Inline Rendering + Section Colors (2026-07-10, later)
Ruling from user: **show ALL content — never hide info or send the reader to small standalone pages.**
- **`view.js` rewritten** to render a page AND every descendant inline, fully expanded (recursive,
  depth-first). Prefetches the page + all descendants in parallel (cached in `bodyCache`) then builds
  synchronously. Hubs render as colored `.wiki-embed` section blocks; leaf pages as vertical
  `.wiki-card`s. Children ordered by each hub's curated `related` list. Removed the collapsible-H2
  behavior (it hid content) and the per-page "🔗 navigate away" links.
- **Home** now shows the entire site on one page: 6 section blocks + 30 leaf cards (~42k chars).
- **Index lists removed** from `career.md`, `personal.md`, `about-this-website.md` (the child-link
  bullet blocks) — that content now appears in full below instead of as link stubs.
- **Instagram-style vertical cards** (`wiki.css`): title (top) → italic plain-language summary
  (from frontmatter `summary`) + media → full body (bottom). Project cards get a full-width preview
  image + a prominent colored **📄 View full PDF** button (no more squished side rail).
- **Section-colored border bug fixed:** article left border is now the *current* section color via
  `#wiki-article[data-section=...]` (Skills=green, Projects=yellow, Career=orange, …); home keeps the
  full rainbow. Embedded blocks/cards tint their accents by `data-section-color` → `--sc`.
- **Submit button** regradiented to a vivid diagonal full-palette rainbow (was washed out).
- **Invisible inline code fixed:** `.wiki-article code` now warm cream (#ffd9a8) on #30363d with a
  border — `set_feature_types()` etc. are clearly legible (verified computed style + screenshot).

### Test (2026-07-10)
- Served `client/` on http:8099, drove Chromium via Python Playwright (1200x1000).
- **Console errors: none** on home / skills / projects / career.
- Verified: home embeds 6 section blocks + 30 cards + 6 PDF buttons, no index bullets, 42k chars;
  Skills border = `rgb(63,185,80)` (green); Projects border = yellow, 8 cards; Career border =
  orange, 3 cards, index bullets gone; `set_feature_types()` code legible. **Result: PASS.**

### Restyle + Curated Home + Collapsible Headers (2026-07-10, later still)
User feedback: styling too "overdramatic"; mimic the previous portfolio (justinstutlerai.netlify.app,
i.e. `main` branch `client/css/style.css` — a clean Gemini-like dark theme). Plus specific asks.
- **Palette softened** to the old site's Gemini tones: `--bg #131314`, muted greys, and gentler
  accents (red #f28b82, orange #f28b54, yellow #f0c040, green #81c995, blue #8ab4f8, purple #c58af9).
  Flattened surfaces — removed card hover-lift + heavy shadows, thinned the toolbar rainbow to a 2px
  hairline, softened dock shadows, thinner article border.
- **Nav active = colored underline only** — removed the background "bubble" and the white-text recolor
  (`.section-nav .sec.active` now only sets `border-bottom-color`). Verified: active Skills tab has
  transparent bg, green text, green 3px underline.
- **PDF button moved to the card header top-right** (`.card-head` flex row) as an outlined pill.
- **Concise hook under each project title** — added a `hook` frontmatter field (threaded through
  `vault_loader.py` + `gen_wiki_index.py` → `wiki-index.json`); the card lead line uses `hook || summary`.
- **Project bios reformatted** — training config/details converted to tables; "Technologies Used" and
  tech lists switched from commas to `|` separators; card-body `##/###` headers restyled to readable
  (not tiny) sizes with divider borders.
- **Home is curated again** (not everything expanded): short bio + infobox, a small `.home-index`
  ("Explore the rest of the wiki" → Academics/Career/Projects/Skills), then **Personal ("About Me")**
  and **How This Portfolio Website Works** shown in full. Controlled by `HOME_EXPAND` in view.js.
- **Click any section header to collapse/expand** — `makeCollapsible()` on every embed-title and
  card-title, plus `makeBodyHeadersCollapsible()` on in-body `##` sub-sections (chevron indicator).

### Test (2026-07-10)
- http:8099 + Chromium/Playwright. **No console errors.**
- Home: `data-section=home`, home-index with 4 links, only Personal + How-This-Works expanded (9 cards).
- Active nav (Skills): color green, background transparent, 3px green underline (no bubble/white).
- Projects: 6 PDF buttons in `.card-head`, title-click collapse works, 53 collapsible in-body `##`.
- Screenshots confirm the softer flat aesthetic, PDF top-right pill, hook lines. **Result: PASS.**

### Home simplification + distinct card colors (2026-07-10, final round)
- **Removed the expanded About Me / How This Works from the home page.** Home is now just the bio +
  portrait + the `.home-index` ("Explore the wiki"). `embedRoots` is empty on home; `HOME_EXPAND` removed.
- **Home index links styled like the top nav** — colored per section (Academics red … About purple),
  larger, with a colored underline on hover.
- **Portrait no longer overlaps** — `.home-index` gets `clear: both` so it drops below the floated infobox.
- **Cards now use varied colors, not the page color.** Each card cycles through the palette EXCLUDING
  the current page's section color (which stays exclusive to the article frame). New `data-card-color`
  attribute + `pickCardColor()` cycle; reset per render in `renderPage`. Verified on Academics: page
  border red, cards orange/yellow/green/blue/purple.

### Test (2026-07-10)
- http:8099 + Chromium/Playwright, **no console errors**. Home: 0 embeds/0 cards, 6 colored index links,
  infobox↔index overlap = false. Academics: pageBorder red, 5 cards each a different non-red color. PASS.
