---
id: query-flow
title: Query Flow
type: wiki
parent: about-this-website
related: [architecture-and-story, tech-stack]
summary: How a visitor's question becomes a grounded answer — scope classification, context retrieval from the markdown knowledge base, and grounded generation, plus failure cases.
tags: [query-flow, pipeline, scope-guard, retrieval, generation, failure-cases]
sources: [sop]
last_updated: 2026-07-10
---
# Query Flow

## Flow

1. A visitor asks a question through the frontend UI.
2. The frontend sends the query to the backend to kick off the query-handling process.
3. The backend makes an API call to OpenRouter, which serves free LLMs.
4. The LLM is first tasked with classifying whether the query is appropriate, and the process ends early if it is not.
5. The LLM reads a map of the structured knowledge base of markdown files and retrieves the relevant context pages.
6. The LLM then uses that context to generate its response, which keeps answers grounded in truth.

### Failure Cases

If a query is deemed inappropriate, the LLM immediately responds with a set message: "I'm only able to answer questions about Justin Stutler — his background, education, skills, projects, and experience. Is there something about Justin I can help you with?"

If a query is appropriate but the information needed to answer it cannot be found, the model responds with a set message: "I don't have specific information about that in my knowledge base. You can reach Justin directly at StutlerJustin@gmail.com."
