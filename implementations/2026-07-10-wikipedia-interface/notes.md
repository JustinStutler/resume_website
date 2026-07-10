# Notes / gotchas / follow-ups

## Gotchas
- **Must be served over HTTP.** The wiki fetches `.md` + `wiki-index.json`, so `file://` fails.
  Netlify (publish dir = `client/`) is fine; local dev needs Live Server or `python -m http.server`.
- **Regenerate the index after wiki edits:** `python server/gen_wiki_index.py`. The manifest is
  metadata-only, so pure body edits don't require it — but any new/renamed page, or changed
  title/summary/tags/parent/related, does.
- **Sources must never move under `client/`.** Netlify serves everything in the publish dir, so
  privacy = physical location, not config. `sources/` + meta stay at `Portfolio_Website_Vault/`.
- **Image filename case matters** on Netlify (case-sensitive). `.JPG` vs `.jpg` are distinct;
  `photos.md` uses exact-case paths, verified by the validation script.

## Working-tree state
- The wiki move was done with a plain filesystem `mv` (not `git mv`) because the prior session
  left many untracked/staged-rename files in the tree. Result: git sees old tracked wiki paths
  as deleted and new `client/vault/wiki/**` as untracked. **No commit was made** (user hasn't
  asked). When committing, review with `git add -A` + `git status` to confirm the rename intent.

## Follow-ups / possible next steps
- Old chat-first files are now unreferenced (`js/main.js`, `js/script.js`, `js/eventHandlers.js`,
  `js/events/`, `js/services/{courseManager,galleryManager,documentManager}.js`, `js/data.js`,
  `client/content/`, `client/css/style.css`). Safe to delete in a cleanup commit; left in place if
  Bash cleanup didn't run.
- Course list (`data.js`) and project PDFs are no longer surfaced as chat actions. Projects have
  wiki pages; if per-project PDF links are wanted, add them to each project page.
- Infobox is intentionally minimal (portrait + name). Could add a small facts `dl` later, but that
  would duplicate/repeat content that lives in the page body.
- Consider full-text search (bake bodies into the index) if title/summary/tag search proves too
  narrow — the generator can add a `body` field trivially.
