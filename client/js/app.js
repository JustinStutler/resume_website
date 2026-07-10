// js/app.js
// Wiki-first bootstrap: load the index, wire the top section nav + search, start
// the hash router, and mount the docked AI chat.

import { loadIndex, getHomeId, sectionOf } from './wiki/wikiIndex.js';
import { initView } from './wiki/view.js';
import { initRouter, navigate, currentId } from './wiki/router.js';
import { initSearch } from './wiki/search.js';
import { initDock } from './chat/dock.js';

const SECTION_IDS = ['academics', 'career', 'projects', 'skills', 'personal', 'about-this-website'];

document.addEventListener('DOMContentLoaded', async () => {
    const article = document.getElementById('wiki-article');
    initView(article);

    try {
        await loadIndex();
    } catch (e) {
        console.error(e);
        article.innerHTML =
            '<h1>Wiki unavailable</h1>' +
            '<p class="wiki-page-error">Could not load <code>vault/wiki-index.json</code>. ' +
            'Serve the site over http (e.g. <code>python -m http.server</code> from <code>client/</code>) ' +
            'rather than opening the file directly, and make sure the index has been generated ' +
            '(<code>python server/gen_wiki_index.py</code>).</p>';
        initDock(); // chat can still work independently
        return;
    }

    // Section nav + brand → navigate.
    document.querySelectorAll('#section-nav .sec, .site-brand').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            navigate(a.dataset.wikiId);
        });
    });

    initSearch(document.getElementById('wiki-search'), document.getElementById('search-results'));
    initRouter();

    window.addEventListener('hashchange', updateNavHighlight);
    updateNavHighlight();

    initDock();
});

function updateNavHighlight() {
    const id = currentId() || getHomeId();
    const section = sectionOf(id, SECTION_IDS);
    document.querySelectorAll('#section-nav .sec').forEach(a => {
        a.classList.toggle('active', a.dataset.wikiId === section);
    });
}
