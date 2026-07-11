# Wiki Overhaul

## Requirements
- Transfer original website style: dark theme, gradient brand title, permanent section colors, underlined active section.
- Wikipedia-style built-out sections: Dynamically embed subpages inside hub pages (Academics, Projects, Skills) while keeping them modular for LLM. Sections should be collapsible.
- Project Cards UI: Present projects as cards rather than walls of text.
- Technical Skills categorisation: Group by category and color code matching top nav.
- AI Chat formatting: Remove dashes/bullets, use `###` headers, be concise, replace 'see also' with asking a follow-up question.

## Design
- CSS: Dark theme variables (`--bg`, `--surface`, `--ink`), permanent `--c` colors for `.sec`, `.site-brand` linear gradient, `.project-card` styling, `.skill-category` styling.
- JS: Intercept rendering in `view.js`. If current page is a hub page (`academics`, `projects`, `skills`) with `related` pages, dynamically fetch and render them inside the main article, wrapping each in a collapsible `<section>` or wrapping `<h2>` tags.
- Python: Update `ANSWER_SYSTEM_INSTRUCTION` in `server/ai_service.py`.

## Risks
- Dynamic embedding may cause race conditions if `marked.parse` runs asynchronously or if we rewrite links before embedding is complete.
- Custom DOM manipulation for collapsibles might interfere with `marked`'s HTML structure.
