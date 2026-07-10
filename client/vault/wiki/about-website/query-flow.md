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

User asks a question / submits a query through the frontend ui
the frontend communicates with the backend to kick off the query handling process
the backend makes an api call to openrouter which serves free llms
the llm is tasks to classify if the query is an appropriate query and ends if not
the llm processes the query, looks at a map of a structured knowledge base of markdown files, and retrieves relevant context files
the llm then uses the context to generate its response which allows responses to be grounded in truth

### Failure Cases

If a query is deem inappropriate, the llm will immediately respond with a set response: ""
If a query is appropriate, but the information needed to respond cannot be found, the model will respond with a set response : ""
