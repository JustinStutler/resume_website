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

    // Section nav + home button → navigate.
    document.querySelectorAll('#section-nav .sec, .tb-home').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            navigate(a.dataset.wikiId);
        });
    });

    // The collapsed toolbar is a clickable strip: a click anywhere on it reveals
    // every element at once (no fade). Arriving via an in-page "Explore the wiki"
    // link instead reveals it with a slow 2s fade (handled in updateNav).
    const topbar = document.querySelector('.wiki-topbar');
    if (topbar) topbar.addEventListener('click', () => revealTopbar(false));

    initSearch(document.getElementById('wiki-search'), document.getElementById('search-results'));
    initRouter();

    window.addEventListener('hashchange', updateNav);
    updateNav();

    initDock();
});

// The whole toolbar starts collapsed on first load and, once revealed, stays
// visible for the rest of the visit.
let topbarRevealed = false;

// Reveal the toolbar. `fade` = true plays the slow 2s opacity fade (used when the
// visitor navigates away from home, e.g. via an "Explore the wiki" link); false
// reveals instantly (used when the visitor clicks the collapsed strip directly).
function revealTopbar(fade) {
    topbarRevealed = true;
    const bar = document.querySelector('.wiki-topbar');
    if (!bar) return;
    bar.classList.toggle('topbar-fade', !!fade);
    bar.classList.remove('topbar-collapsed');
    const nav = document.getElementById('section-nav');
    if (nav) nav.classList.remove('nav-hidden');
}

function updateNav() {
    const id = currentId() || getHomeId();
    const section = sectionOf(id, SECTION_IDS);

    // Any navigation away from home reveals the toolbar with the slow fade; on home
    // it stays a collapsed strip until the visitor clicks it.
    if (id !== getHomeId() && !topbarRevealed) revealTopbar(true);

    const bar = document.querySelector('.wiki-topbar');
    if (bar) bar.classList.toggle('topbar-collapsed', !topbarRevealed);
    const nav = document.getElementById('section-nav');
    if (nav) nav.classList.toggle('nav-hidden', !topbarRevealed);

    document.querySelectorAll('#section-nav .sec').forEach(a => {
        a.classList.toggle('active', a.dataset.wikiId === section);
    });
}
