from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import openai
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Use API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json
    subject = data.get('subject')
    num_cards = data.get('numCards', 5)
    
    if not subject:
        return jsonify({"error": "Subject is required"}), 400
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that creates flashcards for studying."
                },
                {
                    "role": "user",
                    "content": f'Create {num_cards} flashcards about "{subject}". Format your response as a JSON object with a "flashcards" array, where each item has a "question" and "answer" property. Make the flashcards educational and well-structured.'
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Get the content from the response
        content = response.choices[0].message.content
        
        # Return the full response to the client
        return jsonify({"content": content})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)