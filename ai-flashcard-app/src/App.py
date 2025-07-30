from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3"  # You can switch to llama3, mistral, etc.

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json
    subject = data.get('subject')
    num_cards = data.get('numCards', 5)

    if not subject:
        return jsonify({"error": "Subject is required"}), 400

    try:
        prompt = (
            f"Generate {num_cards} flashcards about '{subject}' in JSON array format. "
            f"Each flashcard should look like this: "
            f'{{"question": "What is X?", "answer": "Explanation of X"}}. '
            f"Return only raw JSON, without formatting it inside triple backticks or as markdown."
        )

        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        })

        print("Ollama Status:", response.status_code)
        print("Raw Ollama Response Text:", response.text)

        if response.status_code != 200:
            return jsonify({"error": f"Ollama Error: {response.text}"}), response.status_code

        result = response.json()
        raw_text = result.get("response", "").strip()

        # Remove triple backticks if present
        if raw_text.startswith("```"):
            # Remove code block markers like ```json or ```
            cleaned_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.DOTALL).strip()
        else:
            cleaned_text = raw_text

        flashcards = json.loads(cleaned_text)

        return jsonify({"flashcards": flashcards[:num_cards]})

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Using Ollama model:", MODEL_NAME)
    app.run(debug=True, port=5000)
