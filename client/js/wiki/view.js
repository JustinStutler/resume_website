// js/wiki/view.js
// Fetches a page's .md, renders the body with marked, adds a breadcrumb, and (on
// the home page) a Wikipedia-style infobox with one portrait in the top-right.

import { parseFrontmatter } from './frontmatter.js';
import { getPageMeta, getHomeId } from './wikiIndex.js';
import { rewriteLinks } from './links.js';

const HOME_IMAGE = 'portraits/ice_cave.JPG';

let articleEl = null;

export function initView(el) {
    articleEl = el;
}

function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
}

function buildBreadcrumb(id) {
    const chain = [];
    let cur = getPageMeta(id);
    let guard = 0;
    while (cur && cur.parent && guard++ < 12) {
        const parent = getPageMeta(cur.parent);
        if (!parent) break;
        chain.unshift(parent);
        cur = parent;
    }
    if (chain.length === 0) return null;

    const crumb = el('div', 'wiki-breadcrumb');
    chain.forEach((p, i) => {
        const a = el('a', null, p.title);
        a.setAttribute('href', '#/wiki/' + p.id);
        crumb.appendChild(a);
        crumb.appendChild(document.createTextNode(i < chain.length - 1 ? '  ›  ' : '  ›  '));
    });
    return crumb;
}

function buildInfobox(meta) {
    const box = el('aside', 'wiki-infobox');
    const img = el('img');
    img.src = HOME_IMAGE;
    img.alt = meta.title;
    img.loading = 'lazy';
    box.appendChild(img);
    box.appendChild(el('div', 'ib-caption', meta.title));
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
    const meta = getPageMeta(id);
    if (!meta) {
        renderMessage(id, `There is no wiki page with the id "${id}".`);
        return;
    }

    let text;
    try {
        const res = await fetch(meta.path + '?v=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        text = await res.text();
    } catch (e) {
        console.error('Failed to load page', id, e);
        renderMessage(id, `Could not load "${meta.title}". If you opened the file directly, serve the site over http instead of file://.`);
        return;
    }

    const { body } = parseFrontmatter(text);
    const bodyHtml = (typeof marked !== 'undefined' && marked.parse)
        ? marked.parse(body)
        : body.replace(/\n/g, '<br>');

    articleEl.innerHTML = '';

    const crumb = buildBreadcrumb(id);
    if (crumb) articleEl.appendChild(crumb);

    const article = el('div', 'article-body', bodyHtml);

    // Guarantee a leading H1 (the .md bodies start with one, but be safe).
    let h1 = article.querySelector('h1');
    if (!h1) {
        h1 = el('h1', null, meta.title);
        article.insertBefore(h1, article.firstChild);
    }

    // Home page: float one portrait beside the first section (infobox after the H1).
    if (id === getHomeId()) {
        const infobox = buildInfobox(meta);
        h1.parentNode.insertBefore(infobox, h1.nextSibling);
    }

    articleEl.appendChild(article);
    rewriteLinks(articleEl);

    document.title = meta.title + ' — Justin Stutler Wiki';
    window.scrollTo({ top: 0, behavior: 'auto' });
}
