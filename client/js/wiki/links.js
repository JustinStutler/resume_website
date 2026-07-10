// js/wiki/links.js
// After a page renders, rewrite bare-id wiki links ([text](academics)) into
// hash routes, open external links in a new tab, and mark unknown ids as inert.

import { getPageMeta } from './wikiIndex.js';

const BARE_ID = /^[a-z0-9][a-z0-9-]*$/;

export function rewriteLinks(container) {
    container.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;

        // Absolute URLs / mailto / tel / in-page anchors / rooted or relative paths — leave alone.
        if (/^(https?:|mailto:|tel:|#|\/|\.)/i.test(href)) {
            if (/^https?:/i.test(href)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            return;
        }

        // Relative document/asset links (PDFs, images) — open in a new tab, not the SPA.
        if (/\.(pdf|png|jpe?g|gif|webp|zip)$/i.test(href)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            return;
        }

        const id = href.replace(/\.md$/i, '');
        if (!BARE_ID.test(id)) return;

        if (getPageMeta(id)) {
            a.setAttribute('href', '#/wiki/' + id);
        } else {
            a.classList.add('wiki-link-missing');
            a.removeAttribute('href');
            a.title = 'Page not available';
        }
    });
}
