# server/gen_wiki_index.py
"""Generate client/vault/wiki-index.json -- a metadata-only manifest for the wiki UI.

The static frontend cannot list a directory or resolve bare page ids to file paths,
so this emits one small JSON map (id -> path/title/summary/tags/parent/related).
Page bodies are NOT included -- they are fetched live from the .md files on click.

Reuses vault_loader's frontmatter parser. Wiki pages only (sources stay private).
Run after any wiki content change:  python server/gen_wiki_index.py
"""
import os
import json

import vault_loader

_HERE = os.path.dirname(os.path.abspath(__file__))
WIKI_ROOT = os.path.abspath(os.path.join(_HERE, '..', 'client', 'vault', 'wiki'))
CLIENT_ROOT = os.path.abspath(os.path.join(_HERE, '..', 'client'))
OUT_PATH = os.path.join(_HERE, '..', 'client', 'vault', 'wiki-index.json')
HOME_ID = 'justin-stutler'


def build_manifest():
    """Return the manifest dict built from the public wiki root."""
    pages = vault_loader.load_vault(WIKI_ROOT)  # wiki pages only, no sources
    entries = {}
    for pid, page in pages.items():
        # web path relative to the client/ root (the deployed web root)
        rel = os.path.relpath(page['file_path'], CLIENT_ROOT).replace(os.sep, '/')
        entries[pid] = {
            'id': pid,
            'path': rel,
            'title': page['title'],
            'summary': page['summary'],
            'tags': page['tags'],
            'parent': page['parent'],
            'related': page['related'],
        }
    return {
        'home': HOME_ID,
        'generated_from': 'client/vault/wiki',
        'count': len(entries),
        'pages': entries,
    }


def main():
    manifest = build_manifest()
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"Wrote {os.path.abspath(OUT_PATH)} ({manifest['count']} wiki pages)")
    if HOME_ID not in manifest['pages']:
        print(f"WARNING: home id '{HOME_ID}' not found among wiki pages")


if __name__ == '__main__':
    main()
