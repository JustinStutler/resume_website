## How This Project Works

This portfolio website operates as an AI-powered conversational interface, inspired by Andrej Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) concept. It's designed to provide visitors with information about Justin Stutler through interactive dialogue.

### Core Architecture

The system utilizes a three-stage pipeline:

1. **Scope Guard:** A quick check determines if the user's question is relevant to Justin or his portfolio. If not, the AI politely redirects the conversation.
2. **Context Selection:** The system intelligently searches a curated knowledge base (an Obsidian-style markdown vault) for information pertinent to the user's query. It identifies and selects the most relevant synthesized pages rather than just raw text chunks.
3. **Answer Generation:** The selected context is fed into a Google Gemini model, which generates a grounded and accurate answer based solely on the provided information.

### Knowledge Base

The foundation of this system is a structured knowledge base maintained in markdown files, similar to Obsidian. This "wiki" synthesizes information from Justin's raw sources (resume, transcripts, etc.) into interconnected pages covering his projects, skills, and experience. This approach offers advantages over traditional Retrieval-Augmented Generation (RAG) by providing synthesized context, better cross-referencing, and human curation for improved accuracy.

### Technologies

- **Backend:** Python Flask API hosted on Render.
- **AI Model:** Google Gemini (specifically gemini-2.5-flash-lite).
- **Frontend:** Vanilla JavaScript, HTML, and CSS deployed on Netlify.
- **Knowledge Storage:** Markdown files organized as a vault.
