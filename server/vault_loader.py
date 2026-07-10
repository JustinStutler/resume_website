# server/vault_loader.py
import os
import re

# Vault roots. The wiki now lives under client/ (publicly served, single source of
# truth for the wiki UI); the raw sources stay private at the repo root and are
# loaded for the AI pipeline only.
_HERE = os.path.dirname(__file__)
WIKI_PATH = os.path.join(_HERE, '..', 'client', 'vault', 'wiki')
SOURCES_PATH = os.path.join(_HERE, '..', 'Portfolio_Website_Vault', 'sources')
VAULT_PATHS = [WIKI_PATH, SOURCES_PATH]
# back-compat alias used by tooling; points at the public wiki root
VAULT_PATH = WIKI_PATH

# Cap on how many pages a single query may pull after link expansion.
MAX_CONTEXT_PAGES = 6


def _strip_quotes(value):
    """Remove a single pair of surrounding quotes from a scalar frontmatter value."""
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        return value[1:-1]
    return value


def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown content.

    Returns (metadata_dict, body_text).
    Returns ({}, content) if no frontmatter block found.
    Only single-line values are supported (scalars and `[a, b]` lists).
    """
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return {}, content

    raw_fm = match.group(1)
    body = content[match.end():]
    metadata = {}

    for line in raw_fm.strip().split('\n'):
        colon_idx = line.find(':')
        if colon_idx == -1:
            continue

        key = line[:colon_idx].strip()
        value = line[colon_idx + 1:].strip()

        # Parse list values: [tag1, tag2, tag3]
        if value.startswith('[') and value.endswith(']'):
            items = value[1:-1].split(',')
            metadata[key] = [item.strip() for item in items if item.strip()]
        else:
            metadata[key] = _strip_quotes(value)

    return metadata, body


def _as_list(value):
    """Normalize a frontmatter value to a list (tags/related may parse as str or list)."""
    if isinstance(value, list):
        return value
    if not value:
        return []
    return [value]


def load_vault(vault_path):
    """Walk all .md files in vault_path, parse frontmatter, build page index.

    Returns dict mapping page id -> {id, title, tags, type, parent, related,
    summary, file_path, content}.
    Skips pages with type/scope 'meta' or missing 'id' field.
    """
    vault = {}
    resolved_path = os.path.abspath(vault_path)

    if not os.path.isdir(resolved_path):
        print(f"WARNING: Vault directory not found: {resolved_path}")
        return vault

    for dirpath, _dirnames, filenames in os.walk(resolved_path):
        for filename in filenames:
            if not filename.endswith('.md'):
                continue

            file_path = os.path.join(dirpath, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    raw = f.read()
            except (IOError, OSError) as e:
                print(f"WARNING: Could not read {file_path}: {e}")
                continue

            metadata, body = parse_frontmatter(raw)

            if not metadata.get('id'):
                continue
            if metadata.get('type') == 'meta' or metadata.get('scope') == 'meta':
                continue

            page_id = metadata['id']

            if page_id in vault:
                print(f"WARNING: Duplicate vault page id '{page_id}' "
                      f"in {file_path} (already loaded from {vault[page_id]['file_path']})")

            vault[page_id] = {
                'id': page_id,
                'title': metadata.get('title', filename.replace('.md', '')),
                'tags': _as_list(metadata.get('tags', [])),
                'type': metadata.get('type', 'source'),
                'parent': metadata.get('parent', ''),
                'related': _as_list(metadata.get('related', [])),
                'sources': _as_list(metadata.get('sources', [])),
                'summary': metadata.get('summary', ''),
                'file_path': file_path,
                'content': body.strip(),
            }

    print(f"Vault loaded: {len(vault)} pages from {resolved_path}")
    return vault


def load_vault_roots(paths):
    """Load and merge multiple vault roots into a single page index."""
    vault = {}
    for path in paths:
        for pid, page in load_vault(path).items():
            if pid in vault:
                print(f"WARNING: Duplicate vault page id '{pid}' across roots "
                      f"({page['file_path']} vs {vault[pid]['file_path']})")
            vault[pid] = page
    return vault


def build_index_summary(vault):
    """Build a hierarchical tree map of the vault for the context-selection prompt.

    Renders the parent/child hierarchy so the model can navigate the wiki like a
    table of contents. Each node shows its id, summary (or title), and tags.
    Any page whose parent is missing/unknown is treated as a top-level root.
    """
    # children[parent_id] -> list of page ids
    children = {}
    roots = []
    for page in vault.values():
        parent = page.get('parent', '')
        if parent and parent in vault:
            children.setdefault(parent, []).append(page['id'])
        else:
            roots.append(page['id'])

    def sort_key(pid):
        # hubs (own children) first, then alphabetical for stable output
        return (0 if pid in children else 1, pid)

    lines = []

    def render(pid, depth):
        page = vault[pid]
        indent = '  ' * depth
        desc = page.get('summary') or page.get('title')
        tags = ', '.join(page['tags']) if page['tags'] else 'none'
        marker = ' (source)' if page.get('type') == 'source' else ''
        lines.append(f'{indent}- "{pid}"{marker} — {desc} [tags: {tags}]')
        for child in sorted(children.get(pid, []), key=sort_key):
            render(child, depth + 1)

    for root in sorted(roots, key=sort_key):
        render(root, 0)

    return '\n'.join(lines)


def expand_related(vault, selected_ids, max_pages=MAX_CONTEXT_PAGES):
    """Bounded 1-hop link expansion.

    Keeps the model's selected pages (validated against the vault), then pulls in
    their `related` neighbours until `max_pages` is reached. Preserves order and
    de-duplicates. Pure function — safe to unit test without the API.
    """
    result = []
    for pid in selected_ids:
        if pid in vault and pid not in result:
            result.append(pid)

    for pid in list(result):
        if len(result) >= max_pages:
            break
        for rel in vault[pid].get('related', []):
            if len(result) >= max_pages:
                break
            if rel in vault and rel not in result:
                result.append(rel)

    return result[:max_pages]


# Load at import time (same pattern as the old context_loader.py)
VAULT = load_vault_roots(VAULT_PATHS)
INDEX_SUMMARY = build_index_summary(VAULT)
