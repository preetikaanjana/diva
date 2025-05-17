from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    # Simple response logic (replace with actual NLP model later)
    response = f"You said: {user_message}"
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5001) 