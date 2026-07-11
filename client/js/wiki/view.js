// js/wiki/view.js
// Renders a wiki page with its descendant content inline. Section/leaf pages show
// every descendant fully expanded (hubs as collapsible section blocks, leaves as
// vertical cards). The HOME page is a curated landing: a short bio, a small index
// of the remaining sections, and two sections shown in full (About Me + How This
// Works). Every section header is click-to-collapse; nothing navigates away.

import { parseFrontmatter } from './frontmatter.js';
import { getPageMeta, getHomeId, allPages, sectionOf } from './wikiIndex.js';
import { rewriteLinks } from './links.js';

const HOME_IMAGE = 'portraits/ice_cave.JPG';
const SECTION_IDS = ['academics', 'career', 'projects', 'skills', 'personal', 'about-this-website'];

// Short labels for the home "Explore the wiki" index — kept identical to the top
// section-nav (index.html) so the two navigations read the same.
const SECTION_NAV_LABEL = {
    academics: 'Academics', career: 'Career', projects: 'Projects',
    skills: 'Skills', personal: 'Personal', 'about-this-website': 'About'
};

// Section → accent color name. The page's own section color is reserved for the
// article frame; cards cycle through the OTHER colors so they stay distinguishable.
const SECTION_COLOR = {
    academics: 'red', career: 'orange', projects: 'yellow',
    skills: 'green', personal: 'blue', 'about-this-website': 'purple'
};
const CARD_PALETTE = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
let _cardColors = CARD_PALETTE.slice();
let _cardIdx = 0;
function pickCardColor() {
    const c = _cardColors[_cardIdx % _cardColors.length];
    _cardIdx++;
    return c;
}

// Cards start at the color immediately AFTER the page's own section color in the
// rainbow (career=orange → first card yellow) and cycle onward, skipping the page's
// color (reserved for the article frame). Falls back to the full rainbow on home.
function orderedCardColors(pageColorName) {
    if (!pageColorName) return CARD_PALETTE.slice();
    const start = CARD_PALETTE.indexOf(pageColorName);
    const out = [];
    for (let k = 1; k <= CARD_PALETTE.length; k++) {
        const c = CARD_PALETTE[(start + k) % CARD_PALETTE.length];
        if (c !== pageColorName) out.push(c);
    }
    return out;
}

// Preview image + PDF per project leaf.
const MEDIA_MAP = {
    'deep-learning-capstone': { img: 'Song-Genre-Project.png', pdf: 'Song-Genre-Project.pdf' },
    'transformer-rl-agent': { img: 'Connect-4-Proposal.png', pdf: 'Connect-4-Proposal.pdf' },
    'house-prices': { img: 'House-Prices---Advanced-Regression-Techniques.png', pdf: 'House-Prices---Advanced-Regression-Techniques.pdf' },
    'facial-recognition': { img: 'Facial-Recognition.png', pdf: 'Facial-Recognition.pdf' },
    'robot-localization': { img: 'Robot-Localization-with-Particle-Filtering.png', pdf: 'Robot-Localization-with-Particle-Filtering.pdf' },
    'uninformed-informed-search': { img: 'Uninformed-and-Informed-Search.png', pdf: 'Uninformed-and-Informed-Search.pdf' }
};

const bodyCache = new Map(); // path -> raw body markdown

let articleEl = null;
let renderToken = 0;

export function initView(el) {
    articleEl = el;
}

function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    ));
}

function mdToHtml(body) {
    return (typeof marked !== 'undefined' && marked.parse)
        ? marked.parse(body)
        : body.replace(/\n/g, '<br>');
}

function stripLeadingH1(html) {
    return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, '');
}

async function fetchBody(meta) {
    if (bodyCache.has(meta.path)) return bodyCache.get(meta.path);
    const res = await fetch(meta.path + '?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { body } = parseFrontmatter(await res.text());
    bodyCache.set(meta.path, body);
    return body;
}

// Children of `id`, ordered by the parent's curated `related` list.
function orderedChildren(id) {
    const meta = getPageMeta(id);
    const kids = allPages().filter(p => p.parent === id);
    const order = (meta && meta.related) || [];
    return kids
        .map((k, i) => ({ k, i }))
        .sort((a, b) => {
            const ra = order.indexOf(a.k.id), rb = order.indexOf(b.k.id);
            return (ra < 0 ? 1e6 + a.i : ra) - (rb < 0 ? 1e6 + b.i : rb);
        })
        .map(x => x.k);
}

function collectDescendants(id, out) {
    for (const child of orderedChildren(id)) {
        out.push(child);
        collectDescendants(child.id, out);
    }
    return out;
}

function sectionColorOf(id) {
    return sectionOf(id, SECTION_IDS);
}

// Color every horizontal rule in the article — the underline beneath each header
// plus any real <hr>. Two independent rainbow sequences:
//   • Page-level rules (not inside a card) start at the page's own section color and
//     continue onward (career=orange → orange, yellow, green, …). The very first one,
//     the underline beneath the page's main title, is rendered VERY thick; the rest
//     stay thin. Home has no single section color, so it starts at red.
//   • Each card's rules restart at that card's own accent color (data-card-color) and
//     cycle from there, so a card's first rule matches the stripe highlighting it.
// Only lines that actually render a border are sequenced, so the rainbow never skips.
function colorizeRules(root, pageColorName) {
    const hasRule = node => {
        const cs = getComputedStyle(node);
        return parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
    };
    const colorAt = (name, offset) => {
        const start = name ? CARD_PALETTE.indexOf(name) : 0;
        return CARD_PALETTE[(start + offset) % CARD_PALETTE.length];
    };

    let pageIdx = 0;
    let isFirstPageRule = true;
    const cardCounts = new Map(); // card element -> rules colored so far

    for (const node of root.querySelectorAll('hr, h1, h2, h3')) {
        if (!hasRule(node)) continue;
        const card = node.closest('.wiki-card');
        if (card) {
            const n = cardCounts.get(card) || 0;
            node.dataset.ruleColor = colorAt(card.dataset.cardColor, n);
            cardCounts.set(card, n + 1);
        } else {
            node.dataset.ruleColor = colorAt(pageColorName, pageIdx++);
            if (isFirstPageRule) { node.dataset.ruleWeight = 'thick'; isFirstPageRule = false; }
        }
    }
}

// Make `titleEl` a click-to-collapse control for `bodyEl`.
function makeCollapsible(titleEl, bodyEl) {
    titleEl.classList.add('collapse-toggle');
    bodyEl.classList.add('collapsible-body');
    titleEl.addEventListener('click', () => {
        titleEl.classList.toggle('collapsed');
        bodyEl.classList.toggle('collapsed');
    });
}

// Turn each top-level <h2> inside `container` into a collapsible sub-section.
function makeBodyHeadersCollapsible(container) {
    if (!container) return;
    for (const h of Array.from(container.querySelectorAll(':scope > h2'))) {
        const wrap = el('div', 'collapsible-body');
        let next = h.nextSibling;
        while (next && !(next.nodeType === 1 && /^H[12]$/.test(next.tagName))) {
            const cur = next;
            next = next.nextSibling;
            wrap.appendChild(cur);
        }
        h.parentNode.insertBefore(wrap, h.nextSibling);
        h.classList.add('collapse-toggle');
        h.addEventListener('click', () => {
            h.classList.toggle('collapsed');
            wrap.classList.toggle('collapsed');
        });
    }
}


function buildInfobox(meta) {
    const box = el('aside', 'wiki-infobox');
    const img = el('img');
    img.src = HOME_IMAGE;
    img.alt = meta.title;
    img.loading = 'lazy';
    box.appendChild(img);
    return box;
}

function pdfButton(meta) {
    const media = MEDIA_MAP[meta.id];
    if (!media || !media.pdf) return null;
    const paperIcon = '<svg class="btn-pdf-icon" viewBox="0 0 24 24" width="15" height="15" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>' +
        '<polyline points="14 2 14 8 20 8"></polyline>' +
        '<line x1="8" y1="13" x2="16" y2="13"></line>' +
        '<line x1="8" y1="17" x2="16" y2="17"></line></svg>';
    const a = el('a', 'btn-pdf', paperIcon + '<span>View PDF</span>');
    a.setAttribute('href', 'pdfs/' + media.pdf);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
}

function projectImage(meta) {
    const media = MEDIA_MAP[meta.id];
    if (!media || !media.img) return null;
    const wrap = el('div', 'project-media');
    wrap.innerHTML = `<img src="pngs/${media.img}" alt="${escapeHtml(meta.title)} preview" loading="lazy" />`;
    return wrap;
}

// A leaf page → vertical card. Header = title (collapse) + PDF button (top-right).
// Body = hook line, preview image, then the full markdown (with collapsible ## sections).
function buildCard(meta) {
    const raw = bodyCache.get(meta.path);
    const card = el('article', 'wiki-card');
    card.dataset.cardColor = pickCardColor();

    const head = el('div', 'card-head');
    const title = el('h3', 'card-title', escapeHtml(meta.title));
    head.appendChild(title);
    const pdf = pdfButton(meta);
    if (pdf) head.appendChild(pdf);
    card.appendChild(head);

    const body = el('div', null);
    const hook = meta.hook || meta.summary;
    if (hook) body.appendChild(el('p', 'card-summary', escapeHtml(hook)));
    const img = projectImage(meta);
    if (img) body.appendChild(img);

    if (raw != null) {
        const cb = el('div', 'card-body', stripLeadingH1(mdToHtml(raw)));
        body.appendChild(cb);
        card.appendChild(body);
        makeCollapsible(title, body);
        makeBodyHeadersCollapsible(cb);
    } else {
        body.appendChild(el('p', 'wiki-page-error', `Could not load "${escapeHtml(meta.title)}".`));
        card.appendChild(body);
        makeCollapsible(title, body);
    }
    return card;
}

// A hub page (has children) → collapsible section block: colored heading, its own
// intro, then every child rendered in full.
function buildSection(meta, depth) {
    const raw = bodyCache.get(meta.path);
    const sec = el('section', 'wiki-embed');
    sec.dataset.sectionColor = sectionColorOf(meta.id) || '';

    const title = el('h2', 'embed-title', escapeHtml(meta.title));
    sec.appendChild(title);

    const body = el('div', null);
    if (raw != null) {
        const intro = stripLeadingH1(mdToHtml(raw)).trim();
        if (intro) body.appendChild(el('div', 'embed-intro', intro));
    }
    const kids = el('div', 'embed-children');
    for (const child of orderedChildren(meta.id)) kids.appendChild(buildDescendant(child, depth + 1));
    body.appendChild(kids);

    sec.appendChild(body);
    makeCollapsible(title, body);
    return sec;
}

function buildDescendant(meta, depth) {
    return orderedChildren(meta.id).length > 0
        ? buildSection(meta, depth)
        : buildCard(meta);
}

// Small in-content index of the sections not shown in full on the home page.
function buildHomeIndex(restIds) {
    const box = el('section', 'home-index');
    box.appendChild(el('h2', null, 'Explore the wiki'));
    const ul = el('ul');
    for (const sid of restIds) {
        const m = getPageMeta(sid);
        if (!m) continue;
        const li = el('li');
        li.dataset.sectionColor = sectionColorOf(sid) || '';
        const a = el('a', null, escapeHtml(SECTION_NAV_LABEL[sid] || m.title));
        a.setAttribute('href', '#/wiki/' + sid);
        li.appendChild(a);
        ul.appendChild(li);
    }
    box.appendChild(ul);
    return box;
}

function renderMessage(id, message) {
    articleEl.innerHTML = '';
    articleEl.appendChild(el('h1', null, 'Page not found'));
    articleEl.appendChild(el('p', 'wiki-page-error', message));
    const home = el('p', null, '');
    const link = el('a', null, '← Back to the main page');
    link.setAttribute('href', '#/wiki/' + getHomeId());
    home.appendChild(link);
    articleEl.appendChild(home);
    document.title = 'Not found — Justin Stutler Wiki';
}

export async function renderPage(id) {
    if (!articleEl) return;
    const myToken = ++renderToken;
    const meta = getPageMeta(id);
    if (!meta) {
        renderMessage(id, `There is no wiki page with the id "${id}".`);
        return;
    }

    const isHome = id === getHomeId();
    // Home is just the bio + a colored section index (no expanded content). Other
    // pages embed their full descendant tree inline.
    const embedRoots = isHome ? [] : orderedChildren(id);

    // Prefetch this page + everything we will render, in parallel.
    const toLoad = [meta];
    for (const r of embedRoots) { toLoad.push(r); collectDescendants(r.id, toLoad); }
    await Promise.all(toLoad.map(m => fetchBody(m).catch(() => null)));

    if (myToken !== renderToken) return;

    if (!bodyCache.get(meta.path)) {
        renderMessage(id, `Could not load "${meta.title}". If you opened the file directly, serve the site over http instead of file://.`);
        return;
    }

    articleEl.dataset.section = sectionColorOf(id) || (isHome ? 'home' : '');

    // Cards use every accent color EXCEPT the page's own section color (which is
    // reserved for the article frame), so cards read as distinct from the page.
    const pageColorName = SECTION_COLOR[sectionColorOf(id)] || null;
    _cardColors = orderedCardColors(pageColorName);
    _cardIdx = 0;

    const article = el('div', 'article-body', mdToHtml(bodyCache.get(meta.path)));

    let h1 = article.querySelector('h1');
    if (!h1) {
        h1 = el('h1', null, escapeHtml(meta.title));
        article.insertBefore(h1, article.firstChild);
    }

    if (isHome) {
        article.insertBefore(buildInfobox(meta), h1.nextSibling);
        // Colored index of every section — no expanded content.
        article.appendChild(buildHomeIndex(SECTION_IDS));
    } else {
        // Leaf reached directly: show its preview media inline.
        const img = projectImage(meta);
        if (img && orderedChildren(id).length === 0) article.insertBefore(img, h1.nextSibling);
        // Make the page's own ## sections collapsible (before appending any embeds).
        makeBodyHeadersCollapsible(article);
        // Full descendant tree.
        if (embedRoots.length > 0) {
            const container = el('div', 'embedded-content');
            for (const r of embedRoots) container.appendChild(buildDescendant(r, 1));
            article.appendChild(container);
        }
    }

    articleEl.innerHTML = '';
    articleEl.appendChild(article);
    rewriteLinks(articleEl);
    colorizeRules(articleEl, pageColorName);

    document.title = meta.title + ' — Justin Stutler Wiki';
    window.scrollTo({ top: 0, behavior: 'auto' });
}
