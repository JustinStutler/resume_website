// js/wiki/wikiIndex.js
// Loads the generated metadata manifest (client/vault/wiki-index.json) once and
// exposes lookups. Page bodies are fetched live elsewhere; this is metadata only.

let _index = null;

export async function loadIndex() {
    if (_index) return _index;
    const res = await fetch('vault/wiki-index.json?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load wiki index (' + res.status + ')');
    _index = await res.json();
    return _index;
}

export function getPageMeta(id) {
    return _index && _index.pages[id] ? _index.pages[id] : null;
}

export function getHomeId() {
    return _index ? _index.home : 'justin-stutler';
}

export function allPages() {
    return _index ? Object.values(_index.pages) : [];
}

// Walk parent chain to find the top-level section id from `sectionIds`.
export function sectionOf(id, sectionIds) {
    let cur = getPageMeta(id);
    let guard = 0;
    while (cur && guard++ < 12) {
        if (sectionIds.includes(cur.id)) return cur.id;
        if (!cur.parent) return null;
        cur = getPageMeta(cur.parent);
    }
    return null;
}
