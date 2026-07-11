# server/ai_service.py
import json
import os
import re
from openai import OpenAI
from config import Config
from vault_loader import VAULT, INDEX_SUMMARY, expand_related

# 1. Initialize Client
if not Config.OPENROUTER_API_KEY:
    print("CRITICAL WARNING: OPENROUTER_API_KEY not found.")
    client = None
else:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=Config.OPENROUTER_API_KEY,
    )

# 2. Config
MODEL_NAME = "openrouter/free"

ANSWER_SYSTEM_INSTRUCTION = """You are an AI assistant on Justin Stutler's portfolio website. Visitors come here to learn about Justin as a candidate, professional, and person.

RULES:
- Base all answers EXCLUSIVELY on the provided CONTEXT CHUNKS. Do not use external knowledge.
- Always refer to Justin in third person (e.g., "Justin's GRE scores are..." not "Your scores are...").
- Provide helpful, concise, and professional answers.
- When sharing links (GitHub, LinkedIn, email, portfolio), always include them directly so visitors can click through.

FORMATTING:
- Be EXTREMELY concise. Keep responses as short as possible without losing the core information.
- Do NOT use bullet points or dashes (-) for lists or organization.
- Use `###` headers to define sections and organize information cleanly.
- Answer in natural, fluid prose with short paragraphs.
- Use **bold** sparingly for key labels or terms. Always include links inline so visitors can click through.

The knowledge base is a Wikipedia-style tree of small section pages (academics, career, projects,
skills, personal, and this website). The context you receive is the specific section(s) selected
for this query — answer from them precisely, at the granularity of the question.

HOW TO HANDLE COMMON QUERY TYPES:
- "Tell me about Justin" / general intro → Give a warm, professional overview covering education, skills, goals, and experience.
- "Tell me about his projects" / "What has he worked on?" → Describe the relevant projects with technologies used and what he accomplished. For a single project, focus on its goals, methods, and technologies.
- "What are his skills?" → List technical skills organized by category (AI & Machine Learning, Data Science & Mathematics, Software Engineering, Web Development, foundations), and highlight AI/ML as his strongest area. For a specific category, answer just that category.
- "Tell me about his education" / a specific school → Cover the relevant institution(s) with degree, concentration, GPA, and timeline (Milton High School → University of North Georgia → Kennesaw State → USF undergraduate → USF graduate). GRE scores are available if asked.
- "Tell me about his work experience" / a specific role → Detail his professional roles (MagMutual Insurance, PieHole) with context about what he did and learned, plus his current career direction.
- "What does he do for fun?" / hobbies / personality → Cover his hobbies (DJing, Brazilian Jiu-Jitsu) and his autotelic personality (embracing challenge for its own sake, including sourdough baking).
- "Is Justin a good fit for [job role]?" → Match Justin's skills, experience, and education against what that role typically requires. Be honest and specific about what aligns and what he's still building. Always be professional and positive.
- "GitHub" / "LinkedIn" / "contact" / "links" → Provide the relevant links: GitHub (https://github.com/JustinStutler), LinkedIn (https://www.linkedin.com/in/justin-stutler-a72b961a8), Email (StutlerJustin@gmail.com), Portfolio (https://JustinStutlerAI.netlify.app/).
- "Tell me about [specific project]" → Give a focused description of that project including goals, methods, and technologies.
- "How does this work?" / "tech stack" / "What powers this?" → Explain the portfolio website's architecture: the LLM Wiki approach (inspired by Andrej Karpathy's gist), the Obsidian-style vault organized as a navigable Wikipedia-style tree of sections, the three-stage pipeline (scope guard → context selection → answer generation), and the tech stack (Flask on Render, OpenRouter free-tier models, vanilla-JS frontend on Netlify). Link to the Karpathy gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

FOLLOW UP:
- End every substantive answer with a relevant follow-up question related to the user's query and the provided context. This encourages further interaction. Omit it entirely for greetings or when the context does not contain the answer.

If the context does not contain the answer, say: "I don't have specific information about that in my knowledge base. You can reach Justin directly at StutlerJustin@gmail.com."
"""

def extract_json(text):
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        return match.group(0)
    return text

def select_context(user_query, history_last_4):
    """Select relevant vault page IDs for the given query.

    Returns a list of page ID strings from the vault.
    """
    if not client:
        return ["tell-me-about"]

    # Quick short-circuit for trivial greetings (exact match or standalone words only)
    query_lower = user_query.lower().strip()
    greeting_only = query_lower in ("hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye")
    if greeting_only:
        return []

    prompt = f"""Based on the user's query, identify which knowledge pages are relevant.

The knowledge base is organized as a wiki tree (indentation shows parent -> child).
Prefer the most specific page(s) that answer the query rather than a broad hub page.
Respond ONLY with a valid JSON array of page ID strings (e.g., ["id1", "id2"]).
Select the most relevant pages (typically 1-3). Do not select all pages. Do not include markdown formatting or explanation.

Knowledge Base Map:
{INDEX_SUMMARY}

User Query: "{user_query}"
"""

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content.strip()
        content = extract_json(content)
        selected = json.loads(content)

        # Validate returned IDs, then pull in 1-hop related neighbours (bounded)
        valid = [pid for pid in selected if pid in VAULT]
        return expand_related(VAULT, valid)
    except Exception as e:
        print(f"Context selection error: {e}")
        return ["tell-me-about"]

def generate_answer(user_query, history, page_ids):
    """Generate an answer using selected vault pages as context."""
    if not client:
        return "Error: API Key missing."

    # 1. Build context from vault pages
    context_text = ""
    if page_ids:
        for pid in page_ids:
            if pid in VAULT:
                page = VAULT[pid]
                context_text += (
                    f"\n---BEGIN CONTEXT: {page['title']}---\n"
                    f"{page['content']}\n"
                    f"---END CONTEXT---\n"
                )
    if not context_text and "tell-me-about" in VAULT:
        page = VAULT["tell-me-about"]
        context_text = (
            f"---BEGIN CONTEXT: {page['title']}---\n"
            f"{page['content']}\n"
            f"---END CONTEXT---"
        )

    final_prompt = f"{context_text}\n\nUser's current query: \"{user_query}\""

    # 2. Convert history to SDK format
    messages = [{"role": "system", "content": ANSWER_SYSTEM_INSTRUCTION}]
    
    if history:
        for turn in history:
            role = 'user' if turn.get('role') == 'user' else 'assistant'
            text_content = ""
            if 'parts' in turn and len(turn['parts']) > 0:
                text_content = turn['parts'][0].get('text', "")
            if text_content:
                messages.append({"role": role, "content": text_content})
                
    messages.append({"role": "user", "content": final_prompt})

    # 3. Generate
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Generation error details: {e}")
        return "I encountered an error while communicating with the AI service."
