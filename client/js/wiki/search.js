// js/wiki/search.js
// Live search over the wiki index (title / summary / tags). Keyboard-navigable
// dropdown; Enter or click navigates to the page.

import { allPages } from './wikiIndex.js';
import { navigate } from './router.js';

const MAX_RESULTS = 8;

function rank(page, q) {
    const title = (page.title || '').toLowerCase();
    const summary = (page.summary || '').toLowerCase();
    const tags = (page.tags || []).join(' ').toLowerCase();
    const id = (page.id || '').toLowerCase();

    if (title.startsWith(q)) return 0;
    if (title.includes(q)) return 1;
    if (id.includes(q)) return 2;
    if (tags.includes(q)) return 3;
    if (summary.includes(q)) return 4;
    return -1;
}

export function initSearch(inputEl, resultsEl) {
    if (!inputEl || !resultsEl) return;

    let results = [];
    let activeIdx = -1;

    function hide() {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        activeIdx = -1;
    }

    function pick(id) {
        inputEl.value = '';
        hide();
        inputEl.blur();
        navigate(id);
    }

    function draw() {
        resultsEl.innerHTML = '';
        if (results.length === 0) {
            resultsEl.appendChild(Object.assign(document.createElement('div'),
                { className: 'search-empty', textContent: 'No matching pages.' }));
            resultsEl.hidden = false;
            return;
        }
        results.forEach((page, i) => {
            const item = document.createElement('div');
            item.className = 'search-item' + (i === activeIdx ? ' active' : '');
            item.setAttribute('role', 'option');
            item.innerHTML =
                `<div class="si-title">${escapeHtml(page.title)}</div>` +
                `<div class="si-summary">${escapeHtml((page.summary || '').slice(0, 110))}</div>`;
            item.addEventListener('mousedown', e => { e.preventDefault(); pick(page.id); });
            resultsEl.appendChild(item);
        });
        resultsEl.hidden = false;
    }

    function search(q) {
        q = q.trim().toLowerCase();
        if (!q) { results = []; hide(); return; }
        results = allPages()
            .map(p => ({ p, s: rank(p, q) }))
            .filter(x => x.s >= 0)
            .sort((a, b) => a.s - b.s || a.p.title.localeCompare(b.p.title))
            .slice(0, MAX_RESULTS)
            .map(x => x.p);
        activeIdx = -1;
        draw();
    }

    inputEl.addEventListener('input', () => search(inputEl.value));
    inputEl.addEventListener('focus', () => { if (inputEl.value.trim()) search(inputEl.value); });
    inputEl.addEventListener('blur', () => setTimeout(hide, 120));
    inputEl.addEventListener('keydown', e => {
        if (resultsEl.hidden || results.length === 0) {
            if (e.key === 'Escape') inputEl.blur();
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, results.length - 1); draw(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); draw(); }
        else if (e.key === 'Enter') { e.preventDefault(); pick(results[activeIdx >= 0 ? activeIdx : 0].id); }
        else if (e.key === 'Escape') { hide(); inputEl.blur(); }
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}
