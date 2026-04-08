# Justin's Portfolio AI Assistant

[![Generic badge](https://img.shields.io/badge/LLM-Gemini-blue.svg)](https://gemini.google.com/)
[![Generic badge](https://img.shields.io/badge/Interface-Chatbot-green.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Purpose-Resume/Portfolio-orange.svg)](https://shields.io/)

## About

This is my twist on a porfolio website, as it is styled as an AI chatbot. You can ask it questions about my background, projects, coursework, or anything you'd normally look for in a resume. It pulls from my actual resume content and responds conversationally using Gemini.

## Purpose

I wanted to enhance my porfolio website to be more engaging than my previous one, and I also wanted to learn more about integrating AI into web applications. 

**Live Demo:** https://justinstutlerai.netlify.app/

## Preview

![Portfolio AI Assistant](readme_image.png)

## Features

### Chips: Quick Queries

Click on a chip to send a Quick Query, common queries a user may have, which are displayed as chips and organized by category and color.

#### 🟢 Info 
- **About Justin**: Learn more about me
- **How This Works**: Learn more about the website
- **Photo Gallery**: View some photos of me

#### 🔵 Academics
- **GRE Scores**: View my GRE scores
- **About a Class**: Learn more about a class I took during my undergraduate studies - graduate studies coming soon

#### 🟡 Projects
- **AI Interface**: View the AI interface project - coming soon
- **Housing Prices**: View the housing prices project
- **Facial Recognition**: View the facial recognition project

#### 🟣 Research
- **Song Genre from Album Art**: View the song genre from album art project - coming soon
- **Robot Localization**: View the robot localization project
- **Uninformed & Informed Search**: View the uninformed & informed search project

#### 🩷 Links
- **GitHub**: Navigate to my GitHub profile

#### 🟠 Docs
- **Resume**: View my resume
- **Statement of Purpose**: View my statement of purpose

### Chat Queries

The user can freely ask questions about me, my education, projects, work experience, or any other questions they have and receive a catered response if the information is available.
AI and RAG are used to retrieve information about me and respond accordingly.

## How It Works

### LLM Wiki — Knowledge Base

The knowledge base uses what Andrej Karpathy calls an [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — a collection of markdown files organized in an Obsidian vault (`Portfolio_Website_Vault/`). Each page has YAML frontmatter with an `id`, `title`, `tags`, and `type`, making the content structured and easy for the LLM to index and retrieve.

This replaces the original approach where context lived in a handful of plain `.txt` files inside `server/content/`. The old system used a single LLM call to pick from a small, hard-coded list of context groups. It worked, but adding new content meant editing Python code and the rigid structure made it hard to cross-reference topics.

The vault approach is far more flexible: adding knowledge is just creating a new `.md` file with frontmatter and dropping it in the vault. The loader (`server/vault_loader.py`) walks the directory at startup and builds an in-memory index automatically — no code changes needed.

This structured wiki approach produced drastically better response quality than traditional RAG. Rather than embedding and retrieving chunks from a vector database, the LLM reads a compact index of page titles and tags and selects the relevant pages by ID. The context it receives is complete, well-structured wiki pages — not fragmented chunks — so answers are more coherent and grounded.

### Three-Stage Pipeline

Chat queries go through three sequential LLM calls:

1. **Scope Guard** (`server/scope_guard.py`) — A fast Gemini JSON-mode call classifies the query as in-scope (about Justin) or out-of-scope. Out-of-scope queries get a hard refusal without any context retrieval. Fails open on API error so legitimate queries are never blocked.

2. **Context Selection** (`server/ai_service.py`) — A JSON-mode Gemini call reads the vault index summary (titles + tags of every page) and returns the IDs of relevant pages. This is the key upgrade from the old system: instead of picking from a few broad groups, it selects from individual wiki pages, giving the final answer much more targeted context.

3. **Answer Generation** (`server/ai_service.py`) — A Gemini chat call with the selected vault page content injected as context blocks. System instructions enforce third-person references and context-only answers.

The original version used a two-call pipeline (context selection + answer generation). Adding the scope guard as Stage 0 prevents the model from hallucinating answers to off-topic questions and saves unnecessary context retrieval.

### Quick Query Chips

The chips are hard-coded to give preset responses for common queries (about, photo gallery, GRE scores, etc.) without hitting the backend.

### Deployment

Render deploys the backend and Netlify deploys the frontend. The free tier is used, which means a ~1 minute cold start for the backend if it has not been called recently.

## Tech Stack

This project utilizes a tech stack that I frequently use for personal projects:

* **Python, Flask** for the backend API server
* **JavaScript (ES6), HTML, CSS** for the frontend (no frameworks, vanilla JS modules)
* **Google Gemini API** for the LLM powering the chatbot
* **RESTful API** design connecting the frontend and backend
* **Git** for version control
* **Netlify** for frontend deployment, **Render** for backend deployment

## What's New

**Latest: LLM Wiki Knowledge Base**
Replaced the old `server/content/*.txt` context system with an Obsidian vault knowledge base (LLM Wiki). Added a scope guard as a new first stage in the pipeline to reject off-topic queries before any context retrieval. The vault loader automatically indexes all markdown pages at startup — adding new content no longer requires code changes.

**Previous: UI Redesign**
Rebuilt the entire interface with a dark theme, navigation tabs, and a cleaner chat experience.

**Coming Up**
* Integrating the latest projects (AI interface, song genre from album art, and more)
* Continued interface and UX improvements

## Built With
claude, gemini, my own brain, patience, curiosity, and iteration