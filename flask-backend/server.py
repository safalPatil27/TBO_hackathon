from flask import Flask, request, jsonify
import numpy as np
import pickle

app = Flask(__name__)

with open("regressor_model.pkl", "rb") as f:
    regressor = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Function to classify a new sentence
def classify_sentence(input_sentence):
    embedding = vectorizer.transform([input_sentence]).toarray()
    
    scores = regressor.predict(embedding)
    return np.array(scores).flatten()

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict relevance scores for a given input sentence.
    """
    try:
        # Get JSON data
        data = request.json
        input_sentence = data.get("sentence")  
        input_tag_array = data.get("tag_array")  

        # Validate input
        if not input_sentence or not isinstance(input_sentence, str):
            return jsonify({"error": "Invalid or missing 'sentence'. Provide a single sentence as a string."}), 400
        
        if not input_tag_array or not isinstance(input_tag_array, list):
            return jsonify({"error": "Invalid or missing 'tag_array'. Provide a list of tag scores."}), 400

        if len(input_tag_array) != 5:
            return jsonify({"error": "'tag_array' should contain exactly 5 elements."}), 400

        scores = classify_sentence(input_sentence)

        # Define the classes
        classes = ["Temple", "Beach", "Fort", "Lake", "National Park"]

        # Combine the scores with the input tag array and create a priority map
        priority_map = {cls: round(score + tag_score, 2) for cls, score, tag_score in zip(classes, scores, input_tag_array)}

        return jsonify({"priority_map": priority_map}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
