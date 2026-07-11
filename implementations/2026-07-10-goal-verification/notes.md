# Notes & Follow-ups

## G1 — Project card standardization (req #11) — proposed plan

**Problem:** The projects hub embeds each project's full page as a card. Pages have
inconsistent structure and some are very long, so cards read as text walls rather
than the compact, standardized "cute cards" the spec asked for (title · course ·
when taken · summary · results · technologies · what I learned).

**Recommended approach (non-destructive):**
1. Add a standardized, compact frontmatter-driven summary to each of the 8 project
   pages under `client/vault/wiki/projects/`, e.g. new frontmatter keys:
   `course`, `date`, `results`, `technologies`, `learned`, plus the existing
   `summary`.
2. In `view.js`, when embedding a child of `projects`, render a standardized card
   header from that frontmatter (media on the left; a definition-list of
   Course / Date / Summary / Results / Tech / Learned on the right), and place the
   full existing body BELOW it, collapsed by default.
3. Regenerate `wiki-index.json` (extend `gen_wiki_index.py` to surface the new keys)
   and re-run `test_vault_integrity.py`.

**Why frontmatter, not body edits:** keeps the rich body (which feeds AI answers)
intact and modular, while giving users the standardized compact card visual.

**Effort:** ~1 pass over 8 md files + a `view.js` branch + index generator tweak.
**Needs user sign-off on:** the exact field set and whether the deep body should be
collapsed-by-default on the hub.

## G2 — Photo gallery archival (req #2)
The interactive chat "show photos" action is gone; photos now live at
`personal/photos.md` (embedded on the Personal hub). If "archive" means fully
remove the gallery from the public site, delete/relocate `photos.md` and drop it
from `personal.related`. Left as-is pending confirmation — the wiki page is a
reasonable resting place for the archived gallery.

## Observations (no action needed)
- `academics.md` frontmatter `related` still lists `courses`/`gre-scores` (private
  source pages). They are not in `wiki-index.json`, are not linked in the rendered
  body, and integrity passes — so no broken links surface to users.
- Home page (`justin-stutler`) embeds all 6 section hubs as cards (1-hop only), which
  matches the "main display shows each page's subpages as cards" intent.
