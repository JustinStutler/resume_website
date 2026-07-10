# Implementations

This folder is the append-only record of non-trivial changes to this project, following the
**plan → implement → test → log** methodology documented in `CLAUDE.md`.

Each implementation gets its own dated subfolder:

```
implementations/
  YYYY-MM-DD-short-slug/
    plan.md    # the plan agreed before writing code (design, decisions, risks)
    log.md     # append-only running log of what was actually done, in order
    notes.md   # optional: findings, gotchas, follow-ups
```

Rules:
- Start a new subfolder for each distinct piece of work.
- `log.md` is append-only — add entries, never rewrite history.
- Record decisions and their rationale, not just actions.
- Note test results (pass/fail + output) before declaring work done.

## Index

| Date | Implementation | Status |
|------|----------------|--------|
| 2026-07-10 | [Vault Wikipedia-style restructure](./2026-07-10-vault-wikipedia-restructure/) | Complete |
| 2026-07-10 | [Button UI + response alignment with the wiki](./2026-07-10-button-ui-wiki-alignment/) | Complete |
| 2026-07-10 | [Wikipedia-style wiki interface + docked chat](./2026-07-10-wikipedia-interface/) | Complete |
