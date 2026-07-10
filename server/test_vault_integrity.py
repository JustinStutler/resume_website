# server/test_vault_integrity.py
"""Structural integrity checks for the Wikipedia-style vault.

Stdlib only -- imports vault_loader (no external deps) so it runs without API keys.
Run directly:  python server/test_vault_integrity.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import vault_loader  # noqa: E402
from vault_loader import (  # noqa: E402
    VAULT, VAULT_PATHS, parse_frontmatter, build_index_summary, expand_related,
    MAX_CONTEXT_PAGES,
)

ROOT_ID = "justin-stutler"


def _collect_ids_from_disk():
    """Walk all vault roots and return list of (id, path) for non-meta content pages."""
    found = []
    for root in VAULT_PATHS:
        for dirpath, _dirs, files in os.walk(os.path.abspath(root)):
            for name in files:
                if not name.endswith(".md"):
                    continue
                path = os.path.join(dirpath, name)
                with open(path, "r", encoding="utf-8") as f:
                    meta, _ = parse_frontmatter(f.read())
                if not meta.get("id"):
                    continue
                if meta.get("type") == "meta" or meta.get("scope") == "meta":
                    continue
                found.append((meta["id"], path))
    return found


def check(errors, condition, message):
    if not condition:
        errors.append(message)


def run():
    errors = []

    # 1. No duplicate ids across the vault (dict would silently dedupe, so scan disk).
    disk = _collect_ids_from_disk()
    seen = {}
    for pid, path in disk:
        if pid in seen:
            errors.append(f"Duplicate id '{pid}' in {path} and {seen[pid]}")
        seen[pid] = path

    # 2. Vault loaded a reasonable number of pages.
    check(errors, len(VAULT) >= 25, f"Expected >=25 pages, loaded {len(VAULT)}")

    # 3. Root exists and has no parent.
    check(errors, ROOT_ID in VAULT, f"Root page '{ROOT_ID}' missing")
    if ROOT_ID in VAULT:
        check(errors, not VAULT[ROOT_ID].get("parent"),
              f"Root '{ROOT_ID}' must not have a parent")

    for pid, page in VAULT.items():
        # 4. Every content page has a non-empty summary.
        check(errors, bool(page.get("summary")), f"Page '{pid}' has no summary")

        # 5. Every non-root page has a parent that resolves.
        if pid != ROOT_ID:
            parent = page.get("parent", "")
            check(errors, bool(parent), f"Page '{pid}' has no parent")
            if parent:
                check(errors, parent in VAULT,
                      f"Page '{pid}' parent '{parent}' does not resolve")

        # 6. Every related id resolves.
        for rel in page.get("related", []):
            check(errors, rel in VAULT,
                  f"Page '{pid}' related id '{rel}' does not resolve")

        # 6b. Every provenance source id resolves (and points at the raw layer).
        for src in page.get("sources", []):
            check(errors, src in VAULT,
                  f"Page '{pid}' source id '{src}' does not resolve")

    # 7. Index/tree builds and includes the root.
    index = build_index_summary(VAULT)
    check(errors, ROOT_ID in index, "Index summary missing root id")
    check(errors, index.count("\n") + 1 >= len(VAULT) - 2,
          "Index tree seems to be missing pages (orphans not rooted?)")

    # 8. expand_related respects the cap and returns only valid ids.
    expanded = expand_related(VAULT, [ROOT_ID])
    check(errors, len(expanded) <= MAX_CONTEXT_PAGES,
          f"expand_related exceeded cap: {len(expanded)}")
    check(errors, all(pid in VAULT for pid in expanded),
          "expand_related returned an unknown id")
    check(errors, expanded[0] == ROOT_ID, "expand_related dropped the seed page")

    # 9. expand_related on a leaf pulls in neighbours (link-following works).
    leaf = expand_related(VAULT, ["education-kennesaw-state-university"])
    check(errors, len(leaf) > 1, "expand_related did not follow any related links")

    return errors


if __name__ == "__main__":
    errs = run()
    print(f"Vault pages loaded: {len(VAULT)}")
    if errs:
        print(f"\nFAILED with {len(errs)} problem(s):")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
    print("All vault integrity checks PASSED.")
