from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    user_message = data.get('message', '')

    # Process user_message with NLP here
    # For now, send a dummy response
    bot_response = f"You said: {user_message}"

    return jsonify({'response': bot_response})

if __name__ == '__main__':
    # In a real application, use a production-ready server like Gunicorn or uWSGI
    app.run(debug=True)
    # print("Flask chatbot backend started. Run with 'python ai/app.py'") # Placeholder print for now 