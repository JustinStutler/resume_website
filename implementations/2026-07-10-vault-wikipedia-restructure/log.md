# Log: Vault Wikipedia-style Restructure (append-only)

## 2026-07-10

- Read Karpathy LLM-wiki gist; read all 18 vault pages + `vault_loader.py` + `ai_service.py`.
- Confirmed with user: Wikipedia-style hierarchy (root → subpages → section files); content
  wording must stay verbatim; loader/selector may change freely.
- Wrote `plan.md` with target tree, frontmatter schema, granularity decision, and test plan.
- Created dirs: `wiki/{academics,career,skills,projects,personal,about-website}`.
- `git mv` the 7 project detail pages + `projects.md` hub into `wiki/projects/`.

### Implementation (all done)
- Wrote root `justin-stutler.md` + 5 new hubs (academics, career, skills, personal,
  about-this-website); `projects.md` reused as the projects hub.
- Created section-level leaf pages (verbatim content): academics x5, career x3, skills x5,
  personal x4, about-website x3, plus `senior-capstone`.
- Added `parent`/`related`/`summary` frontmatter to the 8 project pages and the 6 raw sources
  (sources integrated into the tree via `parent`).
- Removed superseded flat pages: `education-timeline`, `skills`, `work-experience`,
  `portfolio-website` (needed `git rm -f` — they had pre-session working-tree edits).
- `vault_loader.py`: added `parent`/`related`/`sources`/`summary` fields + tag normalization +
  `_strip_quotes`; `build_index_summary()` now renders a hierarchical tree; added pure
  `expand_related()` (bounded 1-hop, cap `MAX_CONTEXT_PAGES=6`).
- `ai_service.py`: selector prompt now describes the tree and asks for the most specific page;
  validated ids run through `expand_related()`.
- Rewrote `VAULT_SCHEMA.md`; rebuilt `index.md` as a tree map; added vault `log.md`.
- Fixed dangling `sources: [portfolio-website]` → `[sop]` on the 4 about-website pages; added a
  `sources`-resolution check to the test.
- `CLAUDE.md`: added the Development Methodology section; fixed stale Gemini refs → OpenRouter;
  documented the new vault tree, frontmatter fields, and granularity heuristic.

### Test results — PASS
- `python server/test_vault_integrity.py` → "Vault pages loaded: 41 ... All vault integrity
  checks PASSED." (35 wiki + 6 sources; no dup ids; all parent/related/sources resolve; every
  page has a summary; tree builds; `expand_related` respects cap and follows links.)
- `python -c "import ai_service"` → imports OK; sample `expand_related` follows related edges.
- Eyeballed the rendered tree map — clean parent→child hierarchy with summaries + tags.

### Notes / follow-ups
- Kept individual project pages whole (cohesive narratives) rather than splitting each into
  subsections — matches Karpathy's one-page-per-entity heuristic. Revisit if a project page
  grows large enough that partial retrieval would help.
- `sources/` raw layer kept fully intact and verbatim, so no original wording was lost.
- `.env.example` may still reference the old key name; not touched this pass.
