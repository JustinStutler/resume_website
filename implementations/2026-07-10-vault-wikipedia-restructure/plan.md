# Plan: Vault Wikipedia-style Restructure

**Date:** 2026-07-10
**Goal:** Restructure `Portfolio_Website_Vault/` into a Wikipedia-style hierarchy so the LLM
retrieval pipeline (`server/ai_service.py` → `select_context` → `generate_answer`) can navigate
it and pull just the section(s) it needs, improving answer accuracy.

## Reference

Andrej Karpathy's LLM-wiki gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

Principles applied:
- **Three layers:** raw *sources* (immutable) · synthesized *wiki* · *navigation index*.
- **Machine-navigable cross-references** (not prose "see X") so retrieval can follow links.
- **One-line summary per page** for cheap, accurate selection.
- **Page-granularity heuristic:** a page = one distinct entity you would link to elsewhere.
- **Index + log files** as append-only, greppable infrastructure.

## Constraints (from user)

1. **Do not change the wording of existing content.** Restructure freely (files, layout,
   frontmatter, loader/selector), but prose text stays verbatim.
2. Wikipedia model: a root person page → top-level subpages (academics, career, projects,
   interests, ...) → small section-level files so long pages split into retrievable subsections.

## Target structure

```
Portfolio_Website_Vault/
  VAULT_SCHEMA.md            (meta) conventions
  index.md                  (meta) human navigation hub
  log.md                    (meta) append-only vault change log
  sources/                  raw immutable layer (unchanged): resume, sop, gre-scores,
                            courses, personal-background, tell-me-about
  wiki/
    justin-stutler.md       ROOT lead page + navigation map
    academics/              academics.md (hub) + one page per school
    career/                 career.md (hub) + magmutual, piehole, career-direction
    skills/                 skills.md (hub) + one page per skill category
    projects/               projects.md (hub) + one page per project (kept whole)
    personal/               personal.md (hub) + interests, hobbies, autotelic, contact
    about-website/          about-this-website.md (hub) + story, flow, tech-stack
```

## Frontmatter schema (new fields)

```yaml
id: kebab-id            # unique across vault
title: Human Title
type: source|wiki|meta
parent: <hub-id>        # hierarchy edge (root/meta omit)
related: [id, id]       # machine-navigable cross-refs (single-line list)
summary: one line       # surfaced to the selector
tags: [t1, t2]
sources: [id, id]       # wiki-only provenance
last_updated: YYYY-MM-DD
```

## Granularity decision

- **Split** reference aggregations that bundle independent facts (skills by category, schooling
  by institution) → precise subsection retrieval.
- **Keep whole** cohesive project narratives — a project is one entity; a "results" query still
  wants the whole project. (Karpathy: one page per distinct entity.)

## Loader / selector changes (`server/vault_loader.py`, `server/ai_service.py`)

1. Parse + store `parent`, `related`, `summary`; normalize `tags` to a list.
2. `build_index_summary()` → emit a hierarchical **tree map** (grouped by parent) with summary +
   tags per node instead of a flat list.
3. Add a pure `expand_related()` helper: after the model selects IDs, pull 1-hop `related`
   neighbours, bounded by a max page count. Unit-testable without the API.

## Test plan

`server/test_vault_integrity.py` (stdlib only, no API):
- no duplicate ids
- every wiki page has a `summary` and a resolvable `parent`
- every `related` id resolves to a real page
- tree/index builds without error
- `expand_related()` respects the cap and returns only valid ids

## Risks

- MED: transcription errors while splitting → mitigate by `git mv` for whole pages and careful
  verbatim copy for splits; integrity test catches broken links.
- MED: selector expansion could pull too much context → hard cap on total pages.
- LOW: naive frontmatter parser needs single-line lists → keep `related:` on one line.
