# server/ai_service.py
import json
import os
from google import genai
from google.genai import types
from config import Config
from context_loader import CONTEXT_CHUNKS

# 1. Initialize Client
if not Config.GEMINI_API_KEY:
    print("CRITICAL WARNING: GEMINI_API_KEY not found.")
    client = None
else:
    client = genai.Client(api_key=Config.GEMINI_API_KEY)

# 2. Config
# We use the specific '002' version which is stable on the new v1beta API
# Use the exact ID from your list
MODEL_NAME = "gemini-2.0-flash-lite"

ANSWER_SYSTEM_INSTRUCTION = """You are an AI assistant for Justin Stutler's portfolio.
Base your answers *exclusively* on the provided CONTEXT CHUNK(S) and conversation history.
Do not use external knowledge.
If the answer is not in the context, state: "I'm sorry, I don't have information on that specific topic based on the provided context."
Provide helpful, concise, and professional answers.
"""

def get_context_descriptions():
    descriptions = []
    for key, value in CONTEXT_CHUNKS.items():
        descriptions.append(f"- ID: \"{key}\", Description: \"{value['description']}\"")
    return "\n".join(descriptions)

def select_context(user_query, history_last_4):
    if not client: return ["tell_me_about"]
    
    # Quick trivial check
    if any(phrase in user_query.lower() for phrase in ["hello", "hi", "thanks", "bye"]):
        return []

    prompt = f"""
    Based on the user's query and recent conversation history, identify which context chunks are relevant.
    Respond ONLY with a valid JSON array of context chunk IDs (strings).
    Available Context Chunks:
    {get_context_descriptions()}

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
        return json.loads(response.text)
    except Exception as e:
        print(f"Context selection error: {e}")
        # Fallback to general context if selection fails
        return ["tell_me_about"]

def generate_answer(user_query, history, context_keys):
    if not client: return "Error: API Key missing."

    # 1. Build Context
    context_text = ""
    if context_keys:
        for key in context_keys:
            if key in CONTEXT_CHUNKS:
                chunk = CONTEXT_CHUNKS[key]
                context_text += f"\n---BEGIN CONTEXT: {chunk['description']}---\n{chunk['content']}\n---END CONTEXT---\n"
    elif "tell_me_about" in CONTEXT_CHUNKS:
        chunk = CONTEXT_CHUNKS["tell_me_about"]
        context_text = f"---BEGIN CONTEXT---\n{chunk['content']}\n---END CONTEXT---"

    final_prompt = f"{context_text}\n\nUser's current query: \"{user_query}\""

    # 2. Convert History to new SDK format
    # The new SDK requires specific types.Content objects
    formatted_history = []
    if history:
        for turn in history:
            # Map 'role' to exactly what the SDK expects
            role = 'user' if turn.get('role') == 'user' else 'model'
            # Extract text safely
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
        # We create a chat session
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