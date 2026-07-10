---
id: the-journey
title: The Journey — From RAG to LLM-Wiki
type: wiki
parent: about-this-website
related: [about-this-website, architecture-and-story]
summary: How this site's knowledge base evolved from traditional RAG to a Wikipedia-style LLM-wiki, roughly 6-8 months before Karpathy popularized the idea.
tags: [architecture, llm-wiki, rag, karpathy, story, development]
sources: [sop]
last_updated: 2026-07-10
---
# The Journey

Justin first tried traditional Retrieval-Augmented Generation (RAG): embed chunks of text, retrieve the closest match to a query. It worked when a question was phrased close to the stored text, but broke down whenever the wording drifted. Generating varied question-answer pairs to cover more phrasings helped a little, but meant every new fact needed multiple hand-written, embedded variants — a tedious approach that didn't scale.

The breakthrough was a reframe: instead of matching embeddings, organize the knowledge base by category and let the LLM itself decide which file to fetch before answering. The first version worked immediately — a real "lightbulb" moment. Two problems followed fast: the model sometimes grabbed the wrong file, and on longer exchanges it would lose track of the task ("context rot"). Renaming files clearly and splitting content into smaller, more focused pages fixed both.

Justin built this roughly 6-8 months before Andrej Karpathy described the same idea as "LLM Wiki" ([gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Today the knowledge base is a small Wikipedia-style tree — a root page linking to section hubs (academics, career, projects, skills, personal, this website), each linking to focused pages — so the model navigates straight to what it needs instead of scanning everything.
