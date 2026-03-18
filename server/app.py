# server/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import ai_service
from config import Config

app = Flask(__name__)

# Basic CORS setup (allows everything by default, but we fine-tune in handlers)
CORS(app)

# Rate limiter — uses X-Forwarded-For on Render (proxy), falls back to remote addr
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[],
    headers_enabled=True,
)

@app.errorhandler(429)
def rate_limit_exceeded(e):
    response = jsonify({"error": "Too many requests. Please wait a moment before asking again."})
    origin = request.headers.get('Origin')
    if origin in Config.ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
    return response, 429

@app.route('/ask', methods=['POST', 'OPTIONS'])
@limiter.limit(Config.RATE_LIMIT_PER_MINUTE)
@limiter.limit(Config.RATE_LIMIT_PER_DAY)
@limiter.limit(Config.RATE_LIMIT_GLOBAL_PER_MINUTE, key_func=lambda: "global")
@limiter.limit(Config.RATE_LIMIT_GLOBAL_PER_DAY, key_func=lambda: "global")
def ask_justin_ai():
    # --- 1. CORS Preflight Handling ---
    if request.method == 'OPTIONS':
        response = make_response()
        origin = request.headers.get('Origin')
        
        # Check if origin is allowed
        if origin in Config.ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        
        return response

    # --- 2. POST Request Handling ---
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Invalid request: 'query' is required."}), 400

        user_query = data['query'].strip()
        raw_history = data.get('history', [])

        # Validate/Clean History for Gemini
        valid_history = [
            {'role': item['role'], 'parts': item['parts']}
            for item in raw_history
            if 'role' in item and 'parts' in item
        ]

        # A. Select Context (The "Router")
        selected_keys = ai_service.select_context(user_query, valid_history[-4:])
        print(f"DEBUG: Query: '{user_query}' -> Selected Context: {selected_keys}")

        # B. Generate Answer (The "Generator")
        bot_response = ai_service.generate_answer(user_query, valid_history, selected_keys)

        # C. Construct Response
        response = jsonify({"response": bot_response})
        
        # Add CORS header to the actual response
        origin = request.headers.get('Origin')
        if origin in Config.ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
            
        return response, 200

    except Exception as e:
        print(f"SERVER ERROR: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)