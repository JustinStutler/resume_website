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
| 2026-07-10 | [Wiki overhaul → full-content inline rendering, vertical cards, section colors](./2026-07-10-wiki-overhaul/) | Complete |
| 2026-07-10 | [Goal verification — `_.txt` requirements audit](./2026-07-10-goal-verification/) | Complete (2 follow-ups) |
| 2026-07-11 | [Render worker timeout — heavy queries 500](./2026-07-11-render-worker-timeout/) | Fix applied, awaiting redeploy |
| 2026-07-11 | [Empty answer response — free-tier `content=None` → "empty response"](./2026-07-11-empty-answer-response/) | Fix applied, awaiting redeploy |
| 2026-07-10 | [Single toolbar + rainbow theme (nav/search/chat rework)](./2026-07-10-toolbar-rainbow-ui/) | Complete |
| 2026-07-10 | [Home + color + nav polish (card rainbow, Explore header, hide nav on home)](./2026-07-10-home-color-nav-polish/) | Complete |
