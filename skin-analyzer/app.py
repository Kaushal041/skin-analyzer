from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    # In a real scenario, we would process the image here using a model.
    # For this demo, we implement mock logic.

    skin_types = ["Oily", "Dry", "Normal", "Combination", "Sensitive"]
    conditions_pool = ["Acne", "Pimples", "Dark Spots", "Wrinkles", "Redness", "None"]

    # Randomly simulate analysis for demo purposes
    skin_type = random.choice(skin_types)
    confidence = round(random.uniform(0.7, 0.99), 2)

    # Pick 0 to 2 random conditions
    num_conditions = random.randint(0, 2)
    conditions = random.sample(conditions_pool, num_conditions)
    if "None" in conditions and len(conditions) > 1:
        conditions.remove("None")
    elif len(conditions) == 0:
        conditions = ["None"]

    return jsonify({
        "skin_type": skin_type,
        "conditions": conditions,
        "confidence": confidence
    })

if __name__ == '__main__':
    app.run(debug=True)
