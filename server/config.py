# server/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # CORS Settings
    # Add your production URL here when you deploy
    ALLOWED_ORIGINS = [
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        os.getenv("NETLIFY_APP_URL"), # Optional: from env
    ]

    # Clean up the list to remove None or empty values
    ALLOWED_ORIGINS = [url.rstrip('/') for url in ALLOWED_ORIGINS if url]