---
id: vault-schema
title: Vault Schema and Conventions
type: meta
scope: meta
---

# Vault Schema

This vault serves as the knowledge base for Justin Stutler's AI-powered portfolio website. The Flask backend reads these markdown files at startup and uses them to answer visitor questions.

## Frontmatter Spec

Every content page must have this YAML frontmatter:

```yaml
---
id: unique-kebab-case-id
title: Human-readable title
tags: [relevant, specific, tags]
type: source | wiki
last_updated: YYYY-MM-DD
---
```

Wiki pages add:
```yaml
sources: [source-id-1, source-id-2]
```

## Rules

- `id` must be unique across the entire vault
- `type: source` = raw documents (resume, transcripts, etc.)
- `type: wiki` = synthesized/cross-referenced pages
- `type: meta` = vault infrastructure (this file, index.md) -- skipped by the loader
- Tags should be specific enough to discriminate between pages
- Body content is plain markdown -- no Obsidian `[[wikilinks]]` in source/wiki pages
- The server reads these files at startup; restart the server after editing

## Directory Layout

```
sources/   -- migrated source documents
wiki/      -- synthesized knowledge pages
index.md   -- navigation index
```
