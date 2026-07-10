---
id: vault-log
title: Vault Change Log
type: meta
scope: meta
---

# Vault Change Log

Append-only record of structural changes to the vault (Karpathy LLM-wiki convention). Newest
entries at the bottom. Grep-friendly: one dated block per change.

## 2026-07-10 — Wikipedia-style restructure

- Reorganized the flat `wiki/` into a Wikipedia-style tree: root `justin-stutler` → section hubs
  (`academics`, `career`, `projects`, `skills`, `personal`, `about-this-website`) → small
  section-level pages.
- Split reference aggregations into section pages (education by institution, skills by category,
  website doc into story/flow/tech-stack). Kept individual project pages whole.
- Added `parent`, `related`, and `summary` frontmatter to every content page; integrated the raw
  `sources/` docs into the tree via `parent`.
- Content wording preserved verbatim; the split pages reuse the original text.
- Removed superseded flat pages: `education-timeline`, `skills`, `work-experience`,
  `portfolio-website` (content lives on in the split pages).
- Loader now builds a hierarchical tree index and does bounded 1-hop `related` expansion.
- See `implementations/2026-07-10-vault-wikipedia-restructure/` for the full plan and log.
