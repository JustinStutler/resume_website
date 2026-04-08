# server/vault_loader.py
import os
import re

# Path to the vault relative to this file's directory (server/)
VAULT_PATH = os.path.join(os.path.dirname(__file__), '..', 'Portfolio_Website_Vault')


def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown content.

    Returns (metadata_dict, body_text).
    Returns ({}, content) if no frontmatter block found.
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
            metadata[key] = value

    return metadata, body


def load_vault(vault_path):
    """Walk all .md files in vault_path, parse frontmatter, build page index.

    Returns dict mapping page id -> {id, title, tags, type, file_path, content}.
    Skips pages with type 'meta' or missing 'id' field.
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
                'tags': metadata.get('tags', []),
                'type': metadata.get('type', 'source'),
                'file_path': file_path,
                'content': body.strip(),
            }

    print(f"Vault loaded: {len(vault)} pages from {resolved_path}")
    return vault


def build_index_summary(vault):
    """Build compact text index for the context-selection prompt.

    One line per page: 'ID: <id> | Title: <title> | Tags: <tags>'
    """
    lines = []
    for page in sorted(vault.values(), key=lambda p: p['id']):
        tags = ', '.join(page['tags']) if page['tags'] else 'none'
        lines.append(f"ID: \"{page['id']}\" | Title: \"{page['title']}\" | Tags: {tags}")
    return '\n'.join(lines)


# Load at import time (same pattern as the old context_loader.py)
VAULT = load_vault(VAULT_PATH)
INDEX_SUMMARY = build_index_summary(VAULT)
