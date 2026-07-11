# Toolbar consolidation + rainbow theme

## Requirements (from goal)
1. Remove the "index section" (the `## Sections` list) from the home page (and any page that has one).
2. Move the section nav (Academics, Career, …) to be **horizontal**, above the display, together with:
   - back/forward arrow buttons
   - a **Home** button with a home icon
   - the wiki search bar in the **top-right**
   - all in **one** main header toolbar above the article.
3. Make the bottom chat bar the **same width as the display** and integrate it seamlessly.
4. Theme colors in order: **red, orange, yellow, green, blue, purple**.
5. Rainbow gradient — vertical flow, **red on top → blue/purple on bottom**, like a rainbow flag.

## Design
- `index.html`: collapse the two-tier header + left sidebar + separate nav bar into a single
  `.wiki-topbar` toolbar: `[home][◀][▶]  section-nav (horizontal)  ……  [search]`.
  Article becomes a single centered column (no sidebar). Breadcrumb stays above the article.
- Section color classes remapped to rainbow order: Academics=red, Career=orange, Projects=yellow,
  Skills=green, Personal=blue, About=purple.
- Rainbow gradient var (`--rainbow`, 180deg red→purple) applied to the send button and as a left
  accent stripe on the article (vertical, reads as a rainbow flag). Search moved top-right.
- Chat dock panel + bar width = article width (`calc(--maxw - 44px)`), centered, matching surface/
  border for a seamless docked look.
- `justin-stutler.md`: drop the `## Sections` block (redundant with the nav bar).

## Risks
- app.js click wiring references `.site-brand`; must repoint to `.tb-home`.
- Alignment of chat bar with article depends on consistent max-width + padding math.
- Responsive: nav must wrap/scroll on narrow screens.
