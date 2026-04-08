---
id: portfolio-website
title: How This Portfolio Website Works
tags: portfolio, website, llm-wiki, obsidian, gemini, architecture, rag
type: wiki
---

# How This Portfolio Website Works

## Overview

This portfolio website is an AI-powered interactive experience where visitors can ask questions about Justin and receive accurate, contextual answers. Rather than a static resume page, it functions as a live conversational interface powered by Google Gemini.

## The LLM Wiki Architecture

This site implements an approach inspired by Andrej Karpathy's **LLM Wiki** concept ([original gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Instead of traditional RAG (Retrieval-Augmented Generation) that retrieves raw document chunks, the system maintains a **curated, interlinked knowledge base** — an Obsidian-style markdown wiki — that synthesizes information across sources.

### Three Layers

1. **Raw Sources** — Immutable original documents: Justin's resume, statement of purpose, course transcripts, GRE scores, and personal background. These live in `Portfolio_Website_Vault/sources/`.

2. **The Wiki** — LLM-generated and human-curated markdown pages that synthesize and cross-reference information from the raw sources. Each project, skill category, and experience entry gets its own page with structured summaries. These live in `Portfolio_Website_Vault/wiki/`.

3. **The Schema** — A `VAULT_SCHEMA.md` file that defines conventions for frontmatter fields (`id`, `title`, `tags`, `type`), page types, and how the vault is organized.

### Why This Is Better Than Traditional RAG

Traditional RAG splits documents into chunks, embeds them in a vector database, and retrieves the closest matches. This works but has limitations:
- Chunks lose context from the full document
- No cross-referencing between related topics
- Retrieval quality depends on embedding similarity, which can miss semantically relevant but differently-worded content

The LLM Wiki approach solves these problems:
- **Synthesized pages** contain curated, structured knowledge — not raw chunks
- **Cross-references and tags** let the retrieval step find related pages even when the wording differs
- **Human curation** ensures accuracy and removes noise
- **The wiki compounds over time** — new sources get integrated into existing pages, building richer context

As Karpathy notes: *"The tedious part of maintaining a knowledge base is not the reading or thinking — it's the bookkeeping."* LLMs handle the bookkeeping; the human curates sources and asks questions.

## The Three-Stage Pipeline

When a visitor asks a question, three things happen:

### Stage 0: Scope Guard
A fast Gemini call classifies whether the question is about Justin or off-topic. Off-topic questions get a polite redirect. This prevents the AI from being used as a general-purpose chatbot.

### Stage 1: Context Selection
Gemini reads the vault index (titles and tags of all wiki pages) and returns the IDs of pages relevant to the question. This is the "smart retrieval" step — it uses the LLM's understanding of the question to pick the right pages, not just keyword matching.

### Stage 2: Answer Generation
The selected wiki pages are bundled into a prompt with a system instruction. Gemini generates an answer grounded exclusively in the provided context. This ensures answers are accurate and traceable to real information about Justin.

## Tech Stack

- **Backend:** Python Flask API hosted on Render, with Gunicorn for production traffic
- **AI:** Google Gemini (`gemini-2.5-flash-lite`) via the `google-genai` SDK
- **Knowledge Base:** Obsidian-compatible markdown vault with YAML frontmatter
- **Frontend:** Vanilla JavaScript with ES6 modules, no framework, deployed to Netlify
- **Version Control:** GitHub

## Why It Matters

This isn't a template or a tutorial project. It's a fully deployed, production AI application that demonstrates:
- Knowledge base architecture and curation
- Multi-stage LLM pipeline design
- Prompt engineering for retrieval and generation
- Scope control and safety guardrails
- Full-stack deployment (Flask + Netlify + Render)

The same architectural patterns — curated knowledge bases, multi-stage pipelines, and scope guards — are used in production AI systems at scale.
