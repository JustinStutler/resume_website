// js/wiki/router.js
// Hash routing (#/wiki/<id>) with back/forward support and a default home page.

import { renderPage } from './view.js';
import { getHomeId } from './wikiIndex.js';

const HASH_RE = /^#\/wiki\/([a-z0-9-]+)/i;

export function currentId() {
    const m = HASH_RE.exec(location.hash || '');
    return m ? m[1] : null;
}

export function navigate(id) {
    if (!id) return;
    if (currentId() === id) {
        renderPage(id); // same page — re-render (e.g. clicked the active section)
        return;
    }
    location.hash = '#/wiki/' + id;
}

function route() {
    const id = currentId() || getHomeId();
    renderPage(id);
}

export function initRouter() {
    window.addEventListener('hashchange', route);
    route();
}
