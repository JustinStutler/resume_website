# Home + color + nav polish

## Requirements (from `/goal`)
1. Career page's first section should be **yellow, not red** — apply the same pattern to every section page.
2. Home page: make "Explore the wiki" a **larger white header**.
3. Separate the bio and the "Explore the wiki" section with an **`<hr>`** above the header.
4. Home section links (Academics, Career, …) should render **in their own color even after being visited** (currently go purple).
5. **Remove the dark background box** around the "Explore the wiki" section.
6. On initial load, **hide the top section-nav links** (visitor uses the in-page home index / "the bottom"); once they click into a section, **keep the top nav visible** for the rest of the visit.

## Design / decisions
- **Card colors (req 1):** cards previously excluded the page's own section color and started at `red`. New `orderedCardColors(pageColorName)` rotates the rainbow to start at the color *immediately after* the page's own color, still skipping its own. career(orange)→yellow first; academics(red)→orange; projects(yellow)→green; skills(green)→blue; personal(blue)→purple; about(purple)→red. Uniform rule, no per-page special-casing.
- **Home header (req 2, 5):** `.home-index` loses `background`/`border`/`border-radius`; `h2` becomes 1.5rem serif `var(--ink)`, non-uppercase.
- **Divider (req 3):** `el('hr', 'home-sep')` appended before the home index; styled `hr.home-sep`.
- **Visited links (req 4):** the links were already colored via `--sc`, but `.wiki-article a:visited` (purple) overrode them. Added `.home-index a:visited { color: var(--sc, var(--link)); }` (later source order wins at equal specificity).
- **Nav reveal (req 6):** `.section-nav.nav-hidden { display:none }`; `app.js` `updateNav()` keeps a `navRevealed` latch — home hides the nav, first non-home id sets the latch true permanently.

## Risks
- Direct deep-links (e.g. `#/wiki/career`) load with nav already shown — intended.
- Custom-property inheritance: `--sc` is set on the `<li>` and inherited by the `<a>` — confirmed by design.

## Test
- `orderedCardColors` verified via node: career→yellow,green,blue,purple,red. ✓
- Assets serve over http (200) with new symbols present. ✓
