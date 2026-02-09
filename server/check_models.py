# server/check_models.py
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

print("--- Available Models ---")
try:
    for model in client.models.list():
        # filter for generation models
        if 'generateContent' in model.supported_actions:
            print(f"Model ID: {model.name}")
            print(f"   - Display Name: {model.display_name}")
except Exception as e:
    print(f"Error listing models: {e}")