# Justin's Portfolio AI Assistant

[![Generic badge](https://img.shields.io/badge/LLM-OpenRouter%20Free%20Tier-blue.svg)](https://openrouter.ai/)
[![Generic badge](https://img.shields.io/badge/Interface-Wiki%20%2B%20AI%20Chat-green.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Purpose-Resume/Portfolio-orange.svg)](https://shields.io/)

## About

This is my twist on a portfolio website. It combines a structured, Wikipedia style interface with an integrated AI chatbot. The site started life as a typical full screen LLM chat UI, and it has since been rebuilt into a "Wiki + LLM" experience. You can browse detailed markdown articles about my background, projects, and coursework, and at the bottom of the screen a docked AI assistant answers questions by pulling from that same wiki content.

## Purpose

I wanted a portfolio that was more engaging than my previous one, and I also wanted hands on practice integrating AI into a real web application. The Wiki + LLM interface lets visitors explore the information manually or just ask the assistant, so they get the best of both approaches.

**Live Demo:** https://justinstutlerai.netlify.app/

## Preview

![Portfolio AI Assistant](readme_image.png)

## Features

### Wikipedia Style Interface

The frontend is a single page application modeled on Wikipedia.

* **Top Navigation Bar:** Persistent search plus six colored section links (Academics, Career, Projects, Skills, Personal, About).
* **Inline Articles:** Each page renders with its descendant sections expanded in place, so the reader never gets bounced to a tiny standalone page. Hub pages become section blocks and leaf pages become cards, with a lead line, preview image, and a "View PDF" pill where a source document exists.
* **Curated Home Page:** A short bio and a Wikipedia style infobox, a compact index of the sections, and the "About Me" and "How This Works" sections shown in full.
* **Collapsible Everything:** Every section header can be clicked to collapse or expand, and the article border color matches the current section.

### Docked AI Assistant

Instead of a full screen landing page, the chatbot lives in a collapsible dock at the bottom of the screen that is always accessible.

* Ask anything about my education, projects, work experience, or interests.
* The assistant retrieves the relevant wiki pages and answers in the third person, grounded only in that content.

## How It Works

### LLM Wiki Knowledge Base

The knowledge base uses what Andrej Karpathy calls an [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): a collection of markdown files organized as a Wikipedia style tree. Each page carries YAML frontmatter (`id`, `title`, `type`, `parent`, `related`, `summary`, `tags`, `last_updated`) so the content is structured and easy for the LLM to index and retrieve.

The vault is split across two locations for a deliberate reason.

* **`client/vault/wiki/`** is public. Netlify serves it directly, and it is the single source of truth for the wiki UI. A generated manifest, `wiki-index.json`, maps every page to its path, title, summary, tags, parent, and related links.
* **`Portfolio_Website_Vault/sources/`** is private and backend only. It holds the raw immutable documents (resume, statement of purpose, course materials, and so on) and never sits under `client/`, so Netlify never exposes it.

The backend loads both roots and merges them, so AI retrieval sees the full picture while the public wiki stays self contained. Adding knowledge is just creating a new `.md` file with frontmatter, regenerating the index with `server/gen_wiki_index.py`, and redeploying. No Python changes required.

This replaces the original approach, where context lived in a handful of plain `.txt` files under `server/content/` and a single LLM call picked from a small hard coded list of context groups. That worked, but adding content meant editing Python, and the rigid structure made cross referencing topics awkward.

The structured wiki approach produced noticeably better answers than traditional vector RAG. Rather than embedding and retrieving fragmented chunks, the model reads a compact tree map of page titles, summaries, and tags, then selects the relevant pages by ID. The context it receives is complete, well structured wiki pages, so answers stay coherent and grounded.

### Three Stage Pipeline

Chat queries flow through three sequential LLM calls, all served by OpenRouter free tier models.

1. **Scope Guard** (`server/scope_guard.py`): A fast JSON mode call classifies the query as in scope (about Justin) or out of scope. Out of scope queries get a hard refusal with no context retrieval, and the stage fails open on an API error so legitimate queries are never blocked.

2. **Context Selection** (`server/ai_service.py`): A JSON mode call reads the vault tree map and returns the IDs of the most specific relevant pages. Those IDs are validated, then a bounded one hop expansion pulls in related neighbors, capped at six pages total.

3. **Answer Generation** (`server/ai_service.py`): A chat call with the selected pages injected as context blocks. The system instruction enforces third person references to Justin, concise prose, and context only answers.

The original version used a two call pipeline (context selection plus answer generation). Adding the scope guard as an initial stage stops the model from hallucinating answers to off topic questions and skips unnecessary retrieval.

### Deployment

Render hosts the backend and Netlify hosts the frontend. Both run on the free tier, which means the backend can take roughly a minute to cold start if it has not been called recently.

## Tech Stack

This project uses a stack I reach for often on personal projects.

* **Python and Flask** for the backend API server
* **JavaScript (ES6), HTML, CSS** for the frontend, vanilla modules with no framework or build step
* **OpenRouter free tier models** (via the OpenAI compatible API) powering the chatbot
* **RESTful API** connecting the frontend and backend
* **Git** for version control
* **Netlify** for the frontend, **Render** for the backend

## What's New

**Latest: Wikipedia Style Wiki plus Docked Chat**
Replaced the old suggestion chips and full screen chat with a Wikipedia style single page application. The UI now has a top navigation bar mapped to wiki sections, an article area that renders each page with its sections inline, collapsible headers, a curated home page, and an always accessible docked chat panel.

**Split Vault**
Reorganized the knowledge base into a public wiki tree under `client/vault/wiki/` (served straight from Netlify, with a generated `wiki-index.json` manifest) and a private `Portfolio_Website_Vault/sources/` directory for raw documents that stays backend only.

**LLM Wiki Knowledge Base**
Replaced the old `server/content/*.txt` context system with a structured LLM Wiki, and added the scope guard as an initial pipeline stage to reject off topic queries before any retrieval.

**Coming Up**
* Integrating the latest projects (AI interface, song genre from album art, and more)
* Continued interface and UX improvements

## Built With
Claude, OpenRouter, my own brain, patience, curiosity, and iteration
