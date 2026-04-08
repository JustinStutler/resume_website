# server/ai_service.py
import json
import os
from google import genai
from google.genai import types
from config import Config
from vault_loader import VAULT, INDEX_SUMMARY

# 1. Initialize Client
if not Config.GEMINI_API_KEY:
    print("CRITICAL WARNING: GEMINI_API_KEY not found.")
    client = None
else:
    client = genai.Client(api_key=Config.GEMINI_API_KEY)

# 2. Config
MODEL_NAME = "gemini-2.5-flash-lite"

ANSWER_SYSTEM_INSTRUCTION = """You are an AI assistant on Justin Stutler's portfolio website. Visitors come here to learn about Justin as a candidate, professional, and person.

RULES:
- Base all answers EXCLUSIVELY on the provided CONTEXT CHUNKS. Do not use external knowledge.
- Always refer to Justin in third person (e.g., "Justin's GRE scores are..." not "Your scores are...").
- Provide helpful, concise, and professional answers. Use markdown formatting when appropriate.
- When sharing links (GitHub, LinkedIn, email, portfolio), always include them directly so visitors can click through.

HOW TO HANDLE COMMON QUERY TYPES:
- "Tell me about Justin" / general intro → Give a warm, professional overview covering education, skills, goals, and experience.
- "Tell me about his projects" / "What has he worked on?" → Describe specific projects with technologies used and what he accomplished.
- "What are his skills?" → List technical skills organized by category, highlight strongest areas.
- "Is Justin a good fit for [job role]?" → Match Justin's skills, experience, and education against what that role typically requires. Be honest and specific about what aligns and what he's still building. Always be professional and positive.
- "GitHub" / "LinkedIn" / "contact" / "links" → Provide the relevant links: GitHub (https://github.com/JustinStutler), LinkedIn (https://www.linkedin.com/in/justin-stutler-a72b961a8), Email (StutlerJustin@gmail.com), Portfolio (https://JustinStutlerAI.netlify.app/).
- "Tell me about his work experience" → Detail his professional roles with context about what he did and learned.
- "Tell me about [specific project]" → Give a focused description of that project including goals, methods, and technologies.
- "How does this work?" / "How does this website work?" / "How does his portfolio work?" / "What powers this?" → Explain the portfolio website's architecture: the LLM Wiki approach (inspired by Andrej Karpathy's gist), the Obsidian vault knowledge base, the three-stage pipeline (scope guard → context selection → answer generation), and the tech stack. Link to the Karpathy gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

If the context does not contain the answer, say: "I don't have specific information about that in my knowledge base. You can reach Justin directly at StutlerJustin@gmail.com."
"""


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
Respond ONLY with a valid JSON array of page ID strings.
Select the most relevant pages (typically 1-4). Do not select all pages.

Available Pages:
{INDEX_SUMMARY}

User Query: "{user_query}"
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        selected = json.loads(response.text)
        # Validate that returned IDs actually exist in the vault
        return [pid for pid in selected if pid in VAULT]
    except Exception as e:
        print(f"Context selection error: {e}")
        return ["tell-me-about"]


def generate_answer(user_query, history, page_ids):
    """Generate an answer using selected vault pages as context.

    Args:
        user_query: The user's question.
        history: Conversation history as list of {role, parts} dicts.
        page_ids: List of vault page IDs to use as context.
    """
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
    formatted_history = []
    if history:
        for turn in history:
            role = 'user' if turn.get('role') == 'user' else 'model'
            text_content = ""
            if 'parts' in turn and len(turn['parts']) > 0:
                text_content = turn['parts'][0].get('text', "")

            if text_content:
                formatted_history.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=text_content)]
                ))

    # 3. Generate
    try:
        chat = client.chats.create(
            model=MODEL_NAME,
            config=types.GenerateContentConfig(
                system_instruction=ANSWER_SYSTEM_INSTRUCTION
            ),
            history=formatted_history
        )

        response = chat.send_message(final_prompt)
        return response.text
    except Exception as e:
        print(f"Generation error details: {e}")
        return "I encountered an error while communicating with the AI service."
