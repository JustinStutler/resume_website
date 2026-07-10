---
id: vault-schema
title: Vault Schema and Conventions
type: meta
scope: meta
---

# Vault Schema

This vault is the knowledge base for Justin Stutler's AI-powered portfolio website. The Flask
backend reads these markdown files at startup and uses them to answer visitor questions.

It is organized as a **Wikipedia-style tree** so the LLM can navigate to and retrieve the
specific section(s) it needs, rather than whole documents. This follows Andrej Karpathy's
LLM-wiki pattern: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## Three Layers

1. **sources/** — raw, effectively immutable documents (resume, statement of purpose,
   transcript, GRE, personal background, bio). The source of truth. `type: source`.
2. **wiki/** — the synthesized, navigable layer. A root person page links to section hubs,
   which link to small section-level pages. `type: wiki`.
3. **meta** — vault infrastructure (`VAULT_SCHEMA.md`, `index.md`, `log.md`). `type: meta`,
   skipped by the loader.

## The Tree

```
justin-stutler (root)
├── academics        → one page per institution (+ courses, gre-scores sources)
├── career           → one page per role + career direction
├── projects         → one page per project (kept whole)
├── skills           → one page per skill category
├── personal         → interests, hobbies, personality, contact
└── about-this-website → architecture story, query flow, tech stack
```

## Frontmatter Spec

Every content page (source or wiki) must have:

```yaml
---
id: unique-kebab-case-id     # unique across the entire vault
title: Human-readable title
type: source | wiki          # meta pages use type: meta and are skipped
parent: <hub-id>             # its parent in the tree (root page omits this)
related: [id-1, id-2]        # machine-navigable cross-references (single line)
summary: One line describing what this page covers.
tags: [specific, discriminating, tags]
last_updated: YYYY-MM-DD
---
```

Wiki pages also carry provenance: `sources: [source-id-1, source-id-2]`.

## Rules

- `id` must be unique across the entire vault.
- Every non-root content page has a `parent` that resolves to a real page.
- Every id in `related` must resolve to a real page. `related` must be a **single-line** list
  (`[a, b, c]`) — the frontmatter parser only supports single-line values.
- Every content page has a one-line `summary` — it is surfaced to the context selector.
- **Page-granularity heuristic:** a page is one distinct entity you would link to. Split
  reference aggregations (skills by category, schooling by institution) into section pages;
  keep cohesive narratives (a single project) whole.
- Body content is plain markdown. The in-body `[[wikilinks]]`-style `[label](id)` links in hub
  pages are for human/Obsidian navigation; the machine pipeline uses `parent`/`related`.
- The server reads these files at startup; restart the server after editing.

## How Retrieval Uses This

- `vault_loader.build_index_summary()` renders the tree (id + summary + tags) for the selector.
- `select_context()` asks the model for the most specific page ids, then
  `vault_loader.expand_related()` pulls bounded 1-hop `related` neighbours (max 6 pages total).
- `generate_answer()` builds context blocks from the selected pages.

## Directory Layout

```
sources/            raw source documents (immutable layer)
wiki/               synthesized tree (root, hubs, section pages)
index.md            human navigation index (meta)
log.md              append-only change log (meta)
VAULT_SCHEMA.md     this file (meta)
```
