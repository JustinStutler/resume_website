---
id: architecture-and-story
title: Architecture and Story
type: wiki
parent: about-this-website
related: [the-journey, query-flow, tech-stack, sop]
summary: Overview of this site's LLM-wiki architecture and a pointer to the fuller development story.
tags: [architecture, llm-wiki, rag, information-retrieval, karpathy, story]
sources: [sop]
last_updated: 2026-07-10
---
# Architecture and Story

## The Architecture

The architecture was developed by Justin over the course of his master's studies, originally inspired by his research into RAG and information retrieval with LLMs while building a better portfolio website. For the full story of how it evolved from traditional RAG into today's structured, Wikipedia-style knowledge base — including its timing relative to Andrej Karpathy's ["LLM Wiki"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) concept — see [The Journey](the-journey).

The knowledge base is now split into small, clearly named, section-level pages arranged in a navigable tree, so the model retrieves only the specific context a query needs rather than scanning whole documents. The result: fewer wrong-file lookups and less "context rot" on longer exchanges.
