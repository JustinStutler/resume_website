# server/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # Rate Limiting — per IP
    RATE_LIMIT_PER_MINUTE = "20 per minute"
    RATE_LIMIT_PER_DAY = "100 per day"

    # Rate Limiting — global (all users combined)
    RATE_LIMIT_GLOBAL_PER_MINUTE = "50 per minute"
    RATE_LIMIT_GLOBAL_PER_DAY = "500 per day"

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