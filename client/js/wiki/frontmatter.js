// js/wiki/frontmatter.js
// Client-side frontmatter parser — mirrors server/vault_loader.py (single-line
// scalars and [a, b] lists only). Returns { meta, body }.

export function parseFrontmatter(text) {
    const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(text);
    if (!match) return { meta: {}, body: text };

    const raw = match[1];
    const body = text.slice(match[0].length);
    const meta = {};

    for (const line of raw.split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        if (value.startsWith('[') && value.endsWith(']')) {
            meta[key] = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
        } else {
            if (value.length >= 2 && value[0] === value[value.length - 1] &&
                (value[0] === '"' || value[0] === "'")) {
                value = value.slice(1, -1);
            }
            meta[key] = value;
        }
    }
    return { meta, body };
}
